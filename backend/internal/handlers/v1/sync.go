package v1

import (
	"net/http"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/sync"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type SyncHandler struct {
	log   *logrus.Logger
	sched sync.Scheduler
}

// NewSyncHandler initializes and returns a new SyncHandler with the provided logger and scheduler.
func NewSyncHandler(log *logrus.Logger, sched sync.Scheduler) *SyncHandler {
	return &SyncHandler{log: log, sched: sched}
}

// Status godoc
// @Summary      Sync status
// @Description  Returns the scheduler state (running flag, queue length, last runs).
// @Tags         Admin/Sync
// @Security     BearerAuth
// @Produce      json
// @Success      200 {object} response.SyncStatusResponse
// @Router       /admin/sync/status [get]
func (h *SyncHandler) Status(c *gin.Context) {
	st := h.sched.Status()
	response.JSON(c, http.StatusOK, gin.H{
		"running":  st.Running,
		"queue":    st.QueueLen,
		"lastFull": st.LastFull,
		"lastInc":  st.LastIncremental,
	})
}

// TriggerFull godoc
// @Summary      Trigger full sync
// @Description  Queues a full synchronization.
// @Tags         Admin/Sync
// @Security     BearerAuth
// @Produce      json
// @Success      202 {object} map[string]string
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/sync/full [post]
func (h *SyncHandler) TriggerFull(c *gin.Context) {
	if err := h.sched.TriggerFullSync(c.Request.Context()); err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response.JSON(c, http.StatusAccepted, gin.H{"status": "queued", "type": "full"})
}

// TriggerIncremental godoc
// @Summary      Trigger incremental sync
// @Description  Queues an incremental synchronization.
// @Tags         Admin/Sync
// @Security     BearerAuth
// @Produce      json
// @Success      202 {object} map[string]string
// @Failure      500 {object} response.ErrorBody
// @Router       /admin/sync/incremental [post]
func (h *SyncHandler) TriggerIncremental(c *gin.Context) {
	if err := h.sched.TriggerIncrementalSync(c.Request.Context()); err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response.JSON(c, http.StatusAccepted, gin.H{"status": "queued", "type": "incremental"})
}
