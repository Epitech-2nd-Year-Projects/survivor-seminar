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
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// GormUsersRepo persists users into DB and tracks watermark.
type GormUsersRepo struct {
	db    *gorm.DB
	log   *logrus.Logger
	scope string
	media storeS3.Uploader
	jeb   *jebc.Client
}

// NewGormUsersRepo creates and returns a new instance of GormUsersRepo with the provided database, logger, media uploader, and JEB client.
func NewGormUsersRepo(db *gorm.DB, log *logrus.Logger, media storeS3.Uploader, jeb *jebc.Client) *GormUsersRepo {
	return &GormUsersRepo{db: db, log: log, scope: "users", media: media, jeb: jeb}
}

// UpsertBatch upserts a batch of users into the database by email, creating or updating non-sensitive fields as needed.
func (r *GormUsersRepo) UpsertBatch(ctx context.Context, items []UpstreamItem) error {
	if len(items) == 0 {
		return nil
	}
	for _, it := range items {
		email := getString(it.Payload, "email")
		hash, _ := bcrypt.GenerateFromPassword([]byte("jeb-sync-disabled-"+email), bcrypt.DefaultCost)

		var id64 uint64
		if idv, ok := it.Payload["id"].(int64); ok {
			id64 = uint64(idv)
		} else if s, ok := it.Payload["id"].(string); ok {
			if p, perr := strconv.ParseUint(s, 10, 64); perr == nil {
				id64 = p
			}
		}

		m := models.User{
			ID:           id64,
			Email:        email,
			Name:         getString(it.Payload, "name"),
			Role:         getString(it.Payload, "role"),
			PasswordHash: string(hash),
		}

		if v, ok := it.Payload["founder_id"].(int64); ok {
			u := uint64(v)
			m.FounderID = &u
		} else if v, ok := it.Payload["founder_id"].(*int64); ok && v != nil {
			u := uint64(*v)
			m.FounderID = &u
		}
		if v, ok := it.Payload["investor_id"].(int64); ok {
			u := uint64(v)
			m.InvestorID = &u
		} else if v, ok := it.Payload["investor_id"].(*int64); ok && v != nil {
			u := uint64(*v)
			m.InvestorID = &u
		}

		if r.media != nil && r.jeb != nil && id64 != 0 {
			if m.ImageURL == nil || *m.ImageURL == "" {
				if data, ct, err := r.jeb.GetUserImage(ctx, int64(id64)); err == nil && len(data) > 0 {
					key := fmt.Sprintf("user_image/%d%s", id64, extFromContentType(ct))
					if url, uerr := r.media.Upload(ctx, key, ct, data); uerr == nil {
						m.ImageURL = &url
					} else {
						r.log.WithError(uerr).WithField("id", id64).Warn("upload user image failed")
					}
				}
			}
		}

		updates := map[string]interface{}{
			"name": m.Name,
			"role": m.Role,
		}

		if m.FounderID != nil {
			updates["founder_id"] = m.FounderID
		}

		if m.InvestorID != nil {
			updates["investor_id"] = m.InvestorID
		}

		if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "email"}},
			DoUpdates: clause.Assignments(updates),
		}).Create(&m).Error; err != nil {
			return fmt.Errorf("r.db.WithContext(ctx).Clauses(OnConflict email).Create(): %w", err)
		}

		if m.ImageURL != nil && *m.ImageURL != "" {
			_ = r.db.WithContext(ctx).Model(&models.User{}).
				Where("email = ? AND (image_url IS NULL OR image_url = '')", m.Email).
				Update("image_url", *m.ImageURL).Error
		}
	}
	return nil
}

// SoftDeleteMissing marks users as deleted if their emails are not present in the provided external IDs map.
func (r *GormUsersRepo) SoftDeleteMissing(ctx context.Context, existingExternalIDs map[string]struct{}) error {
	keep := make(map[string]struct{}, len(existingExternalIDs))
	for email := range existingExternalIDs {
		keep[email] = struct{}{}
	}

	var emails []string
	if err := r.db.WithContext(ctx).Model(&models.User{}).Select("email").Find(&emails).Error; err != nil {
		return fmt.Errorf("r.db.WithContext(ctx).Model(&models.User{}).Select(\\\"email\\\").Find(&emails): %w", err)
	}
	toDelete := make([]string, 0, len(emails))
	for _, e := range emails {
		if _, ok := keep[e]; !ok {
			toDelete = append(toDelete, e)
		}
	}
	if len(toDelete) == 0 {
		return nil
	}
	tx := r.db.WithContext(ctx).Where("email IN ?", toDelete).Delete(&models.User{})
	if err := tx.Error; err != nil {
		return fmt.Errorf("tx: %w", err)
	}
	r.log.WithFields(logrus.Fields{"deleted": tx.RowsAffected}).Info("repo: deleted missing users")
	return nil
}

// LastIncrementalWatermark retrieves the last incremental watermark from the database for the specified scope.
func (r *GormUsersRepo) LastIncrementalWatermark(ctx context.Context) (time.Time, error) {
	var st syncState
	if err := r.db.WithContext(ctx).First(&st, "name = ?", r.scope).Error; err != nil {
		return time.Time{}, err
	}
	return st.Watermark, nil
}

// UpdateIncrementalWatermark updates the incremental sync watermark in the database for the current scope.
func (r *GormUsersRepo) UpdateIncrementalWatermark(ctx context.Context, ts time.Time) error {
	st := syncState{Name: r.scope, Watermark: ts}
	if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{UpdateAll: true}).Create(&st).Error; err != nil {
		return fmt.Errorf("r.db.WithContext(ctx).Clauses(clause.OnConflict{}).Create(&st): %w", err)
	}
	return nil
}
