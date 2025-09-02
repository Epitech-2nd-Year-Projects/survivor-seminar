package opportunities

import (
	"errors"
	"fmt"
	"net/http"
	"slices"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/http/pagination"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type Opportunity struct {
	ID           uint           `json:"id" gorm:"primarykey"`
	Title        string         `json:"title" gorm:"type:varchar(255);not null"`
	Type         string         `json:"type" gorm:"type:varchar(100);not null;index:idx_opportunities_type"`
	Organism     string         `json:"organism" gorm:"type:varchar(255);not null"`
	Description  *string        `json:"description,omitempty" gorm:"type:text"`
	Criteria     *string        `json:"criteria,omitempty" gorm:"type:text"`
	ExternalLink *string        `json:"external_link,omitempty" gorm:"type:varchar(500)"`
	Deadline     *time.Time     `json:"deadline,omitempty" gorm:"index:idx_opportunities_deadline"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type OpportunityHandler struct {
	cfg *config.Config
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

func NewOpportunityHandler(cfg *config.Config, log *logrus.Logger, db *gorm.DB) *OpportunityHandler {
	return &OpportunityHandler{
		cfg: cfg,
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
		h.log.WithError(err).Error("failed to count opportunities")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    502,
			"message": "failed to retrieve opportunities count",
		})
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.Sort, params.Order)

	var opportunities []Opportunity
	if err := h.db.Order(orderBy).Offset(offset).Limit(params.PerPage).Find(&opportunities).Error; err != nil {
		h.log.WithError(err).Error("failed to fetch opportunities")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "database_error",
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
			"page":        params.Page,
			"per_page":    params.PerPage,
			"total":       total,
			"total_pages": totalPages,
			"has_next":    hasNext,
			"has_prev":    hasPrev,
		},
	})
}

// GetOpportunity returns a specific opportunity by ID
func (h *OpportunityHandler) GetOpportunity(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		h.log.Warn("opportunity id parameter is missing")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2116,
			"message": "opportunity id is required",
		})
		return
	}

	params := pagination.Parse(c)

	if !slices.Contains(validSortFields, params.Sort) {
		h.log.WithField("sort", params.Sort).Warn("invalid sort field provided")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2117,
			"message": fmt.Sprintf("invalid sort field '%s'. Allowed fields: %v", params.Sort, validSortFields),
		})
		return
	}

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
			"code":    502,
			"message": "failed to retrieve opportunity",
		})
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"data": []Opportunity{opportunity},
		"pagination": gin.H{
			"page":        1,
			"per_page":    1,
			"total":       1,
			"total_pages": 1,
			"has_next":    false,
			"has_prev":    false,
		},
	})
}
