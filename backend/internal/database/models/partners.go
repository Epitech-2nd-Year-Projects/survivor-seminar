package models

import "time"

type Partner struct {
	ID              uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name            string     `gorm:"type:varchar(255);not null" json:"name"`
	LegalStatus     *string    `gorm:"type:varchar(255)" json:"legal_status,omitempty"`
	Address         *string    `gorm:"type:text" json:"address,omitempty"`
	Email           string     `gorm:"type:varchar(255);not null" json:"email"`
	Phone           *string    `gorm:"type:varchar(100)" json:"phone,omitempty"`
	CreatedAt       *time.Time `json:"created_at,omitempty"`
	Description     *string    `gorm:"type:text" json:"description,omitempty"`
	PartnershipType *string    `gorm:"type:varchar(255)" json:"partnership_type,omitempty"`
	CreatedAtLocal  time.Time  `gorm:"autoCreateTime" json:"-"`
	UpdatedAtLocal  time.Time  `gorm:"autoUpdateTime" json:"-"`
}
