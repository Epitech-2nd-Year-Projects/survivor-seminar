package v1

import (
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterStartups(r *gin.RouterGroup, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewStartupsHandler(db, logger)

	g := r.Group("/startups")
	g.GET("", h.ListStartups)
	g.GET("/:id", h.GetStartup)
}
