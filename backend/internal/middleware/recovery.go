package middleware

import (
	"net/http"
	"runtime/debug"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func Recovery(logger *logrus.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if rec := recover(); rec != nil {
				logger.WithFields(logrus.Fields{
					"panic": rec,
					"stack": string(debug.Stack()),
				}).Error("panic recovered")

				response.JSONError(c, http.StatusInternalServerError, "internal_error", "An unexpected error occurred", nil)
				c.Abort()
			}
		}()
		c.Next()
	}
}
