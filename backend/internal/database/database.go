package database

import (
	"fmt"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

// Open establishes a GORM database connection using provided configuration and logger.
// It sets up connection pooling and logging levels based on the configuration values.
// Returns a GORM DB instance or an error if connection could not be established.
func Open(cfg *config.Config, log *logrus.Logger) (*gorm.DB, error) {
	if cfg.Database.URL == "" {
		return nil, fmt.Errorf("database.url is empty")
	}

	var lvl gormlogger.LogLevel
	switch cfg.Logging.Level {
	case "debug":
		lvl = gormlogger.Info
	case "warn":
		lvl = gormlogger.Warn
	case "error":
		lvl = gormlogger.Error
	default:
		lvl = gormlogger.Warn
	}

	newLogger := gormlogger.New(
		log,
		gormlogger.Config{
			SlowThreshold:             200 * time.Millisecond,
			LogLevel:                  lvl,
			IgnoreRecordNotFoundError: true,
			Colorful:                  false,
		},
	)

	gdb, err := gorm.Open(postgres.Open(cfg.Database.URL), &gorm.Config{Logger: newLogger})
	if err != nil {
		return nil, fmt.Errorf("gorm.Open(postgres): %w", err)
	}

	sqlDB, err := gdb.DB()
	if err != nil {
		return nil, fmt.Errorf("gdb.DB(): %w", err)
	}

	if cfg.Database.PoolSize > 0 {
		sqlDB.SetMaxOpenConns(cfg.Database.PoolSize)
		idle := cfg.Database.PoolSize / 2
		if idle < 1 {
			idle = 1
		}
		sqlDB.SetMaxIdleConns(idle)
	}
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	sqlDB.SetConnMaxIdleTime(10 * time.Minute)

	return gdb, nil
}
