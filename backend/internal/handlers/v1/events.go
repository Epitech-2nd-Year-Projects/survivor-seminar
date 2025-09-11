package v1

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"slices"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/http/pagination"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/storage/s3"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type EventsHandler struct {
	log      *logrus.Logger
	db       *gorm.DB
	uploader s3.Uploader
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

func NewEventsHandler(log *logrus.Logger, db *gorm.DB, uploader s3.Uploader) *EventsHandler {
	return &EventsHandler{
		log:      log,
		db:       db,
		uploader: uploader,
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
// @Security     CookieAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        name            formData string  true  "Event name"
// @Param        description     formData string  false "Description"
// @Param        event_type      formData string  false "Type (conference, meetup, ...)"
// @Param        location        formData string  false "Location"
// @Param        target_audience formData string  false "Target audience"
// @Param        start_date      formData string  false "Start date (RFC3339)"
// @Param        end_date        formData string  false "End date (RFC3339)"
// @Param        capacity        formData int     false "Capacity"
// @Param        image           formData file    false "Event image"
// @Success      201 {object} response.EventObjectResponse
// @Failure      400,401,500 {object} response.ErrorBody
// @Router       /admin/events [post]
func (h *EventsHandler) CreateEvent(c *gin.Context) {
	_ = h.alignEventSequence()
	var req struct {
		Name           string     `form:"name" binding:"required,max=255"`
		Description    *string    `form:"description"`
		EventType      *string    `form:"event_type"`
		Location       *string    `form:"location"`
		TargetAudience *string    `form:"target_audience"`
		StartDate      *time.Time `form:"start_date"`
		EndDate        *time.Time `form:"end_date"`
		Capacity       *int       `form:"capacity"`
	}

	if err := c.ShouldBind(&req); err != nil {
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
	}

	file, err := c.FormFile("image")
	if err == nil {
		f, _ := file.Open()
		defer f.Close()
		data, _ := io.ReadAll(f)
		contentType := file.Header.Get("Content-Type")
		if contentType == "" {
			contentType = http.DetectContentType(data)
		}
		key := fmt.Sprintf("event_image/%d%s", time.Now().UnixNano(), extFromContentType(contentType))
		if url, upErr := h.uploader.Upload(c, key, contentType, data); upErr == nil {
			event.ImageURL = &url
		} else {
			h.log.WithError(upErr).Warn("upload event image failed")
		}
	}

	if err := h.db.Create(&event).Error; err != nil {
		h.log.WithError(err).Error("db.Create event failed")
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

func (h *EventsHandler) alignEventSequence() error {
	sql := `SELECT setval(
        pg_get_serial_sequence('events','id'),
        COALESCE((SELECT MAX(id) FROM events), 0) + 1,
        false
    )`
	if err := h.db.Exec(sql).Error; err != nil {
		h.log.WithError(err).Warn("alignEventSequence failed")
		return err
	}
	return nil
}

// UpdateEvent godoc
// @Summary      Update event
// @Description  Updates an event (admin required).
// @Tags         Events
// @Security     CookieAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        id              path     int    true  "Event ID"
// @Param        name            formData string false "Event name"
// @Param        description     formData string false "Description"
// @Param        event_type      formData string false "Type"
// @Param        location        formData string false "Location"
// @Param        target_audience formData string false "Audience"
// @Param        start_date      formData string false "Start date (RFC3339)"
// @Param        end_date        formData string false "End date (RFC3339)"
// @Param        capacity        formData int    false "Capacity"
// @Param        image           formData file   false "Event image"
// @Success      200 {object} response.EventObjectResponse
// @Failure      400,401,404,500 {object} response.ErrorBody
// @Router       /admin/events/{id} [patch]
func (h *EventsHandler) UpdateEvent(c *gin.Context) {
	id := c.Param("id")

	var event models.Event
	if err := h.db.Where("id = ?", id).First(&event).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSON(c, http.StatusNotFound, gin.H{"code": "not_found", "message": "event not found"})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch event")
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to retrieve event"})
		return
	}

	var req struct {
		Name           *string    `form:"name"`
		Description    *string    `form:"description"`
		EventType      *string    `form:"event_type"`
		Location       *string    `form:"location"`
		TargetAudience *string    `form:"target_audience"`
		StartDate      *time.Time `form:"start_date"`
		EndDate        *time.Time `form:"end_date"`
		Capacity       *int       `form:"capacity"`
	}

	if err := c.ShouldBind(&req); err != nil {
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

	file, err := c.FormFile("image")
	if err == nil {
		f, _ := file.Open()
		defer f.Close()
		data, _ := io.ReadAll(f)
		contentType := file.Header.Get("Content-Type")
		if contentType == "" {
			contentType = http.DetectContentType(data)
		}
		key := fmt.Sprintf("event_image/%s%s", id, extFromContentType(contentType))
		if url, upErr := h.uploader.Upload(c, key, contentType, data); upErr == nil {
			updates["image_url"] = url
		} else {
			h.log.WithError(upErr).Warn("upload event image failed")
		}
	}

	if len(updates) == 0 {
		response.JSON(c, http.StatusBadRequest, gin.H{"code": "no_fields", "message": "no fields provided for update"})
		return
	}

	if err := h.db.Model(&event).Updates(updates).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to update event"})
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"message": "event updated successfully", "data": event})
}

// DeleteEvent godoc
// @Summary      Delete event
// @Description  Deletes an event (admin required).
// @Tags         Events
// @Security     CookieAuth
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
