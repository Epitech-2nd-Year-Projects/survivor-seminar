package v1

import (
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterNews(r *gin.RouterGroup, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewNewsHandler(db, logger)

	news := r.Group("/news")
	news.GET("", h.GetNews)
	news.GET("/:id", h.GetNewsItem)
	news.GET("/:id/image", h.GetNewsImage)

	// Admin
	admin := r.Group("/admin/news")
	admin.POST("", h.CreateNews)
	admin.PATCH("/:id", h.UpdateNews)
	admin.DELETE("/:id", h.DeleteNews)
}
