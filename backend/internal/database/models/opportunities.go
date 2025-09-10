package models

import "time"

type Opportunity struct {
	// Unique opportunity identifier
	ID uint `json:"id" gorm:"primaryKey;autoIncrement" example:"1"`
	// Opportunity title
	Title string `json:"title" gorm:"type:varchar(255);not null" example:"AI Grant"`
	// Opportunity type
	Type string `json:"type" gorm:"type:varchar(100);not null;index:idx_opportunities_type" example:"grant"`
	// Issuing organization
	Organism string `json:"organism" gorm:"type:varchar(255);not null" example:"EU"`
	// Short description
	Description *string `json:"description,omitempty" gorm:"type:text" example:"Funding program for AI"`
	// Eligibility criteria
	Criteria *string `json:"criteria,omitempty" gorm:"type:text" example:"Student or Startup < 3 years"`
	// External reference URL
	ExternalLink *string `json:"external_link,omitempty" gorm:"type:varchar(500)" format:"uri" example:"https://example.com/opportunity"`
	// Deadline (UTC)
	Deadline *time.Time `json:"deadline,omitempty" gorm:"index:idx_opportunities_deadline" format:"date-time"`
	// Creation timestamp (UTC)
	CreatedAt time.Time `json:"created_at" format:"date-time"`
	// Update timestamp (UTC)
	UpdatedAt time.Time `json:"updated_at" format:"date-time"`
}
