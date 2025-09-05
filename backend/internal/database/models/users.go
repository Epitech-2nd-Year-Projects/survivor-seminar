package models

import "time"

type User struct {
	ID            uint64    `json:"id" gorm:"primaryKey"`
	Email         string    `json:"email" gorm:"type:varchar(255);uniqueIndex;not null"`
	Name          string    `json:"name" gorm:"type:varchar(255);not null"`
	Role          string    `json:"role" gorm:"type:varchar(50);not null"`
	PasswordHash  string    `json:"-" gorm:"type:text;not null"`
	FounderID     *uint64   `json:"founder_id,omitempty" gorm:"type:bigint"`
	InvestorID    *uint64   `json:"investor_id,omitempty" gorm:"type:bigint"`
	ImageURL      *string   `json:"image_url,omitempty" gorm:"type:text"`
	EmailVerified bool      `json:"email_verified" gorm:"type:boolean;not null;default:false"`
	CreatedAt     time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
