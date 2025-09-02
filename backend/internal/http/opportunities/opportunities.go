package opportunities

import (
	"errors"
	"fmt"
	"net/http"
	"slices"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/http/pagination"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type Opportunity struct {
	ID           uint       `json:"id" gorm:"primarykey"`
	Title        string     `json:"title" gorm:"type:varchar(255);not null"`
	Type         string     `json:"type" gorm:"type:varchar(100);not null;index:idx_opportunities_type"`
	Organism     string     `json:"organism" gorm:"type:varchar(255);not null"`
	Description  *string    `json:"description,omitempty" gorm:"type:text"`
	Criteria     *string    `json:"criteria,omitempty" gorm:"type:text"`
	ExternalLink *string    `json:"external_link,omitempty" gorm:"type:varchar(500)"`
	Deadline     *time.Time `json:"deadline,omitempty" gorm:"index:idx_opportunities_deadline"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type OpportunityHandler struct {
	log *logrus.Logger
	db  *gorm.DB
}

var validSortFields = []string{
	"id",
	"title",
	"type",
	"organism",
	"deadline",
	"created_at",
	"updated_at",
}

func NewOpportunityHandler(log *logrus.Logger, db *gorm.DB) *OpportunityHandler {
	return &OpportunityHandler{
		log: log,
		db:  db,
	}
}

// GetOpportunities returns a list of opportunities
func (h *OpportunityHandler) GetOpportunities(c *gin.Context) {
	params := pagination.Parse(c)
	offset := (params.Page - 1) * params.PerPage

	if !slices.Contains(validSortFields, params.Sort) {
		h.log.WithField("sort", params.Sort).Warn("invalid sort field provided")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2117,
			"message": fmt.Sprintf("invalid sort field '%s'. Allowed fields: %v", params.Sort, validSortFields),
		})
		return
	}

	var total int64
	if err := h.db.Model(&Opportunity{}).Count(&total).Error; err != nil {
		h.log.WithError(err).Error("h.db.Model().Count().Error")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve opportunities count",
		})
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.Sort, params.Order)

	var opportunities []Opportunity
	if err := h.db.Order(orderBy).Offset(offset).Limit(params.PerPage).Find(&opportunities).Error; err != nil {
		h.log.WithError(err).Error("failed to fetch opportunities")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve opportunities",
		})
		return
	}

	totalPages := (int(total) + params.PerPage - 1) / params.PerPage
	hasNext := params.Page < totalPages
	hasPrev := params.Page > 1

	response.JSON(c, http.StatusOK, gin.H{
		"data": opportunities,
		"pagination": gin.H{
			"page":     params.Page,
			"per_page": params.PerPage,
			"total":    total,
			"has_next": hasNext,
			"has_prev": hasPrev,
		},
	})
}

// GetOpportunity returns a specific opportunity by ID
func (h *OpportunityHandler) GetOpportunity(c *gin.Context) {
	id := c.Param("id")

	var opportunity Opportunity
	if err := h.db.Where("id = ?", id).First(&opportunity).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("id", id).Warn("opportunity not found")
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    404,
				"message": "opportunity not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch opportunity")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve opportunity",
		})
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"data": opportunity,
	})
}

// DeleteOpportunity removes an opportunity by ID (Admin only)
func (h *OpportunityHandler) DeleteOpportunity(c *gin.Context) {
	id := c.Param("id")

	var opportunity Opportunity
	if err := h.db.Where("id = ?", id).First(&opportunity).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("id", id).Warn("opportunity not found for deletion")
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "opportunity not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch opportunity for deletion")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve opportunity",
		})
		return
	}

	if err := h.db.Delete(&opportunity).Error; err != nil {
		h.log.WithError(err).WithField("id", id).Error("failed to delete opportunity")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to delete opportunity",
		})
		return
	}

	h.log.WithField("id", id).Info("opportunity deleted successfully")
	response.JSON(c, http.StatusOK, gin.H{
		"message": "opportunity deleted successfully",
	})
}

func (h *OpportunityHandler) CreateOpportunity(c *gin.Context) {
	var req struct {
		Title        string     `json:"title" binding:"required,max=255"`
		Type         string     `json:"type" binding:"required,max=100"`
		Organism     string     `json:"organism" binding:"required,max=255"`
		Description  *string    `json:"description,omitempty"`
		Criteria     *string    `json:"criteria,omitempty"`
		ExternalLink *string    `json:"external_link,omitempty" binding:"omitempty,max=500"`
		Deadline     *time.Time `json:"deadline,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.WithError(err).Warn("invalid request payload for opportunity creation")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2100,
			"message": "invalid request payload",
			"errors":  err.Error(),
		})
		return
	}

	opportunity := Opportunity{
		Title:        req.Title,
		Type:         req.Type,
		Organism:     req.Organism,
		Description:  req.Description,
		Criteria:     req.Criteria,
		ExternalLink: req.ExternalLink,
		Deadline:     req.Deadline,
	}

	if err := h.db.Create(&opportunity).Error; err != nil {
		h.log.WithError(err).Error("failed to create opportunity")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to create opportunity",
		})
		return
	}

	h.log.WithField("id", opportunity.ID).Info("opportunity created successfully")
	response.JSON(c, http.StatusCreated, gin.H{
		"message": "opportunity created successfully",
		"data":    opportunity,
	})
}

func (h *OpportunityHandler) UpdateOpportunity(c *gin.Context) {
	id := c.Param("id")

	var opportunity Opportunity
	if err := h.db.Where("id = ?", id).First(&opportunity).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("id", id).Warn("opportunity not found for update")
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "opportunity not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch opportunity for update")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve opportunity",
		})
		return
	}

	var req struct {
		Title        *string    `json:"title,omitempty" binding:"omitempty,max=255"`
		Type         *string    `json:"type,omitempty" binding:"omitempty,max=100"`
		Organism     *string    `json:"organism,omitempty" binding:"omitempty,max=255"`
		Description  *string    `json:"description,omitempty"`
		Criteria     *string    `json:"criteria,omitempty"`
		ExternalLink *string    `json:"external_link,omitempty" binding:"omitempty,max=500"`
		Deadline     *time.Time `json:"deadline,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.WithError(err).Warn("invalid request payload for opportunity update")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2100,
			"message": "invalid request payload",
			"errors":  err.Error(),
		})
		return
	}

	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Type != nil {
		updates["type"] = *req.Type
	}
	if req.Organism != nil {
		updates["organism"] = *req.Organism
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Criteria != nil {
		updates["criteria"] = *req.Criteria
	}
	if req.ExternalLink != nil {
		updates["external_link"] = *req.ExternalLink
	}
	if req.Deadline != nil {
		updates["deadline"] = *req.Deadline
	}

	if len(updates) == 0 {
		h.log.WithField("id", id).Warn("no fields provided for update")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2101,
			"message": "no fields provided for update",
		})
		return
	}

	if err := h.db.Model(&opportunity).Updates(updates).Error; err != nil {
		h.log.WithError(err).WithField("id", id).Error("failed to update opportunity")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to update opportunity",
		})
		return
	}

	if err := h.db.Where("id = ?", id).First(&opportunity).Error; err != nil {
		h.log.WithError(err).WithField("id", id).Error("failed to fetch updated opportunity")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve updated opportunity",
		})
		return
	}

	h.log.WithField("id", id).Info("opportunity updated successfully")
	response.JSON(c, http.StatusOK, gin.H{
		"message": "opportunity updated successfully",
		"data":    opportunity,
	})
}
