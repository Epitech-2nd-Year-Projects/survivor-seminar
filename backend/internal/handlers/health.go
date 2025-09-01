package handlers

import (
	"net/http"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	cfg     *config.Config
	started time.Time
}

func NewHealthHandler(cfg *config.Config) *HealthHandler {
	return &HealthHandler{
		cfg:     cfg,
		started: time.Now(),
	}
}

func (h *HealthHandler) Health(c *gin.Context) {
	deps := gin.H{
		"db":      "ok",
		"queue":   "ok",
		"storage": "ok",
	}

	response.JSON(c, http.StatusOK, gin.H{
		"status":  "ok",
		"uptime":  time.Since(h.started).String(),
		"deps":    deps,
		"env":     h.cfg.App.Env,
		"version": h.cfg.App.Version,
	})
}
