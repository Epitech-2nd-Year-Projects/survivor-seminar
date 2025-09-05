package sync

import (
	"context"
	"github.com/sirupsen/logrus"
)

// MultiService composes multiple Syncer services and runs them sequentially
type MultiService struct {
	services []Syncer
	log      *logrus.Logger
}

// NewMultiService creates and returns a MultiService instance that sequentially composes and manages multiple Syncer services
func NewMultiService(services []Syncer, log *logrus.Logger) *MultiService {
	return &MultiService{services: services, log: log}
}

// FullSync runs the FullSync method on all underlying services sequentially, accumulating results and recording errors
func (m *MultiService) FullSync(ctx context.Context) (int, error) {
	total := 0
	var lastErr error
	for _, s := range m.services {
		n, err := s.FullSync(ctx)
		total += n
		if err != nil {
			lastErr = err
			m.log.WithError(err).Warn("multisync: FullSync sub-service failed")
		}
	}
	return total, lastErr
}

// IncrementalSync executes the IncrementalSync method on all underlying services sequentially, summing results and handling errors
func (m *MultiService) IncrementalSync(ctx context.Context) (int, error) {
	total := 0
	var lastErr error
	for _, s := range m.services {
		n, err := s.IncrementalSync(ctx)
		total += n
		if err != nil {
			lastErr = err
			m.log.WithError(err).Warn("multisync: IncrementalSync sub-service failed")
		}
	}
	return total, lastErr
}
