package v1

import (
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterPartners(r *gin.RouterGroup, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewPartnersHandler(logger, db)

	partners := r.Group("/partners")
	partners.GET("", h.GetPartners)
	partners.GET("/:id", h.GetPartner)

	admin := r.Group("/admin/partners")
	admin.POST("", h.CreatePartner)
	admin.PATCH("/:id", h.UpdatePartner)
	admin.DELETE("/:id", h.DeletePartner)
}
