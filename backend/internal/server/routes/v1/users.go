package v1

import (
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterUsers(r *gin.RouterGroup, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewUsersHandler(db, logger)

	users := r.Group("/users")
	users.GET("", h.GetUsers)
	users.GET("/:id", h.GetUser)
	users.GET("/email/:email", h.GetUserByEmail)
	users.GET("/:id/image", h.GetUserImage)

	admin := r.Group("/admin/users")
	admin.POST("", h.CreateUser)
	admin.PATCH("/:id", h.UpdateUser)
	admin.DELETE("/:id", h.DeleteUser)
}
