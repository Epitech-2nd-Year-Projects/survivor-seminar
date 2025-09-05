package v1

import (
	"errors"
	"fmt"
	"net/http"
	"slices"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/http/pagination"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
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

// GetMe returns the current authenticated user's profile
func (h *UsersHandler) GetMe(c *gin.Context) {
	claims := middleware.GetClaims(c)
	if claims == nil {
		response.JSON(c, http.StatusUnauthorized, gin.H{"code": "unauthorized", "message": "missing or invalid token"})
		return
	}
	var user models.User
	if err := h.db.Where("id = ?", claims.UserID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSON(c, http.StatusNotFound, gin.H{"code": "not_found", "message": "user not found"})
			return
		}
		h.log.WithError(err).Error("failed to fetch current user")
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to retrieve profile"})
		return
	}
	response.JSON(c, http.StatusOK, gin.H{"data": user})
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

// CreateUser creates a new user (Admin only)
func (h *UsersHandler) CreateUser(c *gin.Context) {
	var req struct {
		Email    string  `json:"email" binding:"required,email"`
		Name     string  `json:"name" binding:"required"`
		Role     string  `json:"role" binding:"required"`
		Password string  `json:"password" binding:"required,min=6"`
		ImageURL *string `json:"image_url,omitempty"`
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

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		h.log.WithError(err).Error("failed to hash password")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to process password",
		})
		return
	}

	user := models.User{
		Email:        req.Email,
		Name:         req.Name,
		Role:         req.Role,
		PasswordHash: string(hash),
		ImageURL:     req.ImageURL,
	}

	if err := h.db.Create(&user).Error; err != nil {
		h.log.WithError(err).Error("h.db.Create().Error")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to create user",
		})
		return
	}

	h.log.WithField("id", user.ID).Info("user created successfully")
	response.JSON(c, http.StatusCreated, gin.H{
		"message": "user created successfully",
		"data":    user,
	})
}

// UpdateUser updates an existing user (Admin only)
func (h *UsersHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := h.db.Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "user not found",
			})
			return
		}
		h.log.WithError(err).Error("failed to fetch user for update")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve user",
		})
		return
	}

	var req struct {
		Email    *string `json:"email,omitempty" binding:"omitempty,email"`
		Name     *string `json:"name,omitempty"`
		Role     *string `json:"role,omitempty"`
		Password *string `json:"password,omitempty" binding:"omitempty,min=6"`
		ImageURL *string `json:"image_url,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.WithError(err).Warn("invalid request payload for user update")
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2100,
			"message": "invalid request payload",
			"errors":  err.Error(),
		})
		return
	}

	updates := make(map[string]interface{})
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Role != nil {
		updates["role"] = *req.Role
	}
	if req.Password != nil {
		hash, _ := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		updates["password_hash"] = string(hash)
	}
	if req.ImageURL != nil {
		updates["image_url"] = *req.ImageURL
	}

	if len(updates) == 0 {
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2101,
			"message": "no fields provided for update",
		})
		return
	}

	if err := h.db.Model(&user).Updates(updates).Error; err != nil {
		h.log.WithError(err).Error("failed to update user")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to update user",
		})
		return
	}

	h.log.WithField("id", id).Info("user updated successfully")
	response.JSON(c, http.StatusOK, gin.H{
		"message": "user updated successfully",
		"data":    user,
	})
}

// DeleteUser removes a user by ID (Admin only)
func (h *UsersHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := h.db.Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSON(c, http.StatusNotFound, gin.H{
				"code":    "not_found",
				"message": "user not found",
			})
			return
		}
		h.log.WithError(err).Error("failed to fetch user for deletion")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to retrieve user",
		})
		return
	}

	if err := h.db.Delete(&user).Error; err != nil {
		h.log.WithError(err).Error("failed to delete user")
		response.JSON(c, http.StatusInternalServerError, gin.H{
			"code":    "internal_error",
			"message": "failed to delete user",
		})
		return
	}

	h.log.WithField("id", id).Info("user deleted successfully")
	response.JSON(c, http.StatusOK, gin.H{
		"message": "user deleted successfully",
	})
}
