package jeb

import (
	"context"
	"net/url"
	"strconv"
)

// GetUserImage fetches /users/{id}/image and returns bytes and content type.
func (c *Client) GetUserImage(ctx context.Context, id int64) ([]byte, string, error) {
	u, _ := url.Parse(c.BaseURL)
	u.Path = u.ResolveReference(&url.URL{Path: "/users/" + strconv.FormatInt(id, 10) + "/image"}).Path
	return c.getBinary(ctx, u.String())
}

// GetNewsImage fetches /news/{id}/image and returns bytes and content type.
func (c *Client) GetNewsImage(ctx context.Context, id int64) ([]byte, string, error) {
	u, _ := url.Parse(c.BaseURL)
	u.Path = u.ResolveReference(&url.URL{Path: "/news/" + strconv.FormatInt(id, 10) + "/image"}).Path
	return c.getBinary(ctx, u.String())
}

// GetEventImage fetches /events/{id}/image and returns bytes and content type.
func (c *Client) GetEventImage(ctx context.Context, id int64) ([]byte, string, error) {
	u, _ := url.Parse(c.BaseURL)
	u.Path = u.ResolveReference(&url.URL{Path: "/events/" + strconv.FormatInt(id, 10) + "/image"}).Path
	return c.getBinary(ctx, u.String())
}
