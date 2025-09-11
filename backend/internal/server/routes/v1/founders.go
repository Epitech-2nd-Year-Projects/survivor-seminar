package v1

import (
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterFounders(r *gin.RouterGroup, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewFoundersHandler(logger, db)

	founders := r.Group("/founders")
	founders.GET("", h.GetFounders)
	founders.GET("/:id", h.GetFounder)
}
