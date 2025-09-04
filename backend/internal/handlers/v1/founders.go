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

type FoundersHandler struct {
	db  *gorm.DB
	log *logrus.Logger
}

func NewFoundersHandler(db *gorm.DB, log *logrus.Logger) *FoundersHandler {
	return &FoundersHandler{
		db:  db,
		log: log,
	}
}

var validFounderSortFields = []string{
	"id",
	"name",
	"role",
	"startup_id",
	"created_at",
	"updated_at",
}

// GetFounders returns a list of founders
func (h *FoundersHandler) GetFounders(c *gin.Context) {
	params := pagination.Parse(c)
	offset := (params.Page - 1) * params.PerPage

	if !slices.Contains(validFounderSortFields, params.Sort) {
		response.JSONError(c, http.StatusBadRequest,
			"invalid_sort",
			fmt.Sprintf("invalid sort field '%s'. Allowed: %v", params.Sort, validFounderSortFields), nil)
		return
	}

	var total int64
	if err := h.db.Model(&models.Founder{}).Count(&total).Error; err != nil {
		h.log.WithError(err).Error(" h.db.Model(&models.Founder{}).Count(&total).Error")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve founders count", nil)
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.Sort, params.Order)
	var founders []models.Founder
	if err := h.db.Order(orderBy).Offset(offset).Limit(params.PerPage).Find(&founders).Error; err != nil {
		h.log.WithError(err).Error("failed to fetch founders")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve founders", nil)
		return
	}

	totalPages := (int(total) + params.PerPage - 1) / params.PerPage
	hasNext := params.Page < totalPages
	hasPrev := params.Page > 1

	response.JSON(c, http.StatusOK, gin.H{
		"data": founders,
		"pagination": gin.H{
			"page":     params.Page,
			"per_page": params.PerPage,
			"total":    total,
			"has_next": hasNext,
			"has_prev": hasPrev,
		},
	})
}

// GetFounder returns a specific founder by ID
func (h *FoundersHandler) GetFounder(c *gin.Context) {
	id := c.Param("id")

	var founder models.Founder
	if err := h.db.Where("id = ?", id).First(&founder).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound,
				"not_found", "founder not found", nil)
			return
		}
		h.log.WithError(err).Error("h.db.Where().First().Error")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve founder", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"data": founder})
}

// GetFoundersByStartup returns a list of founders by startup ID
func (h *FoundersHandler) GetFoundersByStartup(c *gin.Context) {
	startupID := c.Param("startup_id")

	var founders []models.Founder
	if err := h.db.Where("startup_id = ?", startupID).Find(&founders).Error; err != nil {
		h.log.WithError(err).Error("h.db.Where().Find().Error")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve founders", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"data": founders,
	})
}

// GetFounderImage returns the founder image by ID
func (h *FoundersHandler) GetFounderImage(c *gin.Context) {
	id := c.Param("id")

	var founder models.Founder
	if err := h.db.Select("image_url").Where("id = ?", id).First(&founder).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound,
				"not_found", "founder not found", nil)
			return
		}
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve founder", nil)
		return
	}

	if founder.ImageURL == nil || *founder.ImageURL == "" {
		response.JSONError(c, http.StatusNotFound,
			"not_found", "image not found", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"image_url": *founder.ImageURL})
}

// CreateFounder creates a new founder
func (h *FoundersHandler) CreateFounder(c *gin.Context) {
	var req struct {
		Name       string  `json:"name" binding:"required"`
		Role       *string `json:"role,omitempty"`
		Email      *string `json:"email,omitempty"`
		StartupID  uint64  `json:"startup_id" binding:"required"`
		ImageURL   *string `json:"image_url,omitempty"`
		Visibility *bool   `json:"visibility,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, http.StatusBadRequest,
			"invalid_payload", "invalid request payload", err.Error())
		return
	}

	founder := models.Founder{
		Name:       req.Name,
		Role:       req.Role,
		Email:      req.Email,
		StartupID:  req.StartupID,
		ImageURL:   req.ImageURL,
		Visibility: true,
	}
	if req.Visibility != nil {
		founder.Visibility = *req.Visibility
	}

	if err := h.db.Create(&founder).Error; err != nil {
		h.log.WithError(err).Error("failed to create founder")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to create founder", nil)
		return
	}

	response.JSON(c, http.StatusCreated, gin.H{
		"message": "founder created successfully",
		"data":    founder})
}

// UpdateFounder updates a founder by ID
func (h *FoundersHandler) UpdateFounder(c *gin.Context) {
	id := c.Param("id")

	var founder models.Founder
	if err := h.db.Where("id = ?", id).First(&founder).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound, "not_found", "founder not found", nil)
			return
		}
		response.JSONError(c, http.StatusInternalServerError, "internal_error", "failed to retrieve founder", nil)
		return
	}

	var req struct {
		Name       *string `json:"name,omitempty"`
		Role       *string `json:"role,omitempty"`
		Email      *string `json:"email,omitempty"`
		ImageURL   *string `json:"image_url,omitempty"`
		Visibility *bool   `json:"visibility,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, http.StatusBadRequest,
			"invalid_payload", "invalid request payload", err.Error())
		return
	}

	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Role != nil {
		updates["role"] = *req.Role
	}
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.ImageURL != nil {
		updates["image_url"] = *req.ImageURL
	}
	if req.Visibility != nil {
		updates["visibility"] = *req.Visibility
	}

	if len(updates) == 0 {
		response.JSONError(c, http.StatusBadRequest,
			"no_fields", "no fields provided for update", nil)
		return
	}

	if err := h.db.Model(&founder).Updates(updates).Error; err != nil {
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to update founder", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"message": "founder updated successfully", "data": founder,
	})
}

// DeleteFounder removes a founder by ID (Admin only)
func (h *FoundersHandler) DeleteFounder(c *gin.Context) {
	id := c.Param("id")

	var founder models.Founder
	if err := h.db.Where("id = ?", id).First(&founder).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound, "not_found", "founder not found", nil)
			return
		}
		response.JSONError(c, http.StatusInternalServerError, "internal_error", "failed to retrieve founder", nil)
		return
	}

	if err := h.db.Delete(&founder).Error; err != nil {
		response.JSONError(c, http.StatusInternalServerError, "internal_error", "failed to delete founder", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"message": "founder deleted successfully",
	})
}