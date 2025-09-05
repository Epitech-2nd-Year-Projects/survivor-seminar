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

// ExternalAPI defines methods for interacting with an external data source to fetch incremental or full datasets.
// FetchIncremental retrieves updated data since the given timestamp from the external system.
// FetchFull retrieves the entire dataset from the external system for full synchronization.
type ExternalAPI interface {
	FetchIncremental(ctx context.Context, since time.Time) ([]UpstreamItem, error)
	FetchFull(ctx context.Context) ([]UpstreamItem, error)
}

// Repository abstracts DB persistence for synced data.
type Repository interface {
	UpsertBatch(ctx context.Context, items []UpstreamItem) error
	LastIncrementalWatermark(ctx context.Context) (time.Time, error)
	UpdateIncrementalWatermark(ctx context.Context, ts time.Time) error
}

// UpstreamItem represents a data entity fetched from an external source for synchronization into the system.
// ExternalID is a unique identifier for the item in the upstream system.
// Payload contains the data associated with the item as a map of key-value pairs.
// UpdatedAt is the last modification timestamp of the item.
type UpstreamItem struct {
	ExternalID string
	Payload    map[string]any
	UpdatedAt  time.Time
}
