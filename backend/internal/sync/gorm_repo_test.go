package sync

import (
	"context"
	"testing"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T, modelsToMigrate ...interface{}) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	allModels := append(modelsToMigrate, &syncState{})
	if err := db.AutoMigrate(allModels...); err != nil {
		t.Fatal(err)
	}
	return db
}

func TestGormUsersRepo_UpsertBatch(t *testing.T) {
	db := setupTestDB(t, &models.User{})
	repo := NewGormUsersRepo(db, logrus.New(), nil, nil)

	items := []UpstreamItem{{
		ExternalID: "1",
		Payload: map[string]any{
			"id":    int64(1),
			"email": "test@example.com",
			"name":  "John",
			"role":  "admin",
		},
		UpdatedAt: time.Now(),
	}}

	err := repo.UpsertBatch(context.Background(), items)
	assert.NoError(t, err)

	var u models.User
	err = db.First(&u, "email = ?", "test@example.com").Error
	assert.NoError(t, err)
	assert.Equal(t, "John", u.Name)
}

func TestGormUsersRepo_Watermark(t *testing.T) {
	db := setupTestDB(t, &models.User{})
	repo := NewGormUsersRepo(db, logrus.New(), nil, nil)

	ts := time.Now().UTC()
	err := repo.UpdateIncrementalWatermark(context.Background(), ts)
	assert.NoError(t, err)

	got, err := repo.LastIncrementalWatermark(context.Background())
	assert.NoError(t, err)
	assert.WithinDuration(t, ts, got, time.Second)
}

func TestGormUsersRepo_SoftDeleteMissing(t *testing.T) {
	db := setupTestDB(t, &models.User{})
	repo := NewGormUsersRepo(db, logrus.New(), nil, nil)

	// Insert 2 users
	db.Create(&models.User{Email: "a@b.com", Name: "A", Role: "admin", PasswordHash: "x"})
	db.Create(&models.User{Email: "b@b.com", Name: "B", Role: "admin", PasswordHash: "x"})

	// Keep only "a@b.com"
	err := repo.SoftDeleteMissing(context.Background(), map[string]struct{}{"a@b.com": {}})
	assert.NoError(t, err)

	var count int64
	db.Model(&models.User{}).Count(&count)
	assert.Equal(t, int64(1), count)
}

func TestGormStartupsRepo_UpsertBatch(t *testing.T) {
	db := setupTestDB(t, &models.Startup{})
	repo := NewGormStartupsRepo(db, logrus.New())

	items := []UpstreamItem{{
		ExternalID: "1",
		Payload: map[string]any{
			"name":       "MyStartup",
			"created_at": "2024-01-01",
			"sector":     "tech",
		},
		UpdatedAt: time.Now(),
	}}

	err := repo.UpsertBatch(context.Background(), items)
	assert.NoError(t, err)

	var s models.Startup
	err = db.First(&s, "id = ?", 1).Error
	assert.NoError(t, err)
	assert.Equal(t, "MyStartup", s.Name)
}

func TestGormStartupsRepo_Watermark(t *testing.T) {
	db := setupTestDB(t, &models.Startup{})
	repo := NewGormStartupsRepo(db, logrus.New())

	ts := time.Now().UTC()
	err := repo.UpdateIncrementalWatermark(context.Background(), ts)
	assert.NoError(t, err)

	got, err := repo.LastIncrementalWatermark(context.Background())
	assert.NoError(t, err)
	assert.WithinDuration(t, ts, got, time.Second)
}

func TestGormNewsRepo_UpsertBatch(t *testing.T) {
	db := setupTestDB(t, &models.News{})
	repo := NewGormNewsRepo(db, logrus.New(), nil, nil)

	items := []UpstreamItem{{
		ExternalID: "1",
		Payload: map[string]any{
			"title":       "Breaking News",
			"description": "desc",
			"news_date":   "2024-01-01",
		},
		UpdatedAt: time.Now(),
	}}

	err := repo.UpsertBatch(context.Background(), items)
	assert.NoError(t, err)

	var n models.News
	err = db.First(&n, "id = ?", 1).Error
	assert.NoError(t, err)
	assert.Equal(t, "Breaking News", n.Title)
}

func TestGormNewsRepo_Watermark(t *testing.T) {
	db := setupTestDB(t, &models.News{})
	repo := NewGormNewsRepo(db, logrus.New(), nil, nil)

	ts := time.Now().UTC()
	err := repo.UpdateIncrementalWatermark(context.Background(), ts)
	assert.NoError(t, err)

	got, err := repo.LastIncrementalWatermark(context.Background())
	assert.NoError(t, err)
	assert.WithinDuration(t, ts, got, time.Second)
}

func TestGormEventsRepo_UpsertBatch(t *testing.T) {
	db := setupTestDB(t, &models.Event{})
	repo := NewGormEventsRepo(db, logrus.New(), nil, nil)

	items := []UpstreamItem{{
		ExternalID: "1",
		Payload: map[string]any{
			"name":  "MyEvent",
			"dates": "2024-01-01,2024-01-02",
		},
		UpdatedAt: time.Now(),
	}}

	err := repo.UpsertBatch(context.Background(), items)
	assert.NoError(t, err)

	var e models.Event
	err = db.First(&e, "id = ?", 1).Error
	assert.NoError(t, err)
	assert.Equal(t, "MyEvent", e.Name)
	assert.NotNil(t, e.StartDate)
	assert.NotNil(t, e.EndDate)
}

func TestGormEventsRepo_Watermark(t *testing.T) {
	db := setupTestDB(t, &models.Event{})
	repo := NewGormEventsRepo(db, logrus.New(), nil, nil)

	ts := time.Now().UTC()
	err := repo.UpdateIncrementalWatermark(context.Background(), ts)
	assert.NoError(t, err)

	got, err := repo.LastIncrementalWatermark(context.Background())
	assert.NoError(t, err)
	assert.WithinDuration(t, ts, got, time.Second)
}
