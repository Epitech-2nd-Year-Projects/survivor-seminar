package sync

import (
	"context"
	"time"

	"github.com/robfig/cron/v3"
	"github.com/sirupsen/logrus"
)

type scheduler struct {
	c       *cron.Cron
	svc     Syncer
	log     *logrus.Logger
	status  *statusStore
	queueCh chan queuedJob
}

type queuedJob struct {
	fn    func(context.Context)
	label string
}

// NewScheduler creates a new Scheduler instance with a cron job dispatcher, service, and logger
func NewScheduler(svc Syncer, log *logrus.Logger) Scheduler {
	clog := cronLogger{
		log: log,
	}

	c := cron.New(
		cron.WithParser(cron.NewParser(cron.SecondOptional|cron.Minute|cron.Hour|cron.Dom|cron.Month|cron.Dow|cron.Descriptor)),
		cron.WithChain(
			cron.SkipIfStillRunning(clog),
			cron.Recover(clog),
		),
	)

	return &scheduler{
		c:       c,
		svc:     svc,
		log:     log,
		status:  newStatusStore(),
		queueCh: make(chan queuedJob, 8),
	}
}

// Start initializes the scheduler and begins processing queued jobs in a separate goroutine
func (s *scheduler) Start(ctx context.Context) error {
	s.log.Info("scheduler: starting")

	go func() {
		for {
			select {
			case job := <-s.queueCh:
				s.runJob(ctx, job.fn, job.label)
			case <-ctx.Done():
				return
			}
		}
	}()

	s.c.Start()
	return nil
}

// Stop halts all scheduled tasks and stops the scheduler gracefully. Returns any encountered error during the process
func (s *scheduler) Stop(ctx context.Context) error {
	s.log.Info("scheduler: stopping")
	s.c.Stop()
	return nil
}

// Schedule adds a job to the scheduler with a specified cron expression and label, returning the job's EntryID or an error
func (s *scheduler) Schedule(spec string, job func(context.Context), label string) (cron.EntryID, error) {
	return s.c.AddFunc(spec, func() {
		s.runJob(context.Background(), job, label)
	})
}

// runJob executes a job function within the provided context and logs its lifecycle using the specified label
func (s *scheduler) runJob(ctx context.Context, job func(context.Context), label string) {
	s.status.setRunning(true)
	started := time.Now()
	info := RunInfo{Type: label, StartedAt: started}

	s.log.WithField("job", label).Info("scheduler: job start")

	defer func() {
		info.EndedAt = time.Now()
		s.status.setLast(info)
		s.status.setRunning(false)
		s.log.WithFields(logrus.Fields{"job": label, "duration": time.Since(started)}).Info("scheduler: job end")
	}()

	defer func() {
		if r := recover(); r != nil {
			info.Success = false
			info.Error = "panic"
		}
	}()

	if err := s.safeRun(ctx, job); err != nil {
		info.Success = false
		info.Error = err.Error()
		return
	}
	info.Success = true
}

// safeRun safely executes a job within the provided context and returns an error if the job fails or panics
func (s *scheduler) safeRun(ctx context.Context, job func(context.Context)) (err error) {
	job(ctx)
	return nil
}

// TriggerFullSync enqueues a full synchronization job to the scheduler's queue. Returns an error if the queue is full
func (s *scheduler) TriggerFullSync(ctx context.Context) error {
	select {
	case s.queueCh <- queuedJob{label: "full", fn: func(ctx context.Context) {
		n, err := s.svc.FullSync(ctx)
		if err != nil {
			s.log.WithError(err).Error("s.svc.FullSync()")
		} else {
			s.log.WithField("count", n).Info("scheduler: full sync completed")
		}
	}}:
		return nil
	default:
		return nil
	}
}

// TriggerIncrementalSync enqueues an incremental synchronization job in the scheduler's queue. Returns an error if the queue is full
func (s *scheduler) TriggerIncrementalSync(ctx context.Context) error {
	select {
	case s.queueCh <- queuedJob{label: "incremental", fn: func(ctx context.Context) {
		n, err := s.svc.IncrementalSync(ctx)
		if err != nil {
			s.log.WithError(err).Error("s.svc.IncrementalSync()")
		} else {
			s.log.WithField("count", n).Info("scheduler: incremental sync completed")
		}
	}}:
		return nil
	default:
		return nil
	}
}

func (s *scheduler) Status() StatusSnapshot {
	ss := s.status.snapshot()
	ss.QueueLen = len(s.queueCh)
	return ss
}
