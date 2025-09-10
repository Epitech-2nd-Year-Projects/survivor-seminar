package models

import "time"

type Conversation struct {
	// Unique conversation identifier
	ID uint64 `json:"id" gorm:"primaryKey;autoIncrement" example:"1"`
	// Conversation title (optional, useful for group chats)
	Title *string `json:"title,omitempty" gorm:"type:varchar(255)" example:"Project Discussion"`
	// Whether this is a group conversation
	IsGroup bool `json:"is_group" gorm:"type:boolean;not null;default:false" example:"false"`
	// ID of the last message (optimization)
	LastMessageID *uint64 `json:"last_message_id,omitempty" gorm:"type:bigint"`
	// Creation timestamp (UTC)
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime" format:"date-time"`
	// Update timestamp (UTC)
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime" format:"date-time"`

	Participants []ConversationParticipant `json:"participants,omitempty" gorm:"foreignKey:ConversationID"`
	Messages     []Message                 `json:"messages,omitempty" gorm:"foreignKey:ConversationID"`
	LastMessage  *Message                  `json:"last_message,omitempty" gorm:"foreignKey:LastMessageID"`
}
