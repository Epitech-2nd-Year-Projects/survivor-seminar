package v1

import (
	"net/http"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HealthHandler struct {
	cfg     *config.Config
	started time.Time
	db      *gorm.DB
}

func NewHealthHandler(cfg *config.Config, db *gorm.DB) *HealthHandler {
	return &HealthHandler{
		cfg:     cfg,
		started: time.Now(),
		db:      db,
	}
}

// Health godoc
// @Summary      API health status
// @Description  Returns dependencies state (DB, etc.), uptime, environment and version.
// @Tags         Health
// @Produce      json
// @Success      200 {object} map[string]interface{}
// @Router       /health [get]
func (h *HealthHandler) Health(c *gin.Context) {
	deps := gin.H{"queue": "ok", "storage": "ok"}
	if h.db != nil {
		sqlDB, err := h.db.DB()
		if err == nil && sqlDB.Ping() == nil {
			deps["db"] = "ok"
		} else {
			deps["db"] = "down"
		}
	} else {
		deps["db"] = "down"
	}

	response.JSON(c, http.StatusOK, gin.H{
		"status":  "ok",
		"uptime":  time.Since(h.started).String(),
		"deps":    deps,
		"env":     h.cfg.App.Env,
		"version": h.cfg.App.Version,
	})
}
