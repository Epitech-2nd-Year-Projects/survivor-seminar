package v1

import (
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterInvestors(r *gin.RouterGroup, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewInvestorsHandler(db, logger)

	investors := r.Group("/investors")
	investors.GET("", h.GetInvestors)
	investors.GET("/:id", h.GetInvestor)

	admin := r.Group("/admin/investors")
	admin.POST("", h.CreateInvestor)
	admin.PATCH("/:id", h.UpdateInvestor)
	admin.DELETE("/:id", h.DeleteInvestor)
}
