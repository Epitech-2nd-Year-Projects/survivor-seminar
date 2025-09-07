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

type NewsHandler struct {
	db  *gorm.DB
	log *logrus.Logger
}

var validNewsSortFields = []string{
	"id",
	"title",
	"news_date",
	"category",
	"startup_id",
	"created_at",
	"updated_at",
}

type listNewsParams struct {
	pagination pagination.Params
	Category   string `form:"category" binding:"omitempty"`
	StartupID  uint64 `form:"startup_id" binding:"omitempty"`
	NewsDate   string `form:"news_date" binding:"omitempty"`
}

func NewNewsHandler(db *gorm.DB, log *logrus.Logger) *NewsHandler {
	return &NewsHandler{
		db:  db,
		log: log,
	}
}

// GetNews godoc
// @Summary      List news
// @Description  Returns a paginated list of news with filters and sorting.
// @Tags         News
// @Param        page       query int    false "Page" default(1)
// @Param        per_page   query int    false "Page size" default(20)
// @Param        sort       query string false "Sort field" Enums(id,title,news_date,category,startup_id,created_at,updated_at) default(news_date)
// @Param        order      query string false "Sort order" Enums(asc,desc) default(desc)
// @Param        category   query string false "Filter by category"
// @Param        startup_id query int    false "Filter by startup ID"
// @Param        news_date  query string false "Filter by news date (YYYY-MM-DD)"
// @Success      200 {object} response.NewsListResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /news [get]
func (h *NewsHandler) GetNews(c *gin.Context) {
	var params listNewsParams
	params.pagination = pagination.Parse(c)

	if err := c.ShouldBindQuery(&params); err != nil {
		response.JSON(c, http.StatusBadRequest,
			gin.H{"code": "invalid_params", "message": err.Error()})
		return
	}

	if !slices.Contains(validNewsSortFields, params.pagination.Sort) {
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2117,
			"message": fmt.Sprintf("invalid sort field '%s'. Allowed fields: %v", params.pagination.Sort, validNewsSortFields),
		})
		return
	}

	query := h.db.Model(&models.News{})
	if params.Category != "" {
		query = query.Where("category = ?", params.Category)
	}
	if params.StartupID != 0 {
		query = query.Where("startup_id = ?", params.StartupID)
	}
	if params.NewsDate != "" {
		query = query.Where("news_date = ?", params.NewsDate)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to count news"})
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.pagination.Sort, params.pagination.Order)
	var news []models.News
	if err := query.Order(orderBy).
		Offset((params.pagination.Page - 1) * params.pagination.PerPage).
		Limit(params.pagination.PerPage).
		Find(&news).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to retrieve news"})
		return
	}

	totalPages := (int(total) + params.pagination.PerPage - 1) / params.pagination.PerPage
	response.JSON(c, http.StatusOK, gin.H{
		"data": news,
		"pagination": gin.H{
			"page":     params.pagination.Page,
			"per_page": params.pagination.PerPage,
			"total":    total,
			"has_next": params.pagination.Page < totalPages,
			"has_prev": params.pagination.Page > 1,
		},
	})
}

// GetNewsItem godoc
// @Summary      Get news item
// @Description  Retrieves a news item by ID.
// @Tags         News
// @Param        id path int true "News ID"
// @Success      200 {object} response.NewsObjectResponse
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /news/{id} [get]
func (h *NewsHandler) GetNewsItem(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if err := h.db.Where("id = ?", id).First(&news).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound,
				"not_found", "news not found", nil)
			return
		}
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve news", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"data": news})
}

// GetNewsImage godoc
// @Summary      News image URL
// @Description  Returns the image URL of a news item.
// @Tags         News
// @Param        id path int true "News ID"
// @Success      200 {object} response.ImageURLResponse
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /news/{id}/image [get]
func (h *NewsHandler) GetNewsImage(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if err := h.db.Select("image_url").Where("id = ?", id).First(&news).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound,
				"not_found", "news not found", nil)
			return
		}
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve news", nil)
		return
	}

	if news.ImageURL == nil || *news.ImageURL == "" {
		response.JSONError(c, http.StatusNotFound,
			"not_found", "image not found", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"image_url": *news.ImageURL,
	})
}

// CreateNews godoc
// @Summary      Create news
// @Description  Creates a news item (admin required).
// @Tags         News
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        payload body requests.NewsCreateRequest true "News" Example({"title":"Funding round","category":"startup","description":"Series A raised","startup_id":1})
// @Success      201 {object} response.NewsObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/news [post]
func (h *NewsHandler) CreateNews(c *gin.Context) {
	var req struct {
		Title       string  `json:"title" binding:"required"`
		NewsDate    *string `json:"news_date,omitempty"`
		Location    *string `json:"location,omitempty"`
		Category    *string `json:"category,omitempty"`
		StartupID   *uint64 `json:"startup_id,omitempty"`
		Description string  `json:"description" binding:"required"`
		ImageURL    *string `json:"image_url,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, http.StatusBadRequest,
			"invalid_payload", "invalid request payload", err.Error())
		return
	}

	news := models.News{
		Title:       req.Title,
		Description: req.Description,
		Location:    req.Location,
		Category:    req.Category,
		StartupID:   req.StartupID,
		ImageURL:    req.ImageURL,
	}

	if err := h.db.Create(&news).Error; err != nil {
		h.log.WithError(err).Error("h.db.Create().Error")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to create news", nil)
		return
	}

	response.JSON(c, http.StatusCreated, gin.H{
		"message": "news created successfully",
		"data":    news,
	})
}

// UpdateNews godoc
// @Summary      Update news
// @Description  Updates a news item (admin required).
// @Tags         News
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path   int    true  "News ID"
// @Param        payload body   requests.NewsUpdateRequest true  "Fields to update" Example({"title":"Updated title","image_url":"https://..."})
// @Success      200 {object} response.NewsObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/news/{id} [patch]
func (h *NewsHandler) UpdateNews(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if err := h.db.Where("id = ?", id).First(&news).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound,
				"not_found", "news not found", nil)
			return
		}
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve news", nil)
		return
	}

	var req struct {
		Title       *string `json:"title,omitempty"`
		NewsDate    *string `json:"news_date,omitempty"`
		Location    *string `json:"location,omitempty"`
		Category    *string `json:"category,omitempty"`
		StartupID   *uint64 `json:"startup_id,omitempty"`
		Description *string `json:"description,omitempty"`
		ImageURL    *string `json:"image_url,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, http.StatusBadRequest,
			"invalid_payload", "invalid request payload", err.Error())
		return
	}

	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.NewsDate != nil {
		updates["news_date"] = *req.NewsDate
	}
	if req.Location != nil {
		updates["location"] = *req.Location
	}
	if req.Category != nil {
		updates["category"] = *req.Category
	}
	if req.StartupID != nil {
		updates["startup_id"] = *req.StartupID
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.ImageURL != nil {
		updates["image_url"] = *req.ImageURL
	}

	if len(updates) == 0 {
		response.JSONError(c, http.StatusBadRequest,
			"no_fields", "no fields provided for update", nil)
		return
	}

	if err := h.db.Model(&news).Updates(updates).Error; err != nil {
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to update news", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"message": "news updated successfully", "data": news})
}

// DeleteNews godoc
// @Summary      Delete news
// @Description  Deletes a news item (admin required).
// @Tags         News
// @Security     BearerAuth
// @Param        id path int true "News ID"
// @Success      200 {object} response.MessageResponse
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/news/{id} [delete]
func (h *NewsHandler) DeleteNews(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if err := h.db.Where("id = ?", id).First(&news).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound,
				"not_found", "news not found", nil)
			return
		}
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve news", nil)
		return
	}

	if err := h.db.Delete(&news).Error; err != nil {
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to delete news", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"message": "news deleted successfully",
	})
}
