package v1

import (
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterStatistics(r *gin.RouterGroup, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewStatisticsHandler(db, logger)

	stats := r.Group("/statistics")
	stats.GET("", h.GetStatistics)
	stats.GET("/top", h.GetTopProjects)
}
