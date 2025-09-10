package v1

import (
	"errors"
	"net/http"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/http/pagination"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type listStartupsParams struct {
	pagination    pagination.Params
	Sector        string `form:"sector" binding:"omitempty,oneof=tech health finance"`
	Maturity      string `form:"maturity" binding:"omitempty,oneof=early middle late"`
	ProjectStatus string `form:"project_status" binding:"omitempty,oneof=ongoing completed"`
	Founder       string `form:"founder" binding:"omitempty"`
	CreatedAt     string `form:"created_at" binding:"omitempty"`
}

type StartupsHandler struct {
	db  *gorm.DB
	log *logrus.Logger
}

func NewStartupsHandler(db *gorm.DB, log *logrus.Logger) *StartupsHandler {
	return &StartupsHandler{
		db:  db,
		log: log,
	}
}

// ListStartups godoc
// @Summary      List startups
// @Description  Returns a paginated list of startups with filters and sorting.
// @Tags         Startups
// @Param        page           query int    false "Page" default(1)
// @Param        per_page       query int    false "Page size" default(20)
// @Param        sort           query string false "Sort field" default(created_at)
// @Param        order          query string false "Sort order" Enums(asc,desc) default(desc)
// @Param        sector         query string false "Sector filter" Enums(tech,health,finance)
// @Param        maturity       query string false "Maturity filter" Enums(early,middle,late)
// @Param        project_status query string false "Project status" Enums(ongoing,completed)
// @Param        founder        query string false "Founder filter"
// @Param        created_at     query string false "CreatedAt filter"
// @Success      200 {object} response.StartupListResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /startups [get]
func (h *StartupsHandler) ListStartups(ctx *gin.Context) {
	var params listStartupsParams
	params.pagination = pagination.Parse(ctx)

	h.log.Info(params.pagination)
	if err := ctx.ShouldBindQuery(&params); err != nil {
		h.log.WithError(err).Errorf("ctx.ShouldBindQuery(&%+v)", params)
		ctx.JSON(http.StatusBadRequest, gin.H{"code": "invalid_params", "message": err.Error()})
		return
	}

	query := h.db.Model(&models.Startup{})
	if params.Sector != "" {
		query = query.Where("sector = ?", params.Sector)
	}
	if params.Maturity != "" {
		query = query.Where("maturity = ?", params.Maturity)
	}
	if params.ProjectStatus != "" {
		query = query.Where("project_status = ?", params.ProjectStatus)
	}
	if params.Founder != "" {
		query = query.Where("founder = ?", params.Founder)
	}
	if params.CreatedAt != "" {
		query = query.Where("created_at = ?", params.CreatedAt)
	}

	query = query.
		Offset((params.pagination.Page - 1) * params.pagination.PerPage).
		Limit(params.pagination.PerPage).
		Order(params.pagination.Sort + " " + params.pagination.Order)

	var result []models.Startup
	if err := query.Find(&result).Error; err != nil {
		h.log.WithError(err).Errorf("query.Find(&%+v)", result)
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": "internal_error", "message": err.Error()})
		return
	}

	var total int64
	if err := h.db.Model(&models.Startup{}).Count(&total).Error; err != nil {
		h.log.WithError(err).Errorf("h.db.Model().Count().Error")
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": "internal_error", "message": err.Error()})
		return
	}

	totalPages := (int(total) + params.pagination.PerPage - 1) / params.pagination.PerPage
	hasNext := params.pagination.Page < totalPages
	hasPrev := params.pagination.Page > 1

	ctx.JSON(http.StatusOK, gin.H{
		"data": result,
		"pagination": gin.H{
			"page":     params.pagination.Page,
			"per_page": params.pagination.PerPage,
			"total":    total,
			"has_next": hasNext,
			"has_prev": hasPrev,
		},
	})
}

// GetStartup godoc
// @Summary      Get startup
// @Description  Retrieves a startup by ID.
// @Tags         Startups
// @Param        id   path int true "Startup ID"
// @Success      200 {object} response.StartupObjectResponse
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /startups/{id} [get]
func (h *StartupsHandler) GetStartup(ctx *gin.Context) {
	id := ctx.Param("id")

	var result models.Startup
	err := h.db.
		Model(&models.Startup{}).
		Where("id = ?", id).
		First(&result).
		Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"code": "not_found", "message": "startup not found"})
			return
		}
		h.log.Errorf("GetStartup: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": "internal_error", "message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": result,
	})
}

// CreateStartup godoc
// @Summary      Create startup
// @Description  Creates a startup (admin required).
// @Tags         Startups
// @Security     CookieAuth
// @Accept       json
// @Produce      json
// @Param        payload body models.Startup true "Startup"
// @Success      201 {object} response.StartupObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/startups [post]
func (h *StartupsHandler) CreateStartup(ctx *gin.Context) {
	var req models.Startup

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.JSONError(ctx, http.StatusBadRequest,
			"invalid_payload", "invalid request payload", err.Error())
		return
	}

	req.CreatedAt = time.Now().UTC()

	if err := h.db.Create(&req).Error; err != nil {
		h.log.WithError(err).Error("h.db.Create().Error")
		response.JSONError(ctx, http.StatusInternalServerError,
			"internal_error", "failed to create startup", nil)
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{
		"message": "startup created successfully",
		"data":    req,
	})
}

// UpdateStartup godoc
// @Summary      Update startup
// @Description  Updates a startup by ID (admin required).
// @Tags         Startups
// @Security     CookieAuth
// @Accept       json
// @Produce      json
// @Param        id      path   int    true  "Startup ID"
// @Param        payload body   requests.StartupUpdateRequest true  "Fields to update"
// @Success      200 {object} response.StartupObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/startups/{id} [patch]
// @Router       /founder/startups/{id} [patch]
func (h *StartupsHandler) UpdateStartup(ctx *gin.Context) {
	id := ctx.Param("id")

	var startup models.Startup
	if err := h.db.Where("id = ?", id).First(&startup).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(ctx, http.StatusNotFound,
				"not_found", "startup not found", nil)
			return
		}
		response.JSONError(ctx, http.StatusInternalServerError,
			"internal_error", "failed to retrieve startup", nil)
		return
	}

	var req struct {
		Name           *string `json:"name,omitempty"`
		Email          *string `json:"email,omitempty" binding:"omitempty,email"`
		Sector         *string `json:"sector,omitempty" binding:"omitempty,oneof=tech health finance"`
		Maturity       *string `json:"maturity,omitempty" binding:"omitempty,oneof=early middle late"`
		ProjectStatus  *string `json:"project_status,omitempty" binding:"omitempty,oneof=ongoing completed"`
		Description    *string `json:"description,omitempty"`
		WebsiteURL     *string `json:"website_url,omitempty" binding:"omitempty,url"`
		SocialMediaURL *string `json:"social_media_url,omitempty" binding:"omitempty,url"`
		Needs          *string `json:"needs,omitempty"`
		LegalStatus    *string `json:"legal_status,omitempty"`
		Address        *string `json:"address,omitempty"`
		Phone          *string `json:"phone,omitempty"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		h.log.WithError(err).Warn("invalid request payload for startup update")
		response.JSONError(ctx, http.StatusBadRequest,
			"invalid_payload", "invalid request payload", err.Error())
		return
	}

	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.Sector != nil {
		updates["sector"] = *req.Sector
	}
	if req.Maturity != nil {
		updates["maturity"] = *req.Maturity
	}
	if req.ProjectStatus != nil {
		updates["project_status"] = *req.ProjectStatus
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.WebsiteURL != nil {
		updates["website_url"] = *req.WebsiteURL
	}
	if req.SocialMediaURL != nil {
		updates["social_media_url"] = *req.SocialMediaURL
	}
	if req.Needs != nil {
		updates["needs"] = *req.Needs
	}
	if req.LegalStatus != nil {
		updates["legal_status"] = *req.LegalStatus
	}
	if req.Address != nil {
		updates["address"] = *req.Address
	}
	if req.Phone != nil {
		updates["phone"] = *req.Phone
	}

	if len(updates) == 0 {
		ctx.JSON(http.StatusOK, gin.H{
			"message": "no fields provided, nothing updated",
			"data":    startup,
		})
		return
	}

	if err := h.db.Model(&startup).Updates(updates).Error; err != nil {
		response.JSONError(ctx, http.StatusInternalServerError,
			"internal_error", "failed to update startup", nil)
		return
	}

	if err := h.db.Where("id = ?", id).First(&startup).Error; err != nil {
		response.JSONError(ctx, http.StatusInternalServerError,
			"internal_error", "failed to reload updated startup", nil)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "startup updated successfully",
		"data":    startup,
	})
}

// DeleteStartup godoc
// @Summary      Delete startup
// @Description  Deletes a startup by ID (admin required).
// @Tags         Startups
// @Security     CookieAuth
// @Param        id   path int true "Startup ID"
// @Success      200 {object} response.MessageResponse
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/startups/{id} [delete]
// @Router       /founder/startups/{id} [delete]
func (h *StartupsHandler) DeleteStartup(ctx *gin.Context) {
	id := ctx.Param("id")

	var startup models.Startup
	if err := h.db.Where("id = ?", id).First(&startup).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(ctx, http.StatusNotFound,
				"not_found", "startup not found", nil)
			return
		}
		response.JSONError(ctx, http.StatusInternalServerError,
			"internal_error", "failed to retrieve startup", nil)
		return
	}

	if err := h.db.Delete(&startup).Error; err != nil {
		response.JSONError(ctx, http.StatusInternalServerError,
			"internal_error", "failed to delete startup", nil)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "startup deleted successfully",
	})
}

// IncrementViews godoc
// @Summary      Increment views count
// @Description  Increments the views counter of a startup.
// @Tags         Startups
// @Param        id   path int true "Startup ID"
// @Success      200 {object} response.StartupObjectResponse
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /startups/{id}/views [post]
func (h *StartupsHandler) IncrementViews(ctx *gin.Context) {
	id := ctx.Param("id")

	var startup models.Startup
	if err := h.db.First(&startup, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"code": "not_found", "message": "startup not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": "internal_error", "message": err.Error()})
		return
	}

	if err := h.db.Model(&startup).
		UpdateColumn("views_count", gorm.Expr("views_count + ?", 1)).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": err.Error(),
		})
		return
	}

	if err := h.db.First(&startup, "id = ?", id).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "views incremented successfully",
		"data":    startup,
	})
}
