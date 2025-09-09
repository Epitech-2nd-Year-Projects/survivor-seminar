package middleware

import (
	"strings"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/gin-gonic/gin"
)

func CORS(cfg *config.Config) gin.HandlerFunc {
	allowedMethods := strings.Join(cfg.Security.CORS.AllowedMethods, ", ")

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		allowAny := false
		for _, o := range cfg.Security.CORS.AllowedOrigins {
			if o == "*" {
				allowAny = true
				break
			}
		}
		if origin != "" {
			if allowAny {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			} else {
				for _, o := range cfg.Security.CORS.AllowedOrigins {
					if strings.EqualFold(o, origin) {
						c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
						break
					}
				}
			}
		}

		c.Writer.Header().Set("Access-Control-Allow-Methods", allowedMethods)
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, X-Request-ID")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "X-Request-ID")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Vary", "Origin")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
