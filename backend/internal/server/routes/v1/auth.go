package v1

import (
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/notifications/email"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func RegisterAuth(r *gin.RouterGroup, cfg *config.Config, db *gorm.DB, logger *logrus.Logger, mailer email.Mailer) {
	h := v1handlers.NewAuthHandler(cfg, db, logger, mailer)
	auth := r.Group("/auth")
	auth.POST("/register", h.Register)
	auth.POST("/login", h.Login)
	auth.POST("/refresh", h.Refresh)

	auth.POST("/verify", h.VerifyEmail)
	auth.GET("/verify", h.VerifyEmail)
	auth.POST("/forgot-password", h.ForgotPassword)
	auth.POST("/reset-password", h.ResetPassword)
}
