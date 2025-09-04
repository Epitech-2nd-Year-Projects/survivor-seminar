package v1

import (
	"errors"
	"fmt"
	"net/http"
	"slices"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/http/pagination"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type NewsHandler struct {
	db  *gorm.DB
	log *logrus.Logger
}

var validNewsSortFields = []string{
	"id",
	"title",
	"news_date",
	"category",
	"startup_id",
	"created_at",
	"updated_at",
}

func NewNewsHandler(db *gorm.DB, log *logrus.Logger) *NewsHandler {
	return &NewsHandler{
		db:  db,
		log: log,
	}
}

func (h *NewsHandler) GetNews(c *gin.Context) {
	params := pagination.Parse(c)
	offset := (params.Page - 1) * params.PerPage

	if !slices.Contains(validNewsSortFields, params.Sort) {
		response.JSONError(c, http.StatusBadRequest,
			"invalid_sort",
			fmt.Sprintf("invalid sort field '%s'. Allowed: %v", params.Sort, validNewsSortFields), nil)
		return
	}

	var total int64
	if err := h.db.Model(&models.News{}).Count(&total).Error; err != nil {
		h.log.WithError(err).Error("failed to count news")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve news count", nil)
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.Sort, params.Order)
	var news []models.News
	if err := h.db.Order(orderBy).Offset(offset).Limit(params.PerPage).Find(&news).Error; err != nil {
		h.log.WithError(err).Error("failed to fetch news")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve news", nil)
		return
	}

	totalPages := (int(total) + params.PerPage - 1) / params.PerPage
	hasNext := params.Page < totalPages
	hasPrev := params.Page > 1

	response.JSON(c, http.StatusOK, gin.H{
		"data": news,
		"pagination": gin.H{
			"page":     params.Page,
			"per_page": params.PerPage,
			"total":    total,
			"has_next": hasNext,
			"has_prev": hasPrev,
		},
	})
}

func (h *NewsHandler) GetNewsItem(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if err := h.db.Where("id = ?", id).First(&news).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound, "not_found", "news not found", nil)
			return
		}
		response.JSONError(c, http.StatusInternalServerError, "internal_error", "failed to retrieve news", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"data": news})
}
