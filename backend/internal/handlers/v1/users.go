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

type UsersHandler struct {
	db  *gorm.DB
	log *logrus.Logger
}

var validUserSortFields = []string{
	"id",
	"email",
	"name",
	"role",
	"created_at",
	"updated_at",
}

// NewUsersHandler returns a new UsersHandler
func NewUsersHandler(db *gorm.DB, log *logrus.Logger) *UsersHandler {
	return &UsersHandler{
		db:  db,
		log: log,
	}
}

// GetUsers returns a list of users
func (h *UsersHandler) GetUsers(c *gin.Context) {
	params := pagination.Parse(c)
	offset := (params.Page - 1) * params.PerPage

	if !slices.Contains(validUserSortFields, params.Sort) {
		h.log.WithField("sort", params.Sort).Warn("!slices.Contains(validUserSortFields, params.Sort)")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2117,
			"message": fmt.Sprintf("invalid sort field '%s'. Allowed fields: %v", params.Sort, validUserSortFields),
		})
		return
	}

	var total int64
	if err := h.db.Model(&models.User{}).Count(&total).Error; err != nil {
		h.log.WithError(err).Error("failed to count users")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve users count",
		})
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.Sort, params.Order)
	var users []models.User
	if err := h.db.Order(orderBy).Offset(offset).Limit(params.PerPage).Find(&users).Error; err != nil {
		h.log.WithError(err).Error("failed to fetch users")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve users",
		})
		return
	}
	totalPages := (int(total) + params.PerPage - 1) / params.PerPage
	hasNext := params.Page < totalPages
	hasPrev := params.Page > 1

	response.JSON(c, http.StatusOK, gin.H{
		"data": users,
		"pagination": gin.H{
			"page":     params.Page,
			"per_page": params.PerPage,
			"total":    total,
			"has_next": hasNext,
			"has_prev": hasPrev,
		},
	})
}

// GetUser returns a specific user by ID
func (h *UsersHandler) GetUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := h.db.Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("id", id).Warn("user not found")
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "user not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch user")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve user",
		})
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"data": user,
	})
}

// GetUserByEmail returns a specific user by email
func (h *UsersHandler) GetUserByEmail(c *gin.Context) {
	email := c.Param("email")

	var user models.User
	if err := h.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.WithField("email", email).Warn("user not found by email")
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "user not found",
			})
			return
		}
		h.log.WithError(err).WithField("email", email).Error("failed to fetch user by email")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve user",
		})
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"data": user,
	})
}

// GetUserImage returns a specific user's image by ID'
func (h *UsersHandler) GetUserImage(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := h.db.Select("image_url").Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "user not found",
			})
			return
		}
		h.log.WithError(err).WithField("id", id).Error("failed to fetch user for image")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve user",
		})
		return
	}

	if user.ImageURL == nil || *user.ImageURL == "" {
		response.JSON(c, http.StatusNotFound, gin.H{
			"code":    "not_found",
			"message": "image not found",
		})
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"image_url": *user.ImageURL,
	})
}
