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

type EventsHandler struct {
	log *logrus.Logger
	db  *gorm.DB
}

var validEventSortFields = []string{
	"id",
	"name",
	"event_type",
	"start_date",
	"end_date",
	"created_at",
	"updated_at",
}

func NewEventsHandler(log *logrus.Logger, db *gorm.DB) *EventsHandler {
	return &EventsHandler{
		log: log,
		db:  db,
	}
}

func (h *EventsHandler) GetEvents(c *gin.Context) {
	params := pagination.Parse(c)
	offset := (params.Page - 1) * params.PerPage

	if !slices.Contains(validEventSortFields, params.Sort) {
		h.log.WithField("sort", params.Sort).Warn("!slices.Contains()")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2117,
			"message": fmt.Sprintf("invalid sort field '%s'. Allowed fields: %v", params.Sort, validEventSortFields),
		})
		return
	}

	var total int64
	if err := h.db.Model(&models.Event{}).Count(&total).Error; err != nil {
		h.log.WithError(err).Error("failed to count events")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve events count",
		})
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.Sort, params.Order)
	var events []models.Event
	if err := h.db.Order(orderBy).Offset(offset).Limit(params.PerPage).Find(&events).Error; err != nil {
		h.log.WithError(err).Error("failed to fetch events")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve events",
		})
		return
	}

	totalPages := (int(total) + params.PerPage - 1) / params.PerPage
	hasNext := params.Page < totalPages
	hasPrev := params.Page > 1

	response.JSON(c, http.StatusOK, gin.H{
		"data": events,
		"pagination": gin.H{
			"page":     params.Page,
			"per_page": params.PerPage,
			"total":    total,
			"has_next": hasNext,
			"has_prev": hasPrev,
		},
	})
}

func (h *EventsHandler) GetEvent(c *gin.Context) {
	id := c.Param("id")

	var event models.Event
	if err := h.db.Where("id = ?", id).First(&event).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("id", id).Warn("event not found")
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "event not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch event")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve event",
		})
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"data": event,
	})
}
