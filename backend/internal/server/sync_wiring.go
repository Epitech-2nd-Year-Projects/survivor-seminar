package server

import (
	"context"

	jeb "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/client/jeb"
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	syc "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/sync"
)

// initSync wires the sync service, scheduler, admin endpoints, and cron scheduling.
func (h *HTTPServer) initSync() {
	if h.db == nil {
		h.log.Warn("sync disabled: database not connected")
		return
	}

	jebClient := jeb.NewClient(h.cfg)
	api := syc.NewJEBStartupsAPI(jebClient)
	repo := syc.NewGormStartupsRepo(h.db, h.log)
	svc := syc.NewService(api, repo, h.log, h.cfg.Sync.SoftDelete)
	sched := syc.NewScheduler(svc, h.log)
	h.sched = sched

	g := h.Engine
	apiRoot := g.Group("/api")
	v1 := apiRoot.Group("/" + h.cfg.App.Version)
	admin := v1.Group("/admin")
	syncHandler := v1handlers.NewSyncHandler(h.log, h.sched)
	adminSync := admin.Group("/sync")
	{
		adminSync.GET("/status", syncHandler.Status)
		adminSync.POST("/full", syncHandler.TriggerFull)
		adminSync.POST("/incremental", syncHandler.TriggerIncremental)
	}

	if h.cfg.Sync.IncrementalCron != "" {
		if _, err := sched.Schedule(h.cfg.Sync.IncrementalCron, func(ctx context.Context) {
			if n, err := svc.IncrementalSync(ctx); err != nil {
				h.log.WithError(err).Error("scheduled incremental sync failed")
			} else {
				h.log.WithField("count", n).Info("scheduled incremental sync completed")
			}
		}, "incremental"); err != nil {
			h.log.WithError(err).Warn("failed to schedule incremental sync")
		} else {
			h.log.WithField("spec", h.cfg.Sync.IncrementalCron).Info("scheduled incremental sync")
		}
	}
}
