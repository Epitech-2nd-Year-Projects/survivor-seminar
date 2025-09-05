package v1

import (
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterEvents(r *gin.RouterGroup, cfg *config.Config, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewEventsHandler(logger, db)

	events := r.Group("/events")
	events.GET("", h.GetEvents)
	events.GET("/:id", h.GetEvent)

	admin := r.Group("/admin/events")
	admin.Use(middleware.AuthRequired(cfg), middleware.RequireAdmin())
	admin.POST("", h.CreateEvent)
	admin.PATCH("/:id", h.UpdateEvent)
	admin.DELETE("/:id", h.DeleteEvent)
}
