package v1

import (
	"errors"
	"fmt"
	"net/http"
	"slices"
	"time"

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

func (h *EventsHandler) CreateEvent(c *gin.Context) {
	var req struct {
		Name           string     `json:"name" binding:"required,max=255"`
		Description    *string    `json:"description,omitempty"`
		EventType      *string    `json:"event_type,omitempty"`
		Location       *string    `json:"location,omitempty"`
		TargetAudience *string    `json:"target_audience,omitempty"`
		StartDate      *time.Time `json:"start_date,omitempty"`
		EndDate        *time.Time `json:"end_date,omitempty"`
		Capacity       *int       `json:"capacity,omitempty"`
		ImageURL       *string    `json:"image_url,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.WithError(err).Warn("invalid request payload")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2100,
			"message": "invalid request payload",
			"errors":  err.Error(),
		})
		return
	}

	event := models.Event{
		Name:           req.Name,
		Description:    req.Description,
		EventType:      req.EventType,
		Location:       req.Location,
		TargetAudience: req.TargetAudience,
		StartDate:      req.StartDate,
		EndDate:        req.EndDate,
		Capacity:       req.Capacity,
		ImageURL:       req.ImageURL,
	}

	if err := h.db.Create(&event).Error; err != nil {
		h.log.WithError(err).Error("h.db.Create().Error")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to create event",
		})
		return
	}

	h.log.WithField("id", event.ID).Info("event created successfully")
	response.JSON(c, http.StatusCreated, gin.H{
		"message": "event created successfully",
		"data":    event,
	})
}

func (h *EventsHandler) UpdateEvent(c *gin.Context) {
	id := c.Param("id")

	var event models.Event
	if err := h.db.Where("id = ?", id).First(&event).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "event not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch event for update")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve event",
		})
		return
	}

	var req struct {
		Name           *string    `json:"name,omitempty" binding:"omitempty,max=255"`
		Description    *string    `json:"description,omitempty"`
		EventType      *string    `json:"event_type,omitempty"`
		Location       *string    `json:"location,omitempty"`
		TargetAudience *string    `json:"target_audience,omitempty"`
		StartDate      *time.Time `json:"start_date,omitempty"`
		EndDate        *time.Time `json:"end_date,omitempty"`
		Capacity       *int       `json:"capacity,omitempty"`
		ImageURL       *string    `json:"image_url,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.WithError(err).Warn("invalid request payload for event update")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2100,
			"message": "invalid request payload",
			"errors":  err.Error(),
		})
		return
	}

	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.EventType != nil {
		updates["event_type"] = *req.EventType
	}
	if req.Location != nil {
		updates["location"] = *req.Location
	}
	if req.TargetAudience != nil {
		updates["target_audience"] = *req.TargetAudience
	}
	if req.StartDate != nil {
		updates["start_date"] = *req.StartDate
	}
	if req.EndDate != nil {
		updates["end_date"] = *req.EndDate
	}
	if req.Capacity != nil {
		updates["capacity"] = *req.Capacity
	}
	if req.ImageURL != nil {
		updates["image_url"] = *req.ImageURL
	}

	if len(updates) == 0 {
		h.log.WithField("id", id).Warn("len(updates) == 0")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2101,
			"message": "no fields provided for update",
		})
		return
	}

	if err := h.db.Model(&event).Updates(updates).Error; err != nil {
		h.log.WithError(err).WithField("id", id).Error("failed to update event")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to update event",
		})
		return
	}

	if err := h.db.Where("id = ?", id).First(&event).Error; err != nil {
		h.log.WithError(err).WithField("id", id).Error("failed to fetch updated event")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve updated event",
		})
		return
	}

	h.log.WithField("id", id).Info("event updated successfully")
	response.JSON(c, http.StatusOK, gin.H{
		"message": "event updated successfully",
		"data":    event,
	})
}

func (h *EventsHandler) DeleteEvent(c *gin.Context) {
	id := c.Param("id")

	var event models.Event
	if err := h.db.Where("id = ?", id).First(&event).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "event not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch event for deletion")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve event",
		})
		return
	}

	if err := h.db.Delete(&event).Error; err != nil {
		h.log.WithError(err).WithField("id", id).Error("failed to delete event")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to delete event",
		})
		return
	}

	h.log.WithField("id", id).Info("event deleted successfully")
	response.JSON(c, http.StatusOK, gin.H{
		"message": "event deleted successfully",
	})
}
