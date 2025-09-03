package sync

import (
	"context"
	"strconv"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/client/jeb"
)

const (
	pageSize = 200
)

// JEBStartupsAPI implements ExternalAPI for startups using the JEB client.
type JEBStartupsAPI struct {
	c *jeb.Client
}

// NewJEBStartupsAPI creates a new instance of JEBStartupsAPI with the provided JEB client.
func NewJEBStartupsAPI(c *jeb.Client) *JEBStartupsAPI {
	return &JEBStartupsAPI{
		c: c,
	}
}

// FetchFull retrieves all startups and their detailed information from the JEB API, returning a list of UpstreamItems.
func (a *JEBStartupsAPI) FetchFull(ctx context.Context) ([]UpstreamItem, error) {
	skip := 0
	items := make([]UpstreamItem, 0, 256)
	for {
		lst, err := a.c.ReadStartups(ctx, skip, pageSize)
		if err != nil {
			return nil, err
		}
		if len(lst) == 0 {
			break
		}
		for _, it := range lst {
			d, err := a.c.ReadStartupDetail(ctx, it.ID)
			if err != nil {
				return nil, err
			}
			payload := map[string]any{
				"id":               d.ID,
				"name":             d.Name,
				"legal_status":     d.LegalStatus,
				"address":          d.Address,
				"email":            d.Email,
				"phone":            d.Phone,
				"created_at":       d.CreatedAt,
				"description":      d.Description,
				"website_url":      d.WebsiteURL,
				"social_media_url": d.SocialMediaURL,
				"project_status":   d.ProjectStatus,
				"needs":            d.Needs,
				"sector":           d.Sector,
				"maturity":         d.Maturity,
				"founders":         d.Founders,
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

func (a *JEBStartupsAPI) FetchIncremental(ctx context.Context, since time.Time) ([]UpstreamItem, error) {
	// The public API does not expose updated/modified timestamps nor since filters.
	// For now, fallback to full fetch.
	return a.FetchFull(ctx)
}

func int64ToString(v int64) string { return fmtInt(v) }

func fmtInt(v int64) string { return strconv.FormatInt(v, 10) }
