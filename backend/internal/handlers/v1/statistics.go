package v1

import (
	"math/rand"
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

	stats := gin.H{
		"totalProjects":         totalProjects,
		"projectsGrowth":        rand.Intn(100),
		"totalViews":            rand.Intn(100000),
		"viewsGrowthPercent":    rand.Float64() * 20.0,
		"engagementRatePercent": rand.Float64() * 15.0,
		"period":                period,
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
	if err := h.db.Limit(limit).Find(&startups).Error; err != nil {
		h.log.WithError(err).Error("failed to fetch startups for top projects")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve top projects", nil)
		return
	}

	var topProjects []gin.H
	for _, s := range startups {
		topProjects = append(topProjects, gin.H{
			"projectId":             s.ID,
			"title":                 s.Name,
			"views":                 rand.Intn(5000) + 100,
			"likes":                 rand.Intn(1000),
			"comments":              rand.Intn(200),
			"engagementRatePercent": rand.Float64() * 50.0,
		})
	}

	payload := gin.H{
		"period":      period,
		"limit":       limit,
		"count":       len(topProjects),
		"topProjects": topProjects,
		"generatedAt": time.Now().UTC(),
	}

	response.JSON(c, http.StatusOK, payload)
}
