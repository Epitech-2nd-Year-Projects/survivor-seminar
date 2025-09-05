package models

import "time"

type Partner struct {
	// Unique partner identifier
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id" example:"1"`
	// Partner legal name
	Name string `gorm:"type:varchar(255);not null" json:"name" example:"ACME Corp"`
	// Legal status
	LegalStatus *string `gorm:"type:varchar(255)" json:"legal_status,omitempty" example:"SAS"`
	// Mailing address
	Address *string `gorm:"type:text" json:"address,omitempty" example:"5 Avenue Anatole France, Paris"`
	// Contact email
	Email string `gorm:"type:varchar(255);not null" json:"email" format:"email" example:"partners@acme.tld"`
	// Contact phone
	Phone *string `gorm:"type:varchar(100)" json:"phone,omitempty" example:"+33 1 23 45 67 89"`
	// Creation timestamp (UTC)
	CreatedAt *time.Time `json:"created_at,omitempty" format:"date-time"`
	// Short description
	Description *string `gorm:"type:text" json:"description,omitempty" example:"Sponsor"`
	// Type of partnership
	PartnershipType *string   `gorm:"type:varchar(255)" json:"partnership_type,omitempty" example:"sponsor"`
	CreatedAtLocal  time.Time `gorm:"autoCreateTime" json:"-"`
	UpdatedAtLocal  time.Time `gorm:"autoUpdateTime" json:"-"`
}
