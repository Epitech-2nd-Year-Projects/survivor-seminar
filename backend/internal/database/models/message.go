package models

import "time"

type Message struct {
	// Unique message identifier
	ID uint64 `json:"id" gorm:"primaryKey;autoIncrement" example:"1"`
	// Conversation ID
	ConversationID uint64 `json:"conversation_id" gorm:"not null;index" example:"1"`
	// Sender user ID
	SenderID uint64 `json:"sender_id" gorm:"not null" example:"1"`
	// Message content
	Content string `json:"content" gorm:"type:text;not null" example:"Hello, how are you?"`
	// Creation timestamp (UTC)
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime" format:"date-time"`
	// Soft delete timestamp (for moderation)
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index"`

	Sender *User `json:"sender,omitempty" gorm:"foreignKey:SenderID"`
}
