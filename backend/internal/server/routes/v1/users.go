package v1

import (
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterUsers(r *gin.RouterGroup, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewUsersHandler(db, logger)

	g := r.Group("/users")
	g.GET("", h.GetUsers)
	g.GET("/:id", h.GetUser)
	g.GET("/email/:email", h.GetUserByEmail)
	g.GET("/:id/image", h.GetUserImage)
}
