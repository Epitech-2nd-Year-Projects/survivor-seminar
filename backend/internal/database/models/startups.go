package models

import (
	"time"

	"gorm.io/datatypes"
)

type Startup struct {
	// Unique startup identifier
	ID uint64 `gorm:"primaryKey" json:"id" example:"1"`
	// Startup name
	Name string `gorm:"not null;index:idx_startups_name_ci,expression:LOWER(name)" json:"name" example:"Acme"`
	// Legal status
	LegalStatus *string `json:"legal_status,omitempty" example:"SAS"`
	// Mailing address
	Address *string `json:"address,omitempty" example:"10 Rue de Rivoli, Paris"`
	// Contact email
	Email *string `json:"email,omitempty" format:"email" example:"contact@acme.tld"`
	// Contact phone
	Phone *string `json:"phone,omitempty" example:"+33 1 23 45 67 89"`
	// Creation timestamp (UTC)
	CreatedAt time.Time `gorm:"not null" json:"created_at" format:"date-time"`
	// Short description
	Description *string `json:"description,omitempty" example:"AI platform for SMBs"`
	// Website URL
	WebsiteURL *string `json:"website_url,omitempty" format:"uri" example:"https://acme.tld"`
	// Social media URL
	SocialMediaURL *string `json:"social_media_url,omitempty" format:"uri" example:"https://x.com/acme"`
	// Project status
	ProjectStatus *string `json:"project_status,omitempty" enums:"ongoing,completed" example:"ongoing"`
	// Stated needs
	Needs *string `json:"needs,omitempty" example:"Funding, Mentorship"`
	// Business sector
	Sector *string `json:"sector,omitempty" enums:"tech,health,finance" example:"tech"`
	// Maturity
	Maturity *string `json:"maturity,omitempty" enums:"early,middle,late" example:"early"`
	// Founders array (JSON)
	Founders datatypes.JSON `gorm:"type:jsonb;default:'[]'" json:"founders" swaggertype:"object"`
	// Views count
	ViewsCount int64 `gorm:"not null;default:0" json:"views_count" example:"0"`
}
