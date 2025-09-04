package models

import "time"

type News struct {
	ID          uint64     `json:"id" gorm:"primaryKey"`
	Title       string     `json:"title" gorm:"type:varchar(255);not null"`
	NewsDate    *time.Time `json:"news_date,omitempty" gorm:"type:date"`
	Location    *string    `json:"location,omitempty" gorm:"type:text"`
	Category    *string    `json:"category,omitempty" gorm:"type:varchar(100)"`
	StartupID   *uint64    `json:"startup_id,omitempty" gorm:"type:bigint"`
	Description string     `json:"description" gorm:"type:text;not null"`
	ImageURL    *string    `json:"image_url,omitempty" gorm:"type:text"`

	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
