package v1

import (
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterOpportunities(r *gin.RouterGroup, db *gorm.DB, logger *logrus.Logger) {
	opportunityHandler := v1handlers.NewOpportunityHandler(logger, db)

	opportunities := r.Group("/opportunities")
	opportunities.GET("", opportunityHandler.GetOpportunities)
	opportunities.GET("/:id", opportunityHandler.GetOpportunity)

	admin := r.Group("/admin")
	{
		adminOpportunities := admin.Group("/opportunities")
		adminOpportunities.POST("", opportunityHandler.CreateOpportunity)
		adminOpportunities.PATCH("/:id", opportunityHandler.UpdateOpportunity)
		adminOpportunities.GET("", opportunityHandler.GetOpportunities)
		adminOpportunities.GET("/:id", opportunityHandler.GetOpportunity)
		adminOpportunities.DELETE("/:id", opportunityHandler.DeleteOpportunity)
	}
}
