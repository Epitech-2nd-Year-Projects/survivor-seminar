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

type listOpportunitiesParams struct {
	pagination pagination.Params
	Type       string `form:"type" binding:"omitempty"`
	Organism   string `form:"organism" binding:"omitempty"`
	Deadline   string `form:"deadline" binding:"omitempty"`
}

func NewOpportunityHandler(log *logrus.Logger, db *gorm.DB) *OpportunityHandler {
	return &OpportunityHandler{
		log: log,
		db:  db,
	}
}

// GetOpportunities godoc
// @Summary      List opportunities
// @Description  Returns a paginated list of opportunities with filters and sorting.
// @Tags         Opportunities
// @Param        page      query int    false "Page" default(1)
// @Param        per_page  query int    false "Page size" default(20)
// @Param        sort      query string false "Sort field" Enums(id,title,type,organism,deadline,created_at,updated_at) default(created_at)
// @Param        order     query string false "Sort order" Enums(asc,desc) default(desc)
// @Param        type      query string false "Filter by type (grant, loan, etc.)"
// @Param        organism  query string false "Filter by organism"
// @Param        deadline  query string false "Filter by deadline (YYYY-MM-DD)"
// @Success      200 {object} response.OpportunityListResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /opportunities [get]
func (h *OpportunityHandler) GetOpportunities(c *gin.Context) {
	var params listOpportunitiesParams
	params.pagination = pagination.Parse(c)

	if err := c.ShouldBindQuery(&params); err != nil {
		response.JSON(c, http.StatusBadRequest,
			gin.H{"code": "invalid_params", "message": err.Error()})
		return
	}

	if !slices.Contains(validSortFields, params.pagination.Sort) {
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2117,
			"message": fmt.Sprintf("invalid sort field '%s'. Allowed fields: %v", params.pagination.Sort, validSortFields),
		})
		return
	}

	query := h.db.Model(&models.Opportunity{})
	if params.Type != "" {
		query = query.Where("type = ?", params.Type)
	}
	if params.Organism != "" {
		query = query.Where("organism = ?", params.Organism)
	}
	if params.Deadline != "" {
		query = query.Where("deadline::date = ?", params.Deadline)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to count opportunities"})
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.pagination.Sort, params.pagination.Order)
	var opportunities []models.Opportunity
	if err := query.Order(orderBy).
		Offset((params.pagination.Page - 1) * params.pagination.PerPage).
		Limit(params.pagination.PerPage).
		Find(&opportunities).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to retrieve opportunities"})
		return
	}

	totalPages := (int(total) + params.pagination.PerPage - 1) / params.pagination.PerPage
	response.JSON(c, http.StatusOK, gin.H{
		"data": opportunities,
		"pagination": gin.H{
			"page":     params.pagination.Page,
			"per_page": params.pagination.PerPage,
			"total":    total,
			"has_next": params.pagination.Page < totalPages,
			"has_prev": params.pagination.Page > 1,
		},
	})
}

// GetOpportunity godoc
// @Summary      Get opportunity
// @Description  Retrieves an opportunity by ID.
// @Tags         Opportunities
// @Param        id path int true "Opportunity ID"
// @Success      200 {object} response.OpportunityObjectResponse
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /opportunities/{id} [get]
func (h *OpportunityHandler) GetOpportunity(c *gin.Context) {
	id := c.Param("id")

	var opportunity models.Opportunity
	if err := h.db.Where("id = ?", id).First(&opportunity).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("id", id).Warn("h.db.Where().First().Error")
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
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

// DeleteOpportunity godoc
// @Summary      Delete opportunity
// @Description  Deletes an opportunity (admin required).
// @Tags         Opportunities
// @Security     CookieAuth
// @Param        id path int true "Opportunity ID"
// @Success      200 {object} response.MessageResponse
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/opportunities/{id} [delete]
func (h *OpportunityHandler) DeleteOpportunity(c *gin.Context) {
	id := c.Param("id")

	var opportunity models.Opportunity
	if err := h.db.Where("id = ?", id).First(&opportunity).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("id", id).Warn("h.db.Where().First().Error")
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
		h.log.WithError(err).WithField("id", id).Error("h.db.Delete().Error")
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

// CreateOpportunity godoc
// @Summary      Create opportunity
// @Description  Creates an opportunity (admin required).
// @Tags         Opportunities
// @Security     CookieAuth
// @Accept       json
// @Produce      json
// @Param        payload body requests.OpportunityCreateRequest true "Opportunity" Example({"title":"AI Grant","type":"grant","organism":"EU","deadline":"2025-12-31T00:00:00Z"})
// @Success      201 {object} response.OpportunityObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/opportunities [post]
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
		h.log.WithError(err).Warn(" c.ShouldBindJSON()")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2100,
			"message": "invalid request payload",
			"errors":  err.Error(),
		})
		return
	}

	opportunity := models.Opportunity{
		Title:        req.Title,
		Type:         req.Type,
		Organism:     req.Organism,
		Description:  req.Description,
		Criteria:     req.Criteria,
		ExternalLink: req.ExternalLink,
		Deadline:     req.Deadline,
	}

	if err := h.db.Create(&opportunity).Error; err != nil {
		h.log.WithError(err).Error(" h.db.Create().Error")
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

// UpdateOpportunity godoc
// @Summary      Update opportunity
// @Description  Updates an opportunity (admin required).
// @Tags         Opportunities
// @Security     CookieAuth
// @Accept       json
// @Produce      json
// @Param        id      path   int    true  "Opportunity ID"
// @Param        payload body   requests.OpportunityUpdateRequest true  "Fields to update" Example({"criteria":"New criteria","external_link":"https://..."})
// @Success      200 {object} response.OpportunityObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/opportunities/{id} [patch]

func (h *OpportunityHandler) UpdateOpportunity(c *gin.Context) {
	id := c.Param("id")

	var opportunity models.Opportunity
	if err := h.db.Where("id = ?", id).First(&opportunity).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("id", id).Warn("h.db.Where().First().Error")
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
		h.log.WithError(err).WithField("id", id).Error("h.db.Model().Updates().Error")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to update opportunity",
		})
		return
	}

	if err := h.db.Where("id = ?", id).First(&opportunity).Error; err != nil {
		h.log.WithError(err).WithField("id", id).Error("h.db.Where().First().Error")
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
