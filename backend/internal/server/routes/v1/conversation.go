package v1

import (
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterConversations(r *gin.RouterGroup, cfg *config.Config, db *gorm.DB, logger *logrus.Logger) {
	h := v1handlers.NewConversationsHandler(db, logger)

	conversations := r.Group("/conversations")
	conversations.Use(middleware.AuthRequired(cfg))
	{
		conversations.GET("", h.GetConversations)
		conversations.POST("", h.CreateConversation)
		conversations.GET("/:id", h.GetConversation)
		conversations.GET("/:id/messages", h.GetMessages)
		conversations.POST("/:id/messages", h.SendMessage)
		conversations.POST("/:id/mark-read", h.MarkMessageRead)
	}
}
