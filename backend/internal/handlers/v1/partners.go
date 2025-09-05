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

type PartnersHandler struct {
	log *logrus.Logger
	db  *gorm.DB
}

var validPartnerSortFields = []string{
	"id",
	"name",
	"email",
	"legal_status",
	"partnership_type",
	"created_at",
}

func NewPartnersHandler(log *logrus.Logger, db *gorm.DB) *PartnersHandler {
	return &PartnersHandler{
		log: log,
		db:  db,
	}
}

// GetPartners returns a list of partners
func (h *PartnersHandler) GetPartners(c *gin.Context) {
	params := pagination.Parse(c)
	offset := (params.Page - 1) * params.PerPage

	if !slices.Contains(validPartnerSortFields, params.Sort) {
		h.log.WithField("sort", params.Sort).Warn("invalid sort field")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2117,
			"message": fmt.Sprintf("invalid sort field '%s'. Allowed fields: %v", params.Sort, validPartnerSortFields),
		})
		return
	}

	var total int64
	if err := h.db.Model(&models.Partner{}).Count(&total).Error; err != nil {
		h.log.WithError(err).Error("failed to count partners")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve partners count",
		})
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.Sort, params.Order)

	var partners []models.Partner
	if err := h.db.Order(orderBy).Offset(offset).Limit(params.PerPage).Find(&partners).Error; err != nil {
		h.log.WithError(err).Error("failed to fetch partners")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve partners",
		})
		return
	}

	totalPages := (int(total) + params.PerPage - 1) / params.PerPage
	hasNext := params.Page < totalPages
	hasPrev := params.Page > 1

	response.JSON(c, http.StatusOK, gin.H{
		"data": partners,
		"pagination": gin.H{
			"page":     params.Page,
			"per_page": params.PerPage,
			"total":    total,
			"has_next": hasNext,
			"has_prev": hasPrev,
		},
	})
}

// GetPartner returns a specific partner by ID
func (h *PartnersHandler) GetPartner(c *gin.Context) {
	id := c.Param("id")

	var partner models.Partner
	if err := h.db.Where("id = ?", id).First(&partner).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("id", id).Warn("partner not found")
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "partner not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch partner")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve partner",
		})
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"data": partner,
	})
}

func (h *PartnersHandler) CreatePartner(c *gin.Context) {
	var req struct {
		Name            string     `json:"name" binding:"required,max=255"`
		LegalStatus     *string    `json:"legal_status,omitempty"`
		Address         *string    `json:"address,omitempty"`
		Email           string     `json:"email" binding:"required,email"`
		Phone           *string    `json:"phone,omitempty"`
		CreatedAt       *time.Time `json:"created_at,omitempty"`
		Description     *string    `json:"description,omitempty"`
		PartnershipType *string    `json:"partnership_type,omitempty"`
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

	partner := models.Partner{
		Name:            req.Name,
		LegalStatus:     req.LegalStatus,
		Address:         req.Address,
		Email:           req.Email,
		Phone:           req.Phone,
		CreatedAt:       req.CreatedAt,
		Description:     req.Description,
		PartnershipType: req.PartnershipType,
	}

	if err := h.db.Create(&partner).Error; err != nil {
		h.log.WithError(err).Error("failed to create partner")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to create partner",
		})
		return
	}

	h.log.WithField("id", partner.ID).Info("partner created successfully")
	response.JSON(c, http.StatusCreated, gin.H{
		"message": "partner created successfully",
		"data":    partner,
	})
}

// UpdatePartner updates a partner by ID
func (h *PartnersHandler) UpdatePartner(c *gin.Context) {
	id := c.Param("id")

	var partner models.Partner
	if err := h.db.Where("id = ?", id).First(&partner).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("id", id).Warn("partner not found")
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "partner not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch partner for update")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve partner",
		})
		return
	}

	var req struct {
		Name            *string    `json:"name,omitempty" binding:"omitempty,max=255"`
		LegalStatus     *string    `json:"legal_status,omitempty"`
		Address         *string    `json:"address,omitempty"`
		Email           *string    `json:"email,omitempty" binding:"omitempty,email"`
		Phone           *string    `json:"phone,omitempty"`
		CreatedAt       *time.Time `json:"created_at,omitempty"`
		Description     *string    `json:"description,omitempty"`
		PartnershipType *string    `json:"partnership_type,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.WithError(err).Warn("invalid request payload for update")
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
	if req.LegalStatus != nil {
		updates["legal_status"] = *req.LegalStatus
	}
	if req.Address != nil {
		updates["address"] = *req.Address
	}
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.Phone != nil {
		updates["phone"] = *req.Phone
	}
	if req.CreatedAt != nil {
		updates["created_at"] = *req.CreatedAt
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.PartnershipType != nil {
		updates["partnership_type"] = *req.PartnershipType
	}

	if len(updates) == 0 {
		h.log.WithField("id", id).Warn("no fields provided for update")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2101,
			"message": "no fields provided for update",
		})
		return
	}

	if err := h.db.Model(&partner).Updates(updates).Error; err != nil {
		h.log.WithError(err).WithField("id", id).Error("failed to update partner")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to update partner",
		})
		return
	}

	if err := h.db.Where("id = ?", id).First(&partner).Error; err != nil {
		h.log.WithError(err).WithField("id", id).Error("failed to fetch updated partner")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve updated partner",
		})
		return
	}

	h.log.WithField("id", id).Info("partner updated successfully")
	response.JSON(c, http.StatusOK, gin.H{
		"message": "partner updated successfully",
		"data":    partner,
	})
}

// DeletePartner removes a partner by ID (Admin only)
func (h *PartnersHandler) DeletePartner(c *gin.Context) {
	id := c.Param("id")

	var partner models.Partner
	if err := h.db.Where("id = ?", id).First(&partner).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("id", id).Warn("partner not found")
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "partner not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch partner for deletion")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve partner",
		})
		return
	}

	if err := h.db.Delete(&partner).Error; err != nil {
		h.log.WithError(err).WithField("id", id).Error("failed to delete partner")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to delete partner",
		})
		return
	}

	h.log.WithField("id", id).Info("partner deleted successfully")
	response.JSON(c, http.StatusOK, gin.H{
		"message": "partner deleted successfully",
	})
}
