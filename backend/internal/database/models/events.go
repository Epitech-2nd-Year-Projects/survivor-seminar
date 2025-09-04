package models

import "time"

type Event struct {
	ID             uint64     `json:"id" gorm:"primaryKey"`
	Name           string     `json:"name" gorm:"type:varchar(255);not null"`
	Description    *string    `json:"description,omitempty" gorm:"type:text"`
	EventType      *string    `json:"event_type,omitempty" gorm:"type:varchar(100)"`
	Location       *string    `json:"location,omitempty" gorm:"type:text"`
	TargetAudience *string    `json:"target_audience,omitempty" gorm:"type:text"`
	StartDate      *time.Time `json:"start_date,omitempty"`
	EndDate        *time.Time `json:"end_date,omitempty"`
	Capacity       *int       `json:"capacity,omitempty"`
	ImageURL       *string    `json:"image_url,omitempty" gorm:"type:text"`
	CreatedAt      time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
}
