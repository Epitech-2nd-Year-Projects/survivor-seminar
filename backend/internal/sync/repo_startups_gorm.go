package sync

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type syncState struct {
	Name      string    `gorm:"primaryKey;column:name"`
	Watermark time.Time `gorm:"column:watermark"`
}

func (syncState) TableName() string { return "sync_state" }

// GormStartupsRepo persists startups into DB and tracks watermark.
type GormStartupsRepo struct {
	db    *gorm.DB
	log   *logrus.Logger
	scope string
}

// NewGormStartupsRepo initializes and returns a new instance of GormStartupsRepo with the given database and logger.
func NewGormStartupsRepo(db *gorm.DB, log *logrus.Logger) *GormStartupsRepo {
	return &GormStartupsRepo{
		db:    db,
		log:   log,
		scope: "startups",
	}
}

// UpsertBatch inserts or updates a batch of upstream items in the database using their primary keys.
func (r *GormStartupsRepo) UpsertBatch(ctx context.Context, items []UpstreamItem) error {
	if len(items) == 0 {
		return nil
	}
	for _, it := range items {
		id64, err := strconv.ParseUint(it.ExternalID, 10, 64)
		if err != nil {
			return fmt.Errorf("strconv.ParseUint(it.ExternalID, 10, 64): %w", err)
		}

		m := models.Startup{
			ID:             id64,
			Name:           getString(it.Payload, "name"),
			LegalStatus:    getStringPtr(it.Payload, "legal_status"),
			Address:        getStringPtr(it.Payload, "address"),
			Email:          getStringPtr(it.Payload, "email"),
			Phone:          getStringPtr(it.Payload, "phone"),
			Description:    getStringPtr(it.Payload, "description"),
			WebsiteURL:     getStringPtr(it.Payload, "website_url"),
			SocialMediaURL: getStringPtr(it.Payload, "social_media_url"),
			ProjectStatus:  getStringPtr(it.Payload, "project_status"),
			Needs:          getStringPtr(it.Payload, "needs"),
			Sector:         getStringPtr(it.Payload, "sector"),
			Maturity:       getStringPtr(it.Payload, "maturity"),
		}

		if s, ok := it.Payload["created_at"].(*string); ok && s != nil && *s != "" {
			if t, perr := time.Parse("2006-01-02", *s); perr == nil {
				m.CreatedAt = t
			} else {
				m.CreatedAt = time.Now().UTC()
			}
		} else if v, ok := it.Payload["created_at"].(string); ok && v != "" {
			if t, perr := time.Parse("2006-01-02", v); perr == nil {
				m.CreatedAt = t
			} else {
				m.CreatedAt = time.Now().UTC()
			}
		} else {
			m.CreatedAt = time.Now().UTC()
		}

		if f, ok := it.Payload["founders"].([]jebFounderLite); ok {
			b, _ := json.Marshal(f)
			m.Founders = b
		} else if anyf, ok := it.Payload["founders"].([]any); ok {
			b, _ := json.Marshal(anyf)
			m.Founders = b
		} else {
			b, _ := json.Marshal(it.Payload["founders"])
			if len(b) == 0 {
				m.Founders = []byte("[]")
			} else {
				m.Founders = b
			}
		}

		if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{
			DoNothing: true,
		}).Create(&m).Error; err != nil {
			return fmt.Errorf("r.db.WithContext(ctx).Clauses().Create(): %w", err)
		}
	}
	return nil
}

// SoftDeleteMissing removes startups from the database that are not present in the provided external IDs list.
func (r *GormStartupsRepo) SoftDeleteMissing(ctx context.Context, existingExternalIDs map[string]struct{}) error {
	keep := make(map[uint64]struct{}, len(existingExternalIDs))
	for k := range existingExternalIDs {
		if id, err := strconv.ParseUint(k, 10, 64); err == nil {
			keep[id] = struct{}{}
		}
	}

	var ids []uint64
	if err := r.db.WithContext(ctx).Model(&models.Startup{}).Select("id").Find(&ids).Error; err != nil {
		return fmt.Errorf("r.db.WithContext(ctx).Model(&models.Startup{}).Select(\"id\").Find(&ids): %w", err)
	}
	toDelete := make([]uint64, 0, len(ids))
	for _, id := range ids {
		if _, ok := keep[id]; !ok {
			toDelete = append(toDelete, id)
		}
	}
	if len(toDelete) == 0 {
		return nil
	}
	tx := r.db.WithContext(ctx).Where("id IN ?", toDelete).Delete(&models.Startup{})
	if err := tx.Error; err != nil {
		return fmt.Errorf("tx: %w", err)
	}
	r.log.WithFields(logrus.Fields{
		"deleted": tx.RowsAffected,
	}).Info("repo: deleted missing startups")
	return nil
}

func (r *GormStartupsRepo) LastIncrementalWatermark(ctx context.Context) (time.Time, error) {
	var st syncState
	if err := r.db.WithContext(ctx).First(&st, "name = ?", r.scope).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return time.Time{}, err
		}
		return time.Time{}, fmt.Errorf("r.db.WithContext(ctx).First(&st, \"name = ?\", r.scope): %w", err)
	}
	return st.Watermark, nil
}

func (r *GormStartupsRepo) UpdateIncrementalWatermark(ctx context.Context, ts time.Time) error {
	st := syncState{Name: r.scope, Watermark: ts}
	if err := r.db.WithContext(ctx).Clauses(clause.OnConflict{
		UpdateAll: true,
	}).Create(&st).Error; err != nil {
		return fmt.Errorf("r.db.WithContext(ctx).Clauses(clause.OnConflict{}).Create(&st): %w", err)
	}
	return nil
}

type jebFounderLite struct {
	Name string `json:"name"`
	Role string `json:"role,omitempty"`
}

func getString(m map[string]any, k string) string {
	if v, ok := m[k].(string); ok {
		return v
	}

	if p, ok := m[k].(*string); ok && p != nil {
		return *p
	}

	return ""
}

func getStringPtr(m map[string]any, k string) *string {
	if v, ok := m[k].(string); ok {
		return &v
	}

	if p, ok := m[k].(*string); ok {
		return p
	}

	return nil
}
