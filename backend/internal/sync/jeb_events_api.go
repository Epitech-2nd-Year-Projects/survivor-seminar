package sync

import (
	"context"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/client/jeb"
)

// JEBEventsAPI implements ExternalAPI for events using the JEB client
type JEBEventsAPI struct {
	c *jeb.Client
}

// NewJEBEventsAPI creates a new instance of JEBEventsAPI with the provided JEB client
func NewJEBEventsAPI(c *jeb.Client) *JEBEventsAPI { return &JEBEventsAPI{c: c} }

// FetchFull retrieves all events from the JEB API; the list contains all fields so no detail calls.
func (a *JEBEventsAPI) FetchFull(ctx context.Context) ([]UpstreamItem, error) {
	skip := 0
	items := make([]UpstreamItem, 0, 256)
	for {
		lst, err := a.c.ReadEvents(ctx, skip, pageSize)
		if err != nil {
			return nil, err
		}
		if len(lst) == 0 {
			break
		}
		for _, it := range lst {
			payload := map[string]any{
				"id":              it.ID,
				"name":            it.Name,
				"dates":           it.Dates,
				"location":        it.Location,
				"description":     it.Description,
				"event_type":      it.EventType,
				"target_audience": it.TargetAudience,
			}
			items = append(items, UpstreamItem{
				ExternalID: int64ToString(it.ID),
				Payload:    payload,
				UpdatedAt:  time.Now().UTC(),
			})
		}
		skip += len(lst)
	}
	return items, nil
}

// FetchIncremental falls back to full fetch as the public API does not provide updated filters
func (a *JEBEventsAPI) FetchIncremental(ctx context.Context, since time.Time) ([]UpstreamItem, error) {
	return a.FetchFull(ctx)
}
