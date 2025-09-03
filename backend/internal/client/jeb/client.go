package jeb

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
)

type Client struct {
	http     *http.Client
	BaseURL  string
	Token    string
	maxTries int
	backoff  time.Duration
}

// NewClient initializes and returns a new instance of Client with configuration provided by cfg.
func NewClient(cfg *config.Config) *Client {
	hc := &http.Client{
		Timeout: cfg.API.JEB.Timeout,
	}
	max := cfg.API.JEB.Retry.MaxAttempts
	if max <= 0 {
		max = 1
	}
	bo := cfg.API.JEB.Retry.Backoff
	if bo <= 0 {
		bo = 2 * time.Second
	}

	return &Client{
		http:     hc,
		BaseURL:  cfg.API.JEB.BaseURL,
		Token:    cfg.API.JEB.GroupToken,
		maxTries: max,
		backoff:  bo,
	}
}

// StartupList corresponds to the list item schema of the API.
type StartupList struct {
	ID       int64   `json:"id"`
	Name     string  `json:"name"`
	Legal    *string `json:"legal_status"`
	Address  *string `json:"address"`
	Email    string  `json:"email"`
	Phone    *string `json:"phone"`
	Sector   *string `json:"sector"`
	Maturity *string `json:"maturity"`
}

// StartupDetail corresponds to the detailed startup schema.
type StartupDetail struct {
	ID             int64     `json:"id"`
	Name           string    `json:"name"`
	LegalStatus    *string   `json:"legal_status"`
	Address        *string   `json:"address"`
	Email          string    `json:"email"`
	Phone          *string   `json:"phone"`
	CreatedAt      *string   `json:"created_at"`
	Description    *string   `json:"description"`
	WebsiteURL     *string   `json:"website_url"`
	SocialMediaURL *string   `json:"social_media_url"`
	ProjectStatus  *string   `json:"project_status"`
	Needs          *string   `json:"needs"`
	Sector         *string   `json:"sector"`
	Maturity       *string   `json:"maturity"`
	Founders       []Founder `json:"founders"`
}

type Founder struct {
	ID        int64  `json:"id"`
	StartupID int64  `json:"startup_id"`
	Name      string `json:"name"`
}

// ReadStartups pages through /startups and returns minimal list entries.
func (c *Client) ReadStartups(ctx context.Context, skip, limit int) ([]StartupList, error) {
	u, _ := url.Parse(c.BaseURL)
	u.Path = u.ResolveReference(&url.URL{Path: "/startups"}).Path
	q := u.Query()
	if skip > 0 {
		q.Set("skip", strconv.Itoa(skip))
	}
	if limit > 0 {
		q.Set("limit", strconv.Itoa(limit))
	}
	u.RawQuery = q.Encode()
	var data []StartupList
	if err := c.getJSON(ctx, u.String(), &data); err != nil {
		return nil, err
	}
	return data, nil
}

// ReadStartupDetail fetches /startups/{id}.
func (c *Client) ReadStartupDetail(ctx context.Context, id int64) (*StartupDetail, error) {
	u, _ := url.Parse(c.BaseURL)
	u.Path = u.ResolveReference(&url.URL{Path: "/startups/" + strconv.FormatInt(id, 10)}).Path
	var data StartupDetail
	if err := c.getJSON(ctx, u.String(), &data); err != nil {
		return nil, err
	}
	return &data, nil
}

func (c *Client) getJSON(ctx context.Context, url string, out any) error {
	var lastErr error
	for attempt := 1; attempt <= c.maxTries; attempt++ {
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		req.Header.Set("X-Group-Authorization", c.Token)
		req.Header.Set("Accept", "application/json")

		resp, err := c.http.Do(req)
		if err != nil {
			lastErr = err
		} else {
			defer resp.Body.Close()
			if resp.StatusCode >= 200 && resp.StatusCode < 300 {
				body, _ := io.ReadAll(resp.Body)
				if err := json.Unmarshal(body, out); err != nil {
					return fmt.Errorf("unmarshal %s: %w", url, err)
				}
				return nil
			}
			b, _ := io.ReadAll(resp.Body)
			lastErr = fmt.Errorf("GET %s: status %d: %s", url, resp.StatusCode, string(b))
		}
		if attempt < c.maxTries {
			select {
			case <-time.After(c.backoff):
			case <-ctx.Done():
				return ctx.Err()
			}
		}
	}
	return lastErr
}
