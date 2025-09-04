package server

import (
	"context"

	jeb "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/client/jeb"
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	storageS3 "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/storage/s3"
	syc "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/sync"
)

// initSync wires the sync service, scheduler, admin endpoints, and cron scheduling.
func (h *HTTPServer) initSync() {
	if h.db == nil {
		h.log.Warn("sync disabled: database not connected")
		return
	}

	jebClient := jeb.NewClient(h.cfg)

	var uploader storageS3.Uploader
	if h.cfg.Storage.Media.Provider == "s3" && h.cfg.Storage.Media.S3 != nil {
		if up, err := storageS3.NewUploader(context.Background(), h.cfg.Storage.Media); err != nil {
			h.log.WithError(err).Warn("failed to initialize S3 uploader; image sync disabled")
		} else {
			uploader = up
		}
	}

	svcStartups := syc.NewService(syc.NewJEBStartupsAPI(jebClient), syc.NewGormStartupsRepo(h.db, h.log), h.log, h.cfg.Sync.SoftDelete)
	svcNews := syc.NewService(syc.NewJEBNewsAPI(jebClient), syc.NewGormNewsRepo(h.db, h.log, uploader, jebClient), h.log, h.cfg.Sync.SoftDelete)
	svcEvents := syc.NewService(syc.NewJEBEventsAPI(jebClient), syc.NewGormEventsRepo(h.db, h.log, uploader, jebClient), h.log, h.cfg.Sync.SoftDelete)
	svcUsers := syc.NewService(syc.NewJEBUsersAPI(jebClient), syc.NewGormUsersRepo(h.db, h.log, uploader, jebClient), h.log, h.cfg.Sync.SoftDelete)
	multi := syc.NewMultiService([]syc.Syncer{svcStartups, svcNews, svcEvents, svcUsers}, h.log)
	sched := syc.NewScheduler(multi, h.log)
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
			if n, err := multi.IncrementalSync(ctx); err != nil {
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
