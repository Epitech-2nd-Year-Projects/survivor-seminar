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
