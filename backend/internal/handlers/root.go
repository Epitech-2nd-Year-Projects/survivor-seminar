package handlers

import (
	"net/http"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/gin-gonic/gin"
)

type RootHandler struct {
	cfg  *config.Config
	boot time.Time
}

func NewRootHandler(cfg *config.Config) *RootHandler {
	return &RootHandler{
		cfg:  cfg,
		boot: time.Now(),
	}
}

func (h *RootHandler) Info(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"name":    h.cfg.App.Name,
		"env":     h.cfg.App.Env,
		"version": h.cfg.App.Version,
		"base":    "/api/" + h.cfg.App.Version,
		"time":    time.Now().UTC(),
	})
}
