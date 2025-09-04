package jeb

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
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

// getBinary fetches a URL and returns raw bytes and detected content type.
func (c *Client) getBinary(ctx context.Context, url string) ([]byte, string, error) {
	var lastErr error
	for attempt := 1; attempt <= c.maxTries; attempt++ {
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		req.Header.Set("X-Group-Authorization", c.Token)
		resp, err := c.http.Do(req)
		if err != nil {
			lastErr = err
		} else {
			defer resp.Body.Close()
			if resp.StatusCode >= 200 && resp.StatusCode < 300 {
				body, _ := io.ReadAll(resp.Body)
				ct := resp.Header.Get("Content-Type")
				if ct == "" {
					ct = http.DetectContentType(body)
				}
				return body, ct, nil
			}
			b, _ := io.ReadAll(resp.Body)
			lastErr = fmt.Errorf("GET %s: status %d: %s", url, resp.StatusCode, string(b))
		}
		if attempt < c.maxTries {
			select {
			case <-time.After(c.backoff):
			case <-ctx.Done():
				return nil, "", ctx.Err()
			}
		}
	}
	return nil, "", lastErr
}
