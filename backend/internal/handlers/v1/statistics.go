package v1

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type StatisticsHandler struct {
	db  *gorm.DB
	log *logrus.Logger
}

func NewStatisticsHandler(db *gorm.DB, log *logrus.Logger) *StatisticsHandler {
	return &StatisticsHandler{
		db:  db,
		log: log,
	}
}

func (h *StatisticsHandler) GetStatistics(c *gin.Context) {
	period := c.DefaultQuery("period", "weekly")

	var totalProjects int64
	if err := h.db.Model(&models.Startup{}).Count(&totalProjects).Error; err != nil {
		h.log.WithError(err).Error("failed to count startups")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve statistics", nil)
		return
	}

	var totalViews int64
	if err := h.db.Model(&models.Startup{}).Select("SUM(views_count)").Scan(&totalViews).Error; err != nil {
		h.log.WithError(err).Error("failed to sum views_count")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve statistics", nil)
		return
	}

	var projectsGrowth int64
	since := time.Now().Add(-7 * 24 * time.Hour)
	if period == "monthly" {
		since = time.Now().Add(-30 * 24 * time.Hour)
	}
	if err := h.db.Model(&models.Startup{}).
		Where("created_at >= ?", since).
		Count(&projectsGrowth).Error; err != nil {
		h.log.WithError(err).Error("failed to count startups growth")
	}

	avgViewsPerProject := float64(0)
	if totalProjects > 0 {
		avgViewsPerProject = float64(totalViews) / float64(totalProjects)
	}

	engagementRate := 0.0
	if avgViewsPerProject > 0 {
		engagementRate = (avgViewsPerProject / float64(totalViews+1)) * 100
	}

	stats := gin.H{
		"total_projects":          totalProjects,
		"projects_growth":         projectsGrowth,
		"total_views":             totalViews,
		"views_growth_percent":    avgViewsPerProject,
		"engagement_rate_percent": engagementRate,
		"period":                  period,
	}
	response.JSON(c, http.StatusOK, stats)
}

func (h *StatisticsHandler) GetTopProjects(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	period := c.DefaultQuery("period", "week")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	var startups []models.Startup
	if err := h.db.Order("views_count DESC").Limit(limit).Find(&startups).Error; err != nil {
		h.log.WithError(err).Error("failed to fetch startups for top projects")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve top projects", nil)
		return
	}

	var topProjects []gin.H
	for _, s := range startups {
		topProjects = append(topProjects, gin.H{
			"project_id":              s.ID,
			"title":                   s.Name,
			"views":                   s.ViewsCount,
			"likes":                   0,
			"comments":                0,
			"engagement_rate_percent": float64(s.ViewsCount) / float64(1+s.ViewsCount) * 100,
		})
	}

	payload := gin.H{
		"period":       period,
		"limit":        limit,
		"count":        len(topProjects),
		"top_projects": topProjects,
		"generated_at": time.Now().UTC(),
	}

	response.JSON(c, http.StatusOK, payload)
}
