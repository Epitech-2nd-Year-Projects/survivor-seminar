package v1

import (
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterInvestors(r *gin.RouterGroup, cfg *config.Config, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewInvestorsHandler(db, logger)

	investors := r.Group("/investors")
	investors.GET("", h.GetInvestors)
	investors.GET("/:id", h.GetInvestor)

	admin := r.Group("/admin/investors")
	admin.Use(middleware.AuthRequired(cfg), middleware.RequireAdmin())
	admin.POST("", h.CreateInvestor)
	admin.PATCH("/:id", h.UpdateInvestor)
	admin.DELETE("/:id", h.DeleteInvestor)
}
