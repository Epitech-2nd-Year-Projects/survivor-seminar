package v1

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"slices"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/http/pagination"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/storage/s3"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UsersHandler struct {
	db       *gorm.DB
	log      *logrus.Logger
	uploader s3.Uploader
}

var validUserSortFields = []string{
	"id",
	"email",
	"name",
	"role",
	"created_at",
	"updated_at",
}

type listUsersParams struct {
	pagination pagination.Params
	Role       string `form:"role" binding:"omitempty,oneof=admin user investor founder"`
	Email      string `form:"email" binding:"omitempty,email"`
	Name       string `form:"name" binding:"omitempty"`
}

// NewUsersHandler returns a new UsersHandler
func NewUsersHandler(db *gorm.DB, log *logrus.Logger, uploader s3.Uploader) *UsersHandler {
	return &UsersHandler{
		db:       db,
		log:      log,
		uploader: uploader,
	}
}

// GetUsers godoc
// @Summary      List users
// @Description  Returns a paginated list of users with optional filters.
// @Tags         Users
// @Param        page      query int    false "Page" default(1)
// @Param        per_page  query int    false "Page size" default(20)
// @Param        sort      query string false "Sort field" Enums(id,email,name,role,created_at,updated_at) default(created_at)
// @Param        order     query string false "Sort order" Enums(asc,desc) default(desc)
// @Param        role      query string false "Filter by role" Enums(admin,user,investor,founder)
// @Param        email     query string false "Filter by email (contains)"
// @Param        name      query string false "Filter by name (contains)"
// @Success      200 {object} response.UserListResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /users [get]
func (h *UsersHandler) GetUsers(c *gin.Context) {
	var params listUsersParams
	params.pagination = pagination.Parse(c)

	if err := c.ShouldBindQuery(&params); err != nil {
		response.JSON(c, http.StatusBadRequest,
			gin.H{"code": "invalid_params", "message": err.Error()})
		return
	}

	if !slices.Contains(validUserSortFields, params.pagination.Sort) {
		response.JSON(c, http.StatusBadRequest, gin.H{
			"code":    2117,
			"message": fmt.Sprintf("invalid sort field '%s'. Allowed fields: %v", params.pagination.Sort, validUserSortFields),
		})
		return
	}

	query := h.db.Model(&models.User{})
	if params.Role != "" {
		query = query.Where("role = ?", params.Role)
	}
	if params.Email != "" {
		query = query.Where("email ILIKE ?", "%"+params.Email+"%")
	}
	if params.Name != "" {
		query = query.Where("name ILIKE ?", "%"+params.Name+"%")
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to count users"})
		return
	}

	orderBy := fmt.Sprintf("%s %s", params.pagination.Sort, params.pagination.Order)
	var users []models.User
	if err := query.Order(orderBy).
		Offset((params.pagination.Page - 1) * params.pagination.PerPage).
		Limit(params.pagination.PerPage).
		Find(&users).Error; err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to retrieve users"})
		return
	}

	totalPages := (int(total) + params.pagination.PerPage - 1) / params.pagination.PerPage
	response.JSON(c, http.StatusOK, gin.H{
		"data": users,
		"pagination": gin.H{
			"page":     params.pagination.Page,
			"per_page": params.pagination.PerPage,
			"total":    total,
			"has_next": params.pagination.Page < totalPages,
			"has_prev": params.pagination.Page > 1,
		},
	})
}

// GetUser godoc
// @Summary      Get user
// @Description  Retrieves a user by ID.
// @Tags         Users
// @Security     CookieAuth
// @Param        id   path int true "User ID"
// @Success      200 {object} response.UserObjectResponse
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /users/{id} [get]
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

// GetUserByEmail godoc
// @Summary      Get user by email
// @Description  Retrieves a user by email.
// @Tags         Users
// @Security     CookieAuth
// @Param        email   path string true "User email"
// @Success      200 {object} response.UserObjectResponse
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /users/email/{email} [get]
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

// GetMe godoc
// @Summary      My profile
// @Description  Returns the current authenticated user's profile.
// @Tags         Users
// @Security     CookieAuth
// @Success      200 {object} response.UserObjectResponse
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /users/me [get]
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

// CreateUser godoc
// @Summary      Create user
// @Description  Creates a user (admin required).
// @Tags         Users
// @Security     CookieAuth
// @Accept       json
// @Produce      json
// @Param        payload body requests.UserCreateRequest true "User" Example({"email":"jane@doe.tld","name":"Jane","role":"admin","password":"secret123"})
// @Success      201 {object} response.UserObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/users [post]
func (h *UsersHandler) CreateUser(c *gin.Context) {
	var req struct {
		Email    string `form:"email" binding:"required,email"`
		Name     string `form:"name" binding:"required"`
		Role     string `form:"role" binding:"required"`
		Password string `form:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBind(&req); err != nil {
		response.JSONError(c, http.StatusBadRequest, "invalid_payload", "invalid request payload", err.Error())
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		h.log.WithError(err).Error("failed to hash password")
		response.JSONError(c, http.StatusInternalServerError, "internal_error", "failed to process password", nil)
		return
	}

	user := models.User{
		Email:        req.Email,
		Name:         req.Name,
		Role:         req.Role,
		PasswordHash: string(hash),
	}

	file, err := c.FormFile("image")
	if err == nil {
		f, _ := file.Open()
		defer func(f multipart.File) {
			err := f.Close()
			if err != nil {
			}
		}(f)
		data, _ := io.ReadAll(f)
		contentType := file.Header.Get("Content-Type")
		if contentType == "" {
			contentType = http.DetectContentType(data)
		}
		key := fmt.Sprintf("user_image/%s%s", req.Email, extFromContentType(contentType))
		if url, upErr := h.uploader.Upload(c, key, contentType, data); upErr == nil {
			user.ImageURL = &url
		} else {
			h.log.WithError(upErr).Warn("upload user image failed")
		}
	}

	if err := h.db.Create(&user).Error; err != nil {
		response.JSONError(c, http.StatusInternalServerError, "internal_error", "failed to create user", nil)
		return
	}

	response.JSON(c, http.StatusCreated, gin.H{"message": "user created successfully", "data": user})
}

// UpdateUser godoc
// @Summary      Update user
// @Description  Updates a user (admin required).
// @Tags         Users
// @Security     CookieAuth
// @Accept       json
// @Produce      json
// @Param        id      path   int    true  "User ID"
// @Param        payload body   requests.UserUpdateRequest true  "Fields to update" Example({"name":"Jane Doe","role":"user"})
// @Success      200 {object} response.UserObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/users/{id} [patch]
func (h *UsersHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := h.db.Where("id = ?", id).First(&user).Error; err != nil {
		response.JSONError(c, http.StatusNotFound, "not_found", "user not found", nil)
		return
	}

	var req struct {
		Email    *string `form:"email,omitempty"`
		Name     *string `form:"name,omitempty"`
		Role     *string `form:"role,omitempty"`
		Password *string `form:"password,omitempty"`
	}

	if err := c.ShouldBind(&req); err != nil {
		response.JSONError(c, http.StatusBadRequest, "invalid_payload", "invalid request payload", err.Error())
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

	file, err := c.FormFile("image")
	if err == nil {
		f, _ := file.Open()
		defer func(f multipart.File) {
			err := f.Close()
			if err != nil {
			}
		}(f)
		data, _ := io.ReadAll(f)
		contentType := file.Header.Get("Content-Type")
		if contentType == "" {
			contentType = http.DetectContentType(data)
		}
		key := fmt.Sprintf("user_image/%s%s", user.Email, extFromContentType(contentType))
		if url, upErr := h.uploader.Upload(c, key, contentType, data); upErr == nil {
			updates["image_url"] = url
		} else {
			h.log.WithError(upErr).Warn("upload user image failed")
		}
	}

	if len(updates) == 0 && err != nil {
		response.JSONError(c, http.StatusBadRequest, "no_fields", "no fields provided for update", nil)
		return
	}

	if err := h.db.Model(&user).Updates(updates).Error; err != nil {
		response.JSONError(c, http.StatusInternalServerError, "internal_error", "failed to update user", nil)
		return
	}
	response.JSON(c, http.StatusOK, gin.H{"message": "user updated successfully", "data": user})
}

// DeleteUser godoc
// @Summary      Delete user
// @Description  Deletes a user by ID (admin required).
// @Tags         Users
// @Security     CookieAuth
// @Param        id   path int true "User ID"
// @Success      200 {object} response.MessageResponse
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/users/{id} [delete]
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
