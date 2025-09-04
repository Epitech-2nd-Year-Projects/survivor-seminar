package v1

import (
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterEvents(r *gin.RouterGroup, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewEventsHandler(logger, db)

	events := r.Group("/events")
	events.GET("", h.GetEvents)
	events.GET("/:id", h.GetEvent)

	admin := r.Group("/admin/events")
	admin.POST("", h.CreateEvent)
	admin.PATCH("/:id", h.UpdateEvent)
	admin.DELETE("/:id", h.DeleteEvent)
}
