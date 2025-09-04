package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func Logger(logger *logrus.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method
		rid, _ := c.Get(RequestIDHeader)

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		size := c.Writer.Size()

		entry := logger.WithFields(logrus.Fields{
			"status":  status,
			"method":  method,
			"path":    path,
			"latency": latency.String(),
			"size":    size,
		})
		if rid != nil {
			entry = entry.WithField("request_id", rid)
		}

		if len(c.Errors) > 0 {
			entry.WithField("errors", c.Errors.String()).Error("request completed with errors")
		} else {
			entry.Info("request completed")
		}
	}
}
