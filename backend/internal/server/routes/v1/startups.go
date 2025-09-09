package v1

import (
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterStartups(r *gin.RouterGroup, cfg *config.Config, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewStartupsHandler(db, logger)

	g := r.Group("/startups")
	g.GET("", h.ListStartups)
	g.GET("/:id", h.GetStartup)
	g.POST("/:id/views", h.IncrementViews)

	admin := r.Group("/admin/startups")
	admin.Use(middleware.AuthRequired(cfg), middleware.RequireAdmin())
	admin.POST("", h.CreateStartup)
	admin.PATCH("/:id", h.UpdateStartup)
	admin.DELETE("/:id", h.DeleteStartup)
}
