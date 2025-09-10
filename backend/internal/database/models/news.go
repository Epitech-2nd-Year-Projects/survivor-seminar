package models

import "time"

type News struct {
	// Unique news identifier
	ID uint64 `json:"id" gorm:"primaryKey;autoIncrement" example:"1"`
	// Title
	Title string `json:"title" gorm:"type:varchar(255);not null" example:"Funding round"`
	// Publication date
	NewsDate *time.Time `json:"news_date,omitempty" gorm:"type:date" format:"date"`
	// Location (if relevant)
	Location *string `json:"location,omitempty" gorm:"type:text" example:"Paris"`
	// Category or topic
	Category *string `json:"category,omitempty" gorm:"type:varchar(100)" example:"startup"`
	// Related startup ID
	StartupID *uint64 `json:"startup_id,omitempty" gorm:"type:bigint" example:"1"`
	// Body text
	Description string `json:"description" gorm:"type:text;not null" example:"Series A raised"`
	// Image URL
	ImageURL *string `json:"image_url,omitempty" gorm:"type:text" format:"uri" example:"https://cdn.example.com/news/1.png"`

	// Creation timestamp (UTC)
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime" format:"date-time"`
	// Update timestamp (UTC)
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime" format:"date-time"`
}
