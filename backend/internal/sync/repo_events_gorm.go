package sync

import (
	"context"
	"fmt"
	"regexp"
	"strconv"
	"time"

	jebc "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/client/jeb"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	storeS3 "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/storage/s3"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// GormEventsRepo persists events into DB and tracks watermark.
type GormEventsRepo struct {
	db    *gorm.DB
	log   *logrus.Logger
	scope string
	media storeS3.Uploader
	jeb   *jebc.Client
}

// NewGormEventsRepo initializes and returns a new instance of GormEventsRepo with the given database and logger.
func NewGormEventsRepo(db *gorm.DB, log *logrus.Logger, media storeS3.Uploader, jeb *jebc.Client) *GormEventsRepo {
	return &GormEventsRepo{db: db, log: log, scope: "events", media: media, jeb: jeb}
}

var isoDateRe = regexp.MustCompile(`\d{4}-\d{2}-\d{2}`)

// UpsertBatch inserts or updates a batch of upstream items in the database using their primary keys.
func (r *GormEventsRepo) UpsertBatch(ctx context.Context, items []UpstreamItem) error {
	if len(items) == 0 {
		return nil
	}
	for _, it := range items {
		id64, err := strconv.ParseUint(it.ExternalID, 10, 64)
		if err != nil {
			return fmt.Errorf("strconv.ParseUint(it.ExternalID, 10, 64): %w", err)
		}

		m := models.Event{
			ID:             id64,
			Name:           getString(it.Payload, "name"),
			Description:    getStringPtr(it.Payload, "description"),
			EventType:      getStringPtr(it.Payload, "event_type"),
			Location:       getStringPtr(it.Payload, "location"),
			TargetAudience: getStringPtr(it.Payload, "target_audience"),
		}

		if s := getString(it.Payload, "dates"); s != "" {
			dates := isoDateRe.FindAllString(s, -1)
			if len(dates) >= 1 {
				if t, perr := time.Parse("2006-01-02", dates[0]); perr == nil {
					m.StartDate = &t
				}
			}
			if len(dates) >= 2 {
				if t, perr := time.Parse("2006-01-02", dates[1]); perr == nil {
					m.EndDate = &t
				}
			}
		}

		if r.media != nil && r.jeb != nil {
			if m.ImageURL == nil || *m.ImageURL == "" {
				if data, ct, err := r.jeb.GetEventImage(ctx, int64(id64)); err == nil && len(data) > 0 {
					key := fmt.Sprintf("events_image/%d%s", id64, extFromContentType(ct))
					if url, uerr := r.media.Upload(ctx, key, ct, data); uerr == nil {
						m.ImageURL = &url
					} else {
						r.log.WithError(uerr).WithField("id", id64).Warn("upload event image failed")
					}
				}
			}
		}

		if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{DoNothing: true}).Create(&m).Error; err != nil {
			return fmt.Errorf("r.db.WithContext(ctx).Clauses().Create(): %w", err)
		}
		if m.ImageURL != nil && *m.ImageURL != "" {
			_ = r.db.WithContext(ctx).Model(&models.Event{}).
				Where("id = ? AND (image_url IS NULL OR image_url = '')", id64).
				Update("image_url", *m.ImageURL).Error
		}
	}
	return nil
}

// LastIncrementalWatermark retrieves the last incremental watermark timestamp for the current scope from the database.
func (r *GormEventsRepo) LastIncrementalWatermark(ctx context.Context) (time.Time, error) {
	var st syncState
	if err := r.db.WithContext(ctx).First(&st, "name = ?", r.scope).Error; err != nil {
		return time.Time{}, err
	}
	return st.Watermark, nil
}

// UpdateIncrementalWatermark updates the syncState table with the provided timestamp for the current scope using upsert logic.
func (r *GormEventsRepo) UpdateIncrementalWatermark(ctx context.Context, ts time.Time) error {
	st := syncState{Name: r.scope, Watermark: ts}
	if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{UpdateAll: true}).Create(&st).Error; err != nil {
		return fmt.Errorf("r.db.WithContext(ctx).Clauses(clause.OnConflict{}).Create(&st): %w", err)
	}
	return nil
}
