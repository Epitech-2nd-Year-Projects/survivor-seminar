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

type InvestorsHandler struct {
	db  *gorm.DB
	log *logrus.Logger
}

func NewInvestorsHandler(db *gorm.DB, log *logrus.Logger) *InvestorsHandler {
	return &InvestorsHandler{
		db:  db,
		log: log,
	}
}

var validInvestorSortFields = []string{
	"id",
	"name",
	"email",
	"created_at",
	"investor_type",
	"investment_focus",
}

// GetInvestors returns a list of investors
func (h *InvestorsHandler) GetInvestors(c *gin.Context) {
	params := pagination.Parse(c)
	offset := (params.Page - 1) * params.PerPage

	if !slices.Contains(validInvestorSortFields, params.Sort) {
		response.JSONError(c, http.StatusBadRequest,
			"invalid_sort",
			fmt.Sprintf("invalid sort field '%s'. Allowed: %v", params.Sort, validInvestorSortFields), nil)
		return
	}

	var total int64
	if err := h.db.Model(&models.Investor{}).Count(&total).Error; err != nil {
		h.log.WithError(err).Error("failed to count investors")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve investors count", nil)
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.Sort, params.Order)
	var investors []models.Investor
	if err := h.db.Order(orderBy).Offset(offset).Limit(params.PerPage).Find(&investors).Error; err != nil {
		h.log.WithError(err).Error("failed to fetch investors")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve investors", nil)
		return
	}

	totalPages := (int(total) + params.PerPage - 1) / params.PerPage
	hasNext := params.Page < totalPages
	hasPrev := params.Page > 1

	response.JSON(c, http.StatusOK, gin.H{
		"data": investors,
		"pagination": gin.H{
			"page":     params.Page,
			"per_page": params.PerPage,
			"total":    total,
			"has_next": hasNext,
			"has_prev": hasPrev,
		},
	})
}

// GetInvestor returns a specific investor by ID
func (h *InvestorsHandler) GetInvestor(c *gin.Context) {
	id := c.Param("id")

	var investor models.Investor
	if err := h.db.Where("id = ?", id).First(&investor).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound,
				"not_found", "investor not found", nil)
			return
		}
		h.log.WithError(err).Error("failed to retrieve investor")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve investor", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"data": investor})
}

// CreateInvestor creates a new investor
func (h *InvestorsHandler) CreateInvestor(c *gin.Context) {
	var req struct {
		Name            string  `json:"name" binding:"required"`
		LegalStatus     *string `json:"legal_status,omitempty"`
		Address         *string `json:"address,omitempty"`
		Email           string  `json:"email,omitempty" binding:"omitempty,email,required"`
		Phone           *string `json:"phone,omitempty"`
		Description     *string `json:"description,omitempty"`
		InvestorType    *string `json:"investor_type,omitempty"`
		InvestmentFocus *string `json:"investment_focus,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, http.StatusBadRequest,
			"invalid_payload", "invalid request payload", err.Error())
		return
	}

	investor := models.Investor{
		Name:            req.Name,
		LegalStatus:     req.LegalStatus,
		Address:         req.Address,
		Email:           req.Email,
		Phone:           req.Phone,
		Description:     req.Description,
		InvestorType:    req.InvestorType,
		InvestmentFocus: req.InvestmentFocus,
	}

	if err := h.db.Create(&investor).Error; err != nil {
		h.log.WithError(err).Error("failed to create investor")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to create investor", nil)
		return
	}

	response.JSON(c, http.StatusCreated, gin.H{
		"message": "investor created successfully",
		"data":    investor})
}

// UpdateInvestor updates an investor by ID
func (h *InvestorsHandler) UpdateInvestor(c *gin.Context) {
	id := c.Param("id")

	var investor models.Investor
	if err := h.db.Where("id = ?", id).First(&investor).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound, "not_found", "investor not found", nil)
			return
		}
		response.JSONError(c, http.StatusInternalServerError, "internal_error", "failed to retrieve investor", nil)
		return
	}

	var req struct {
		Name            *string `json:"name,omitempty"`
		LegalStatus     *string `json:"legal_status,omitempty"`
		Address         *string `json:"address,omitempty"`
		Email           *string `json:"email,omitempty" binding:"omitempty,email"`
		Phone           *string `json:"phone,omitempty"`
		Description     *string `json:"description,omitempty"`
		InvestorType    *string `json:"investor_type,omitempty"`
		InvestmentFocus *string `json:"investment_focus,omitempty"`
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
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.InvestorType != nil {
		updates["investor_type"] = *req.InvestorType
	}
	if req.InvestmentFocus != nil {
		updates["investment_focus"] = *req.InvestmentFocus
	}

	if len(updates) == 0 {
		response.JSONError(c, http.StatusBadRequest,
			"no_fields", "no fields provided for update", nil)
		return
	}

	if err := h.db.Model(&investor).Updates(updates).Error; err != nil {
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to update investor", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"message": "investor updated successfully", "data": investor,
	})
}

// DeleteInvestor removes an investor by ID (Admin only)
func (h *InvestorsHandler) DeleteInvestor(c *gin.Context) {
	id := c.Param("id")

	var investor models.Investor
	if err := h.db.Where("id = ?", id).First(&investor).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound, "not_found", "investor not found", nil)
			return
		}
		response.JSONError(c, http.StatusInternalServerError, "internal_error", "failed to retrieve investor", nil)
		return
	}

	if err := h.db.Delete(&investor).Error; err != nil {
		response.JSONError(c, http.StatusInternalServerError, "internal_error", "failed to delete investor", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"message": "investor deleted successfully",
	})
}
