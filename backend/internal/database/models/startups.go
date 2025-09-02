package models

import (
	"gorm.io/datatypes"
	"time"
)

type Startup struct {
	ID             uint64         `gorm:"primaryKey" json:"id"`
	Name           string         `gorm:"not null;index:idx_startups_name_ci,expression:LOWER(name)" json:"name"`
	LegalStatus    *string        `json:"legal_status,omitempty"`
	Address        *string        `json:"address,omitempty"`
	Email          *string        `json:"email,omitempty"`
	Phone          *string        `json:"phone,omitempty"`
	CreatedAt      time.Time      `gorm:"not null" json:"created_at"`
	Description    *string        `json:"description,omitempty"`
	WebsiteURL     *string        `json:"website_url,omitempty"`
	SocialMediaURL *string        `json:"social_media_url,omitempty"`
	ProjectStatus  *string        `json:"project_status,omitempty"`
	Needs          *string        `json:"needs,omitempty"`
	Sector         *string        `json:"sector,omitempty"`
	Maturity       *string        `json:"maturity,omitempty"`
	Founders       datatypes.JSON `gorm:"type:jsonb;default:'[]'" json:"founders"`
}
