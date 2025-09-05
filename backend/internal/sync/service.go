package sync

import (
	"context"
	"time"

	"github.com/sirupsen/logrus"
)

type Service struct {
	api  ExternalAPI
	repo Repository
	log  *logrus.Logger
}

// Syncer is the minimal interface needed by the scheduler to run syncs
type Syncer interface {
	FullSync(ctx context.Context) (int, error)
	IncrementalSync(ctx context.Context) (int, error)
}

// NewService initializes a new Service instance with the given API, repository, logger, and soft delete configuration
func NewService(api ExternalAPI, repo Repository, log *logrus.Logger) *Service {
	return &Service{
		api:  api,
		repo: repo,
		log:  log,
	}
}

// FullSync performs a full synchronization by fetching all records from the external API and upserting them into the repository
// If soft deletion is enabled, it marks records not present in the latest fetch as soft deleted
// Returns the number of records synchronized and any error encountered during the process
func (s *Service) FullSync(ctx context.Context) (int, error) {
	s.log.Info("sync: starting full import")

	items, err := s.api.FetchFull(ctx)
	if err != nil {
		s.log.WithError(err).Error("s.api.FetchFull()")
		return 0, err
	}
	s.log.Info("sync: all data fetch")

	if err := s.repo.UpsertBatch(ctx, items); err != nil {
		s.log.WithError(err).WithField("count", len(items)).Error("s.repo.UpsertBatch()")
		return 0, err
	}
	s.log.Info("sync: all data upsert")

	if err := s.repo.UpdateIncrementalWatermark(ctx, time.Now().UTC()); err != nil {
		s.log.WithError(err).Warn("s.repo.UpdateIncrementalWatermark")
	}
	s.log.WithField("count", len(items)).Info("sync: full import done")

	return len(items), nil
}

// IncrementalSync performs an incremental synchronization by fetching changes since the last recorded watermark
// Retrieves updated data from the external API, upserts it into the repository, and updates the incremental watermark
// Returns the count of records synchronized and any error encountered during the process
func (s *Service) IncrementalSync(ctx context.Context) (int, error) {
	since, err := s.repo.LastIncrementalWatermark(ctx)
	if err != nil {
		s.log.WithError(err).Warn("s.repo.LastIncrementalWatermark")
		since = time.Now().Add(-24 * time.Hour)
	}

	s.log.WithField("since", since).Info("sync: starting incremental")

	items, err := s.api.FetchIncremental(ctx, since)
	if err != nil {
		s.log.WithError(err).WithField("since", since).Error("s.api.FetchIncremental")
		return 0, err
	}

	if err := s.repo.UpsertBatch(ctx, items); err != nil {
		s.log.WithError(err).WithField("count", len(items)).Error("s.repo.UpsertBatch()")
		return 0, err
	}

	next := time.Now().UTC()
	for _, it := range items {
		if it.UpdatedAt.After(next) {
			next = it.UpdatedAt
		}
	}

	if err := s.repo.UpdateIncrementalWatermark(ctx, next); err != nil {
		s.log.WithError(err).WithField("watermark", next).Error("s.repo.UpdateIncrementalWatermark")
		return len(items), err
	}
	s.log.WithField("count", len(items)).Info("sync: incremental done")
	return len(items), nil
}
