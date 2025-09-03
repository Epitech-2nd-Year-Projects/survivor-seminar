package models

import "time"

type Founder struct {
	ID         uint64    `json:"id" gorm:"primaryKey"`
	Name       string    `json:"name" gorm:"type:varchar(255);not null"`
	Role       *string   `json:"role,omitempty" gorm:"type:varchar(100)"`
	Email      *string   `json:"email,omitempty" gorm:"type:varchar(255)"`
	StartupID  uint64    `json:"startup_id" gorm:"type:bigint;not null"`
	ImageURL   *string   `json:"image_url,omitempty" gorm:"type:text"`
	Visibility bool      `json:"visibility" gorm:"default:true"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
