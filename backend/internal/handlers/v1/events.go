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

type listEventsParams struct {
	pagination pagination.Params
	EventType  string `form:"event_type" binding:"omitempty"`
	Location   string `form:"location" binding:"omitempty"`
	StartDate  string `form:"start_date" binding:"omitempty"`
}

func NewEventsHandler(log *logrus.Logger, db *gorm.DB) *EventsHandler {
	return &EventsHandler{
		log: log,
		db:  db,
	}
}

// GetEvents godoc
// @Summary      List events
// @Description  Returns a paginated list of events with filters and sorting.
// @Tags         Events
// @Param        page       query int    false "Page" default(1)
// @Param        per_page   query int    false "Page size" default(20)
// @Param        sort       query string false "Sort field" Enums(id,name,event_type,start_date,end_date,created_at,updated_at) default(start_date)
// @Param        order      query string false "Sort order" Enums(asc,desc) default(desc)
// @Param        event_type query string false "Filter by event type"
// @Param        location   query string false "Filter by location"
// @Param        start_date query string false "Filter by start date (YYYY-MM-DD)"
// @Success      200 {object} response.EventListResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /events [get]
func (h *EventsHandler) GetEvents(c *gin.Context) {
	var params listEventsParams
	params.pagination = pagination.Parse(c)
	if err := c.ShouldBindQuery(&params); err != nil {
		response.JSON(c, http.StatusBadRequest, gin.H{"code": "invalid_params", "message": err.Error()})
		return
	}
	if !slices.Contains(validEventSortFields, params.pagination.Sort) {
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2117,
			"message": fmt.Sprintf("invalid sort field '%s'. Allowed fields: %v", params.pagination.Sort, validEventSortFields),
		})
		return
	}
	query := h.db.Model(&models.Event{})
	if params.EventType != "" {
		query = query.Where("event_type = ?", params.EventType)
	}
	if params.Location != "" {
		query = query.Where("location ILIKE ?", "%"+params.Location+"%")
	}
	if params.StartDate != "" {
		query = query.Where("start_date::date = ?", params.StartDate)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError,
			gin.H{"code": "internal_error", "message": "failed to count events"})
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.pagination.Sort, params.pagination.Order)
	var events []models.Event
	if err := query.Order(orderBy).
		Offset((params.pagination.Page - 1) * params.pagination.PerPage).
		Limit(params.pagination.PerPage).
		Find(&events).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to retrieve events"})
		return
	}

	totalPages := (int(total) + params.pagination.PerPage - 1) / params.pagination.PerPage
	response.JSON(c, http.StatusOK, gin.H{
		"data": events,
		"pagination": gin.H{
			"page":     params.pagination.Page,
			"per_page": params.pagination.PerPage,
			"total":    total,
			"has_next": params.pagination.Page < totalPages,
			"has_prev": params.pagination.Page > 1,
		},
	})
}

// GetEvent godoc
// @Summary      Get event
// @Description  Retrieves an event by ID.
// @Tags         Events
// @Param        id path int true "Event ID"
// @Success      200 {object} response.EventObjectResponse
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /events/{id} [get]
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

// CreateEvent godoc
// @Summary      Create event
// @Description  Creates an event (admin required).
// @Tags         Events
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        payload body requests.EventCreateRequest true "Event" Example({"name":"Conf 2025","start_date":"2025-10-01T09:00:00Z","event_type":"conference"})
// @Success      201 {object} response.EventObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/events [post]
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

// UpdateEvent godoc
// @Summary      Update event
// @Description  Updates an event (admin required).
// @Tags         Events
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path   int    true  "Event ID"
// @Param        payload body   requests.EventUpdateRequest true  "Fields to update" Example({"location":"Paris","capacity":300})
// @Success      200 {object} response.EventObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/events/{id} [patch]
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

// DeleteEvent godoc
// @Summary      Delete event
// @Description  Deletes an event (admin required).
// @Tags         Events
// @Security     BearerAuth
// @Param        id path int true "Event ID"
// @Success      200 {object} response.MessageResponse
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/events/{id} [delete]
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
