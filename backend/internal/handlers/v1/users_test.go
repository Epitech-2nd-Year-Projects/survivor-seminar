package v1_test

import (
	"testing"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupUsersDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&models.User{}); err != nil {
		t.Fatal(err)
	}
	return db
}
