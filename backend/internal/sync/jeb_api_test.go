package sync

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/client/jeb"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/stretchr/testify/assert"
)

func TestHelpers(t *testing.T) {
	var p *int64
	assert.Nil(t, itFounderID(p))
	assert.Nil(t, itInvestorID(p))

	v := int64(42)
	assert.Equal(t, int64(42), itFounderID(&v))
	assert.Equal(t, int64(42), itInvestorID(&v))

	assert.Equal(t, "123", int64ToString(123))
	assert.Equal(t, "456", fmtInt(456))
}

func newTestClient(ts *httptest.Server) *jeb.Client {
	cfg := &config.Config{
		API: config.APIConfig{
			JEB: config.JEBAPIConfig{
				BaseURL:    ts.URL,
				GroupToken: "test-token",
				Timeout:    time.Second,
				Retry:      config.RetryConfig{MaxAttempts: 1, Backoff: time.Millisecond},
			},
		},
	}
	return jeb.NewClient(cfg)
}

func TestJEBUsersAPI_FetchFull_Success(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		users := []jeb.User{{ID: 1, Email: "a@b.com", Name: "Alice", Role: "admin"}}
		_ = json.NewEncoder(w).Encode(users)
	}))
	defer ts.Close()

	client := newTestClient(ts)
	api := NewJEBUsersAPI(client)

	items, err := api.FetchFull(context.Background())
	assert.NoError(t, err)
	assert.Len(t, items, 1)
	assert.Equal(t, "a@b.com", items[0].ExternalID)
}

func TestJEBUsersAPI_FetchFull_Error(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "fail", http.StatusInternalServerError)
	}))
	defer ts.Close()

	client := newTestClient(ts)
	api := NewJEBUsersAPI(client)

	_, err := api.FetchFull(context.Background())
	assert.Error(t, err)
}

func TestJEBUsersAPI_FetchIncremental(t *testing.T) {
	client := newTestClient(httptest.NewServer(http.NotFoundHandler()))
	api := NewJEBUsersAPI(client)
	_, _ = api.FetchIncremental(context.Background(), time.Now())
}

func TestJEBStartupsAPI_FetchFull_Success(t *testing.T) {
	callCount := 0
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/startups" {
			if callCount == 0 {
				list := []jeb.StartupList{{ID: 1, Name: "MyStartup"}}
				_ = json.NewEncoder(w).Encode(list)
			} else {
				_ = json.NewEncoder(w).Encode([]jeb.StartupList{}) // stop loop
			}
			callCount++
		} else if r.URL.Path == "/startups/1" {
			detail := jeb.StartupDetail{ID: 1, Name: "MyStartup", CreatedAt: strPtr("2024-01-01")}
			_ = json.NewEncoder(w).Encode(detail)
		}
	}))
	defer ts.Close()

	client := newTestClient(ts)
	api := NewJEBStartupsAPI(client)

	items, err := api.FetchFull(context.Background())
	assert.NoError(t, err)
	assert.Len(t, items, 1)
	assert.Equal(t, "MyStartup", items[0].Payload["name"])
}

func TestJEBStartupsAPI_FetchFull_Error(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "fail", http.StatusInternalServerError)
	}))
	defer ts.Close()

	client := newTestClient(ts)
	api := NewJEBStartupsAPI(client)

	_, err := api.FetchFull(context.Background())
	assert.Error(t, err)
}

func TestJEBStartupsAPI_FetchIncremental(t *testing.T) {
	client := newTestClient(httptest.NewServer(http.NotFoundHandler()))
	api := NewJEBStartupsAPI(client)
	_, _ = api.FetchIncremental(context.Background(), time.Now())
}

func TestJEBNewsAPI_FetchFull_Success(t *testing.T) {
	callCount := 0
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/news" {
			if callCount == 0 {
				list := []jeb.NewsList{{ID: 1, Title: "Breaking"}}
				_ = json.NewEncoder(w).Encode(list)
			} else {
				_ = json.NewEncoder(w).Encode([]jeb.NewsList{}) // stop loop
			}
			callCount++
		} else if r.URL.Path == "/news/1" {
			detail := jeb.NewsDetail{ID: 1, Title: "Breaking", Description: "desc"}
			_ = json.NewEncoder(w).Encode(detail)
		}
	}))
	defer ts.Close()

	client := newTestClient(ts)
	api := NewJEBNewsAPI(client)

	items, err := api.FetchFull(context.Background())
	assert.NoError(t, err)
	assert.Len(t, items, 1)
	assert.Equal(t, "Breaking", items[0].Payload["title"])
}

func TestJEBNewsAPI_FetchFull_Error(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "fail", http.StatusInternalServerError)
	}))
	defer ts.Close()

	client := newTestClient(ts)
	api := NewJEBNewsAPI(client)

	_, err := api.FetchFull(context.Background())
	assert.Error(t, err)
}

func TestJEBNewsAPI_FetchIncremental(t *testing.T) {
	client := newTestClient(httptest.NewServer(http.NotFoundHandler()))
	api := NewJEBNewsAPI(client)
	_, _ = api.FetchIncremental(context.Background(), time.Now())
}

func TestJEBEventsAPI_FetchFull_Success(t *testing.T) {
	callCount := 0
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/events" {
			if callCount == 0 {
				list := []jeb.Event{{ID: 1, Name: "Event1"}}
				_ = json.NewEncoder(w).Encode(list)
			} else {
				_ = json.NewEncoder(w).Encode([]jeb.Event{}) // stop loop
			}
			callCount++
		}
	}))
	defer ts.Close()

	client := newTestClient(ts)
	api := NewJEBEventsAPI(client)

	items, err := api.FetchFull(context.Background())
	assert.NoError(t, err)
	assert.Len(t, items, 1)
	assert.Equal(t, "Event1", items[0].Payload["name"])
}

func TestJEBEventsAPI_FetchFull_Error(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "fail", http.StatusInternalServerError)
	}))
	defer ts.Close()

	client := newTestClient(ts)
	api := NewJEBEventsAPI(client)

	_, err := api.FetchFull(context.Background())
	assert.Error(t, err)
}

func TestJEBEventsAPI_FetchIncremental(t *testing.T) {
	client := newTestClient(httptest.NewServer(http.NotFoundHandler()))
	api := NewJEBEventsAPI(client)
	_, _ = api.FetchIncremental(context.Background(), time.Now())
}

func strPtr(s string) *string { return &s }
