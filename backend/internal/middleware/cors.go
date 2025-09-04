package middleware

import (
	"strings"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/gin-gonic/gin"
)

func CORS(cfg *config.Config) gin.HandlerFunc {
	allowedOrigins := strings.Join(cfg.Security.CORS.AllowedOrigins, ", ")
	allowedMethods := strings.Join(cfg.Security.CORS.AllowedMethods, ", ")

	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigins)
		c.Writer.Header().Set("Access-Control-Allow-Methods", allowedMethods)
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, X-Request-ID")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "X-Request-ID")
		c.Writer.Header().Set("Vary", "Origin")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
