package models

import "time"

type Founder struct {
	ID        uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID    uint64    `json:"user_id"`
	StartupID uint64    `json:"startup_id"`
	CreatedAt time.Time `json:"created_at"`
}
