package sync

import (
	"context"
	"github.com/robfig/cron/v3"
	"time"
)

// Scheduler defines the contract to manage sync jobs lifecycle.
type Scheduler interface {
	Start(ctx context.Context) error
	Stop(ctx context.Context) error
	TriggerFullSync(ctx context.Context) error
	TriggerIncrementalSync(ctx context.Context) error
	Status() StatusSnapshot
	Schedule(spec string, job func(context.Context), label string) (cron.EntryID, error)
}

// ExternalAPI abstracts the upstream data provider.
// In production, implement this against the real HTTP API.
type ExternalAPI interface {
	FetchIncremental(ctx context.Context, since time.Time) ([]UpstreamItem, error)
	FetchFull(ctx context.Context) ([]UpstreamItem, error)
}

// Repository abstracts DB persistence for synced data.
type Repository interface {
	UpsertBatch(ctx context.Context, items []UpstreamItem) error
	SoftDeleteMissing(ctx context.Context, existingExternalIDs map[string]struct{}) error
	LastIncrementalWatermark(ctx context.Context) (time.Time, error)
	UpdateIncrementalWatermark(ctx context.Context, ts time.Time) error
}

// UpstreamItem is a minimal placeholder for external data.
// Replace/extend with concrete fields relevant to your domain.
type UpstreamItem struct {
	ExternalID string
	Payload    map[string]any
	UpdatedAt  time.Time
}
