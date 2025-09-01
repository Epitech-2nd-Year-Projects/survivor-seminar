package middleware

import (
	"crypto/rand"
	"encoding/hex"

	"github.com/gin-gonic/gin"
)

const RequestIDHeader = "X-Request-ID"

func generateRequestID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return hex.EncodeToString([]byte("fallback-request-id"))
	}
	return hex.EncodeToString(b)
}

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		rid := c.GetHeader(RequestIDHeader)
		if rid == "" {
			rid = generateRequestID()
		}
		c.Writer.Header().Set(RequestIDHeader, rid)
		c.Set(RequestIDHeader, rid)
		c.Next()
	}
}
