package sync

import (
	"sync"
	"time"
)

type RunInfo struct {
	Type      string
	StartedAt time.Time
	EndedAt   time.Time
	Success   bool
	Error     string
}

type StatusSnapshot struct {
	LastFull        *RunInfo
	LastIncremental *RunInfo
	Running         bool
	QueueLen        int
}

type statusStore struct {
	mu              sync.RWMutex
	lastFull        *RunInfo
	lastIncremental *RunInfo
	running         bool
}

func newStatusStore() *statusStore { return &statusStore{} }

func (s *statusStore) setRunning(v bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.running = v
}

func (s *statusStore) setLast(run RunInfo) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if run.Type == "full" {
		s.lastFull = &run
	} else {
		s.lastIncremental = &run
	}
}

// snapshot returns a StatusSnapshot containing the current state of the statusStore, including the last full and incremental runs
func (s *statusStore) snapshot() StatusSnapshot {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return StatusSnapshot{
		LastFull:        s.lastFull,
		LastIncremental: s.lastIncremental,
		Running:         s.running,
		QueueLen:        0,
	}
}
