package models

import "time"

type User struct {
	// Unique user identifier
	ID uint64 `json:"id" gorm:"primaryKey;autoIncrement" example:"1"`
	// Email address (unique)
	Email string `json:"email" gorm:"type:varchar(255);uniqueIndex;not null" format:"email" example:"user@example.com"`
	// Display name
	Name string `json:"name" gorm:"type:varchar(255);not null" example:"Jane Doe"`
	// Role name
	Role         string `json:"role" gorm:"type:varchar(50);not null" enums:"admin,user,investor,founder" example:"user"`
	PasswordHash string `json:"-" gorm:"type:text;not null"`
	// Related founder profile ID
	FounderID *uint64 `json:"founder_id,omitempty" gorm:"type:bigint" example:"1"`
	// Related investor profile ID
	InvestorID *uint64 `json:"investor_id,omitempty" gorm:"type:bigint" example:"2"`
	// Avatar URL
	ImageURL *string `json:"image_url,omitempty" gorm:"type:text" format:"uri" example:"https://cdn.example.com/avatars/1.png"`
	// Whether the email has been verified
	EmailVerified bool `json:"email_verified" gorm:"type:boolean;not null;default:false" example:"false"`
	// Creation timestamp (UTC)
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime" format:"date-time"`
	// Update timestamp (UTC)
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime" format:"date-time"`
}
