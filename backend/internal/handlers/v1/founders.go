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
	log *logrus.Logger
	db  *gorm.DB
}

var validFounderSortFields = []string{
	"id",
	"user_id",
	"startup_id",
	"created_at",
}

type listFoundersParams struct {
	pagination pagination.Params
	UserID     string `form:"user_id" binding:"omitempty"`
	StartupID  string `form:"startup_id" binding:"omitempty"`
}

func NewFoundersHandler(log *logrus.Logger, db *gorm.DB) *FoundersHandler {
	return &FoundersHandler{
		log: log,
		db:  db,
	}
}

// GetFounders godoc
// @Summary      List founders
// @Description  Returns a paginated list of founders with filters and sorting.
// @Tags         Founders
// @Param        page       query int    false "Page" default(1)
// @Param        per_page   query int    false "Page size" default(20)
// @Param        sort       query string false "Sort field" Enums(id,user_id,startup_id,created_at) default(created_at)
// @Param        order      query string false "Sort order" Enums(asc,desc) default(desc)
// @Param        user_id    query string false "Filter by user id"
// @Param        startup_id query string false "Filter by startup id"
// @Success      200 {object} response.FounderListResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /founders [get]
func (h *FoundersHandler) GetFounders(c *gin.Context) {
	var params listFoundersParams
	params.pagination = pagination.Parse(c)
	if err := c.ShouldBindQuery(&params); err != nil {
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    "invalid_params",
			"message": err.Error(),
		})
		return
	}

	if !slices.Contains(validFounderSortFields, params.pagination.Sort) {
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code": "invalid_sort",
			"message": fmt.Sprintf(
				"invalid sort field '%s'. Allowed fields: %v", params.pagination.Sort, validFounderSortFields),
		})
		return
	}

	query := h.db.Model(&models.Founder{})
	if params.UserID != "" {
		query = query.Where("user_id = ?", params.UserID)
	}
	if params.StartupID != "" {
		query = query.Where("startup_id = ?", params.StartupID)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to count founders",
		})
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.pagination.Sort, params.pagination.Order)
	var founders []models.Founder
	if err := query.Order(orderBy).
		Offset((params.pagination.Page - 1) * params.pagination.PerPage).
		Limit(params.pagination.PerPage).
		Find(&founders).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve founders",
		})
		return
	}

	totalPages := (int(total) + params.pagination.PerPage - 1) / params.pagination.PerPage
	response.JSON(c, http.StatusOK, gin.H{
		"data": founders,
		"pagination": gin.H{
			"page":     params.pagination.Page,
			"per_page": params.pagination.PerPage,
			"total":    total,
			"has_next": params.pagination.Page < totalPages,
			"has_prev": params.pagination.Page > 1,
		},
	})
}

// GetFounder godoc
// @Summary      Get founder
// @Description  Retrieves a founder by ID.
// @Tags         Founders
// @Param        id path int true "Founder ID"
// @Success      200 {object} response.FounderObjectResponse
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /founders/{id} [get]
func (h *FoundersHandler) GetFounder(c *gin.Context) {
	id := c.Param("id")

	var founder models.Founder
	if err := h.db.Where("id = ?", id).First(&founder).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "founder not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch founder")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve founder",
		})
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"data": founder,
	})
}
