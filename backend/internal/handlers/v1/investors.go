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

type listInvestorsParams struct {
	pagination      pagination.Params
	InvestorType    string `form:"investor_type" binding:"omitempty"`
	InvestmentFocus string `form:"investment_focus" binding:"omitempty"`
	Email           string `form:"email" binding:"omitempty,email"`
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

// GetInvestors godoc
// @Summary      List investors
// @Description  Returns a paginated list of investors with filters and sorting.
// @Tags         Investors
// @Param        page             query int    false "Page" default(1)
// @Param        per_page         query int    false "Page size" default(20)
// @Param        sort             query string false "Sort field" Enums(id,name,email,created_at,investor_type,investment_focus) default(created_at)
// @Param        order            query string false "Sort order" Enums(asc,desc) default(desc)
// @Param        investor_type    query string false "Filter by investor type"
// @Param        investment_focus query string false "Filter by investment focus (contains)"
// @Param        email            query string false "Filter by email"
// @Success      200 {object} response.InvestorListResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /investors [get]
func (h *InvestorsHandler) GetInvestors(c *gin.Context) {
	var params listInvestorsParams
	params.pagination = pagination.Parse(c)

	if err := c.ShouldBindQuery(&params); err != nil {
		response.JSON(c, http.StatusBadRequest, gin.H{"code": "invalid_params", "message": err.Error()})
		return
	}

	if !slices.Contains(validInvestorSortFields, params.pagination.Sort) {
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2117,
			"message": fmt.Sprintf("invalid sort field '%s'. Allowed fields: %v", params.pagination.Sort, validInvestorSortFields),
		})
		return
	}

	query := h.db.Model(&models.Investor{})
	if params.InvestorType != "" {
		query = query.Where("investor_type = ?", params.InvestorType)
	}
	if params.InvestmentFocus != "" {
		query = query.Where("investment_focus ILIKE ?", "%"+params.InvestmentFocus+"%")
	}
	if params.Email != "" {
		query = query.Where("email = ?", params.Email)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to count investors"})
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.pagination.Sort, params.pagination.Order)
	var investors []models.Investor
	if err := query.Order(orderBy).
		Offset((params.pagination.Page - 1) * params.pagination.PerPage).
		Limit(params.pagination.PerPage).
		Find(&investors).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to retrieve investors"})
		return
	}

	totalPages := (int(total) + params.pagination.PerPage - 1) / params.pagination.PerPage
	response.JSON(c, http.StatusOK, gin.H{
		"data": investors,
		"pagination": gin.H{
			"page":     params.pagination.Page,
			"per_page": params.pagination.PerPage,
			"total":    total,
			"has_next": params.pagination.Page < totalPages,
			"has_prev": params.pagination.Page > 1,
		},
	})
}

// GetInvestor godoc
// @Summary      Get investor
// @Description  Retrieves an investor by ID.
// @Tags         Investors
// @Param        id path int true "Investor ID"
// @Success      200 {object} response.InvestorObjectResponse
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /investors/{id} [get]
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

// CreateInvestor godoc
// @Summary      Create investor
// @Description  Creates an investor (admin required).
// @Tags         Investors
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        payload body requests.InvestorCreateRequest true "Investor" Example({"name":"VC Alpha","email":"contact@vcalpha.tld","investor_type":"VC","investment_focus":"Seed"})
// @Success      201 {object} response.InvestorObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/investors [post]
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

// UpdateInvestor godoc
// @Summary      Update investor
// @Description  Updates an investor (admin required).
// @Tags         Investors
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path   int    true  "Investor ID"
// @Param        payload body   requests.InvestorUpdateRequest true  "Fields to update" Example({"phone":"+33 1 23 45 67 89","description":"Early-stage investor"})
// @Success      200 {object} response.InvestorObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/investors/{id} [patch]
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

// DeleteInvestor godoc
// @Summary      Delete investor
// @Description  Deletes an investor (admin required).
// @Tags         Investors
// @Security     BearerAuth
// @Param        id path int true "Investor ID"
// @Success      200 {object} response.MessageResponse
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/investors/{id} [delete]
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
