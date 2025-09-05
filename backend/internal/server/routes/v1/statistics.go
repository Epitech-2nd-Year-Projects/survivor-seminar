package v1

import (
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterStatistics(r *gin.RouterGroup, cfg *config.Config, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewStatisticsHandler(db, logger)

	admin := r.Group("/admin/statistics")
	admin.Use(middleware.AuthRequired(cfg), middleware.RequireAdmin())
	admin.GET("", h.GetStatistics)
	admin.GET("/top", h.GetTopProjects)
}
