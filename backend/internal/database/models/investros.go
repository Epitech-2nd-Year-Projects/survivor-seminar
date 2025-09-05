package models

import "time"

type Investor struct {
	// Unique investor identifier
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id" example:"1"`
	// Legal name
	Name string `gorm:"type:varchar(255);not null" json:"name" example:"VC Alpha"`
	// Legal status
	LegalStatus *string `gorm:"type:varchar(255)" json:"legal_status,omitempty" example:"SaaS"`
	// Address
	Address *string `gorm:"type:text" json:"address,omitempty" example:"21 Jump Street, Paris"`
	// Contact email
	Email string `gorm:"type:varchar(255);not null" json:"email" format:"email" example:"contact@vcalpha.tld"`
	// Contact phone
	Phone *string `gorm:"type:varchar(100)" json:"phone,omitempty" example:"+33 1 23 45 67 89"`
	// Creation timestamp (UTC)
	CreatedAt *time.Time `json:"created_at,omitempty" format:"date-time"`
	// Short description
	Description *string `gorm:"type:text" json:"description,omitempty" example:"Early-stage VC"`
	// Type (VC, CVC, angel, ...)
	InvestorType *string `gorm:"type:varchar(255)" json:"investor_type,omitempty" example:"VC"`
	// Focus (industries, stages)
	InvestmentFocus *string   `gorm:"type:text" json:"investment_focus,omitempty" example:"Seed, Series A"`
	CreatedAtLocal  time.Time `gorm:"autoCreateTime" json:"-"`
	UpdatedAtLocal  time.Time `gorm:"autoUpdateTime" json:"-"`
}
