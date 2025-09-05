package jeb

import (
	"context"
	"net/url"
	"strconv"
)

// ReadNews pages through /news and returns minimal list entries.
func (c *Client) ReadNews(ctx context.Context, skip, limit int) ([]NewsList, error) {
	u, _ := url.Parse(c.BaseURL)
	u.Path = u.ResolveReference(&url.URL{Path: "/news"}).Path

	q := u.Query()
	if skip > 0 {
		q.Set("skip", strconv.Itoa(skip))
	}
	if limit > 0 {
		q.Set("limit", strconv.Itoa(limit))
	}

	u.RawQuery = q.Encode()
	var data []NewsList
	if err := c.getJSON(ctx, u.String(), &data); err != nil {
		return nil, err
	}
	return data, nil
}

// ReadNewsDetail fetches /news/{id}.
func (c *Client) ReadNewsDetail(ctx context.Context, id int64) (*NewsDetail, error) {
	u, _ := url.Parse(c.BaseURL)
	u.Path = u.ResolveReference(&url.URL{Path: "/news/" + strconv.FormatInt(id, 10)}).Path

	var data NewsDetail
	if err := c.getJSON(ctx, u.String(), &data); err != nil {
		return nil, err
	}
	return &data, nil
}

// ReadEvents pages through /events and returns entries.
func (c *Client) ReadEvents(ctx context.Context, skip, limit int) ([]Event, error) {
	u, _ := url.Parse(c.BaseURL)
	u.Path = u.ResolveReference(&url.URL{Path: "/events"}).Path

	q := u.Query()
	if skip > 0 {
		q.Set("skip", strconv.Itoa(skip))
	}
	if limit > 0 {
		q.Set("limit", strconv.Itoa(limit))
	}

	u.RawQuery = q.Encode()
	var data []Event
	if err := c.getJSON(ctx, u.String(), &data); err != nil {
		return nil, err
	}
	return data, nil
}

// ReadEvent fetches /events/{id}.
func (c *Client) ReadEvent(ctx context.Context, id int64) (*Event, error) {
	u, _ := url.Parse(c.BaseURL)
	u.Path = u.ResolveReference(&url.URL{Path: "/events/" + strconv.FormatInt(id, 10)}).Path

	var data Event
	if err := c.getJSON(ctx, u.String(), &data); err != nil {
		return nil, err
	}
	return &data, nil
}

// ReadUsers pages through /users and returns entries.
func (c *Client) ReadUsers(ctx context.Context, skip, limit int) ([]User, error) {
	u, _ := url.Parse(c.BaseURL)
	u.Path = u.ResolveReference(&url.URL{Path: "/users"}).Path

	q := u.Query()
	if skip > 0 {
		q.Set("skip", strconv.Itoa(skip))
	}
	if limit > 0 {
		q.Set("limit", strconv.Itoa(limit))
	}
	u.RawQuery = q.Encode()

	var data []User
	if err := c.getJSON(ctx, u.String(), &data); err != nil {
		return nil, err
	}
	return data, nil
}

// ReadUser fetches /users/{id}.
func (c *Client) ReadUser(ctx context.Context, id int64) (*User, error) {
	u, _ := url.Parse(c.BaseURL)
	u.Path = u.ResolveReference(&url.URL{Path: "/users/" + strconv.FormatInt(id, 10)}).Path

	var data User
	if err := c.getJSON(ctx, u.String(), &data); err != nil {
		return nil, err
	}
	return &data, nil
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
