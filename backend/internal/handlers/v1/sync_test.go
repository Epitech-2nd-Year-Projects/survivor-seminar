package v1_test

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	v1 "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/sync" // pour StatusSnapshot
	"github.com/gin-gonic/gin"
	"github.com/robfig/cron/v3"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

type fakeScheduler struct{}

func (f *fakeScheduler) Start(context.Context) error { return nil }
func (f *fakeScheduler) Stop(context.Context) error  { return nil }
func (f *fakeScheduler) TriggerFullSync(context.Context) error {
	return nil
}
func (f *fakeScheduler) TriggerIncrementalSync(context.Context) error {
	return errors.New("fail")
}
func (f *fakeScheduler) Status() sync.StatusSnapshot {
	return sync.StatusSnapshot{
		Running:         true,
		QueueLen:        0,
		LastFull:        &sync.RunInfo{},
		LastIncremental: &sync.RunInfo{},
	}
}
func (f *fakeScheduler) Schedule(string, func(context.Context), string) (cron.EntryID, error) {
	return 1, nil
}

func setupSyncRouter(h *v1.SyncHandler) *gin.Engine {
	r := gin.Default()
	r.GET("/admin/sync/status", h.Status)
	r.POST("/admin/sync/full", h.TriggerFull)
	r.POST("/admin/sync/incremental", h.TriggerIncremental)
	return r
}

func TestSyncHandler_FullCoverage(t *testing.T) {
	h := v1.NewSyncHandler(logrus.New(), &fakeScheduler{})
	r := setupSyncRouter(h)

	req := httptest.NewRequest(http.MethodGet, "/admin/sync/status", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	req = httptest.NewRequest(http.MethodPost, "/admin/sync/full", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusAccepted, w.Code)

	req = httptest.NewRequest(http.MethodPost, "/admin/sync/incremental", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}
