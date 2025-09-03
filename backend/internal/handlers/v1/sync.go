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

// Status provides the current state of the scheduler, including running state, queue length, and sync timestamps.
func (h *SyncHandler) Status(c *gin.Context) {
	st := h.sched.Status()
	response.JSON(c, http.StatusOK, gin.H{
		"running":  st.Running,
		"queue":    st.QueueLen,
		"lastFull": st.LastFull,
		"lastInc":  st.LastIncremental,
	})
}

// TriggerFull handles the initiation of a full synchronization process and returns the queued status upon success or an error.
func (h *SyncHandler) TriggerFull(c *gin.Context) {
	if err := h.sched.TriggerFullSync(c.Request.Context()); err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response.JSON(c, http.StatusAccepted, gin.H{"status": "queued", "type": "full"})
}

// TriggerIncremental handles the initiation of an incremental synchronization process and returns the queued status or an error.
func (h *SyncHandler) TriggerIncremental(c *gin.Context) {
	if err := h.sched.TriggerIncrementalSync(c.Request.Context()); err != nil {
		response.JSON(c, http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response.JSON(c, http.StatusAccepted, gin.H{"status": "queued", "type": "incremental"})
}
