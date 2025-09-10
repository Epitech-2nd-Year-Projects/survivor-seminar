package models

import "time"

type AuthToken struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint64    `json:"user_id"`
	TokenHash string    `json:"-" gorm:"type:varchar(64);uniqueIndex;not null"`
	TokenType string    `json:"token_type" gorm:"type:varchar(16);not null"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}

func (AuthToken) TableName() string { return "auth_tokens" }
