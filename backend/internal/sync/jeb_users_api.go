package sync

import (
	"context"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/client/jeb"
)

// JEBUsersAPI implements ExternalAPI for users using the JEB client.
type JEBUsersAPI struct{ c *jeb.Client }

// NewJEBUsersAPI creates a new instance of JEBUsersAPI using the provided JEB client.
func NewJEBUsersAPI(c *jeb.Client) *JEBUsersAPI { return &JEBUsersAPI{c: c} }

// FetchFull retrieves the complete list of users from the JEB API as a single operation since pagination is not supported.
func (a *JEBUsersAPI) FetchFull(ctx context.Context) ([]UpstreamItem, error) {
	lst, err := a.c.ReadUsers(ctx, 0, 0)
	if err != nil {
		return nil, err
	}
	items := make([]UpstreamItem, 0, len(lst))
	for _, it := range lst {
		payload := map[string]any{
			"id":          it.ID,
			"email":       it.Email,
			"name":        it.Name,
			"role":        it.Role,
			"founder_id":  it.FounderID,
			"investor_id": itInvestorID(it.InvestorID),
		}
		payload["founder_id"] = itFounderID(it.FounderID)

		items = append(items, UpstreamItem{
			ExternalID: it.Email,
			Payload:    payload,
			UpdatedAt:  time.Now().UTC(),
		})
	}
	return items, nil
}

func (a *JEBUsersAPI) FetchIncremental(ctx context.Context, since time.Time) ([]UpstreamItem, error) {
	return a.FetchFull(ctx)
}

// helpers to normalize pointer types into either nil or concrete int64
func itFounderID(p *int64) any {
	if p == nil {
		return nil
	}
	return *p
}

func itInvestorID(p *int64) any {
	if p == nil {
		return nil
	}
	return *p
}
