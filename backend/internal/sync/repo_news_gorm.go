package sync

import (
	"context"
	"fmt"
	"strconv"
	"time"

	jebc "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/client/jeb"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	storeS3 "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/storage/s3"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// GormNewsRepo persists news into DB and tracks watermark
type GormNewsRepo struct {
	db    *gorm.DB
	log   *logrus.Logger
	scope string
	media storeS3.Uploader
	jeb   *jebc.Client
}

// NewGormNewsRepo initializes and returns a new instance of GormNewsRepo with the given database and logger
func NewGormNewsRepo(db *gorm.DB, log *logrus.Logger, media storeS3.Uploader, jeb *jebc.Client) *GormNewsRepo {
	return &GormNewsRepo{db: db, log: log, scope: "news", media: media, jeb: jeb}
}

// UpsertBatch inserts or updates a batch of upstream items in the database using their primary keys
func (r *GormNewsRepo) UpsertBatch(ctx context.Context, items []UpstreamItem) error {
	if len(items) == 0 {
		return nil
	}
	for _, it := range items {
		id64, err := strconv.ParseUint(it.ExternalID, 10, 64)
		if err != nil {
			return fmt.Errorf("strconv.ParseUint(it.ExternalID, 10, 64): %w", err)
		}

		m := models.News{
			Title:       getString(it.Payload, "title"),
			Location:    getStringPtr(it.Payload, "location"),
			Category:    getStringPtr(it.Payload, "category"),
			Description: getString(it.Payload, "description"),
		}

		if s := getString(it.Payload, "news_date"); s != "" {
			if t, perr := time.Parse("2006-01-02", s); perr == nil {
				m.NewsDate = &t
			}
		}

		if v, ok := it.Payload["startup_id"].(int64); ok {
			u := uint64(v)
			m.StartupID = &u
		} else if v, ok := it.Payload["startup_id"].(*int64); ok && v != nil {
			u := uint64(*v)
			m.StartupID = &u
		}

		if r.media != nil && r.jeb != nil {
			if m.ImageURL == nil || *m.ImageURL == "" {
				if data, ct, err := r.jeb.GetNewsImage(ctx, int64(id64)); err == nil && len(data) > 0 {
					key := fmt.Sprintf("news_image/%d%s", id64, extFromContentType(ct))
					if url, uerr := r.media.Upload(ctx, key, ct, data); uerr == nil {
						m.ImageURL = &url
					} else {
						r.log.WithError(uerr).WithField("id", id64).Warn("upload news image failed")
					}
				}
			}
		}

		if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{
			DoNothing: true,
		}).Create(&m).Error; err != nil {
			return fmt.Errorf("r.db.WithContext(ctx).Clauses().Create(): %w", err)
		}
		if m.ImageURL != nil && *m.ImageURL != "" {
			_ = r.db.WithContext(ctx).Model(&models.News{}).
				Where("id = ? AND (image_url IS NULL OR image_url = '')", id64).
				Update("image_url", *m.ImageURL).Error
		}
	}
	return nil
}

func (r *GormNewsRepo) LastIncrementalWatermark(ctx context.Context) (time.Time, error) {
	var st syncState
	if err := r.db.WithContext(ctx).First(&st, "name = ?", r.scope).Error; err != nil {
		return time.Time{}, err
	}
	return st.Watermark, nil
}

func (r *GormNewsRepo) UpdateIncrementalWatermark(ctx context.Context, ts time.Time) error {
	st := syncState{Name: r.scope, Watermark: ts}
	if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{UpdateAll: true}).Create(&st).Error; err != nil {
		return fmt.Errorf("r.db.WithContext(ctx).Clauses(clause.OnConflict{}).Create(&st): %w", err)
	}
	return nil
}
