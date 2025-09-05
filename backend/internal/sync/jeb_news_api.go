package sync

import (
	"context"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/client/jeb"
)

// JEBNewsAPI implements ExternalAPI for news using the JEB client
type JEBNewsAPI struct {
	c *jeb.Client
}

// NewJEBNewsAPI creates a new instance of JEBNewsAPI with the provided JEB client
func NewJEBNewsAPI(c *jeb.Client) *JEBNewsAPI {
	return &JEBNewsAPI{c: c}
}

// FetchFull retrieves all news and their detailed information from the JEB API, returning a list of UpstreamItems
func (a *JEBNewsAPI) FetchFull(ctx context.Context) ([]UpstreamItem, error) {
	skip := 0
	items := make([]UpstreamItem, 0, 256)
	for {
		lst, err := a.c.ReadNews(ctx, skip, pageSize)
		if err != nil {
			return nil, err
		}
		if len(lst) == 0 {
			break
		}
		for _, it := range lst {
			d, err := a.c.ReadNewsDetail(ctx, it.ID)
			if err != nil {
				return nil, err
			}
			payload := map[string]any{
				"id":          d.ID,
				"title":       d.Title,
				"news_date":   d.NewsDate,
				"location":    d.Location,
				"category":    d.Category,
				"startup_id":  d.StartupID,
				"description": d.Description,
			}
			items = append(items, UpstreamItem{
				ExternalID: int64ToString(d.ID),
				Payload:    payload,
				UpdatedAt:  time.Now().UTC(),
			})
		}
		skip += len(lst)
	}
	return items, nil
}

// FetchIncremental falls back to full fetch as the public API does not provide updated filters
func (a *JEBNewsAPI) FetchIncremental(ctx context.Context, since time.Time) ([]UpstreamItem, error) {
	return a.FetchFull(ctx)
}
