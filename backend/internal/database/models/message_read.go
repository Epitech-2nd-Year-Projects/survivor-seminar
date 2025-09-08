package models

import "time"

type MessageRead struct {
	// Unique read identifier
	ID uint64 `json:"id" gorm:"primaryKey" example:"1"`
	// Message ID
	MessageID uint64 `json:"message_id" gorm:"not null;index" example:"1"`
	// User ID who read the message
	UserID uint64 `json:"user_id" gorm:"not null;index" example:"1"`
	// When the message was read
	ReadAt time.Time `json:"read_at" gorm:"autoCreateTime" format:"date-time"`
}

func (MessageRead) TableName() string {
	return "message_reads"
}
