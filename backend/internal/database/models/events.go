package models

import "time"

type Event struct {
	// Unique event identifier
	ID uint64 `json:"id" gorm:"primaryKey;autoIncrement" example:"1"`
	// Event name
	Name string `json:"name" gorm:"type:varchar(255);not null" example:"Conf 2025"`
	// Short description
	Description *string `json:"description,omitempty" gorm:"type:text" example:"Annual tech conference"`
	// Event type
	EventType *string `json:"event_type,omitempty" gorm:"type:varchar(100)" example:"conference"`
	// Venue or city
	Location *string `json:"location,omitempty" gorm:"type:text" example:"Paris"`
	// Intended audience
	TargetAudience *string `json:"target_audience,omitempty" gorm:"type:text" example:"Startups"`
	// Start date/time (UTC)
	StartDate *time.Time `json:"start_date,omitempty" format:"date-time"`
	// End date/time (UTC)
	EndDate *time.Time `json:"end_date,omitempty" format:"date-time"`
	// Capacity (seats)
	Capacity *int `json:"capacity,omitempty" example:"300"`
	// Image URL
	ImageURL *string `json:"image_url,omitempty" gorm:"type:text" format:"uri" example:"https://cdn.example.com/events/1.png"`
	// Creation timestamp (UTC)
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime" format:"date-time"`
	// Update timestamp (UTC)
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime" format:"date-time"`
}
