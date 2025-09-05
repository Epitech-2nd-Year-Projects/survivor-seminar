package middleware

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/auth"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/gin-gonic/gin"
)

const (
	ctxClaimsKey = "auth_claims"
)

// AuthRequired parses and validates a Bearer JWT, attaching claims to context
func AuthRequired(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authz := c.GetHeader("Authorization")
		if authz == "" || !strings.HasPrefix(strings.ToLower(authz), "bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": "unauthorized", "message": "missing bearer token"})
			return
		}
		token := strings.TrimSpace(authz[len("Bearer "):])
		claims, err := auth.ParseClaims(cfg, token)
		if err != nil || claims == nil || claims.Type != "access" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": "invalid_token", "message": "invalid access token"})
			return
		}
		c.Set(ctxClaimsKey, claims)
		c.Next()
	}
}

// GetClaims retrieves auth claims from context
func GetClaims(c *gin.Context) *auth.Claims {
	v, ok := c.Get(ctxClaimsKey)
	if !ok {
		return nil
	}
	if cl, ok := v.(*auth.Claims); ok {
		return cl
	}
	return nil
}

// RequireAdmin ensures the authenticated user has the admin role
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := GetClaims(c)
		if claims == nil || strings.ToLower(claims.Role) != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"code": "forbidden", "message": "admin only"})
			return
		}
		c.Next()
	}
}

// RequireSelfByParam ensures the authenticated user matches the :id path param
func RequireSelfByParam(param string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := GetClaims(c)
		if claims == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": "unauthorized", "message": "missing auth"})
			return
		}
		if c.Param(param) != "" && c.Param(param) == strconv.FormatUint(claims.UserID, 10) {
			c.Next()
			return
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"code": "forbidden", "message": "not your resource"})
	}
}

// RequireSelfOrAdminByParam allows access if admin or if :param matches claims.UserID
func RequireSelfOrAdminByParam(param string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := GetClaims(c)
		if claims == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": "unauthorized", "message": "missing auth"})
			return
		}
		if strings.ToLower(claims.Role) == "admin" {
			c.Next()
			return
		}
		if c.Param(param) != "" && c.Param(param) == strconv.FormatUint(claims.UserID, 10) {
			c.Next()
			return
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"code": "forbidden", "message": "not your resource"})
	}
}

// RequireSelfOrAdminByEmailParam allows access if admin or if :param email matches claims.Email
func RequireSelfOrAdminByEmailParam(param string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := GetClaims(c)
		if claims == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": "unauthorized", "message": "missing auth"})
			return
		}
		if strings.ToLower(claims.Role) == "admin" {
			c.Next()
			return
		}
		if c.Param(param) != "" && strings.EqualFold(c.Param(param), claims.Email) {
			c.Next()
			return
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"code": "forbidden", "message": "not your resource"})
	}
}
