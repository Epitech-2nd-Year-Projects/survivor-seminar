package v1

import (
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterUsers(r *gin.RouterGroup, cfg *config.Config, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewUsersHandler(db, logger)

	users := r.Group("/users")
	users.GET("", h.GetUsers)
	users.GET("/:id", middleware.AuthRequired(cfg), middleware.RequireSelfOrAdminByParam("id"), h.GetUser)
	users.GET("/email/:email", middleware.AuthRequired(cfg), middleware.RequireSelfOrAdminByEmailParam("email"), h.GetUserByEmail)
	users.GET("/:id/image", middleware.AuthRequired(cfg), middleware.RequireSelfOrAdminByParam("id"), h.GetUserImage)

	me := r.Group("")
	me.Use(middleware.AuthRequired(cfg))
	me.GET("/me", h.GetMe)

	admin := r.Group("/admin/users")
	admin.Use(middleware.AuthRequired(cfg), middleware.RequireAdmin())
	admin.POST("", h.CreateUser)
	admin.PATCH("/:id", h.UpdateUser)
	admin.DELETE("/:id", h.DeleteUser)
}
