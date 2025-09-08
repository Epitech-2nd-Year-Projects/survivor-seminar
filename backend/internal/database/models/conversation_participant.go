package models

import "time"

type ConversationParticipant struct {
	// Unique participant identifier
	ID uint64 `json:"id" gorm:"primaryKey" example:"1"`
	// Conversation ID
	ConversationID uint64 `json:"conversation_id" gorm:"not null;index" example:"1"`
	// User ID
	UserID uint64 `json:"user_id" gorm:"not null;index" example:"1"`
	// Participant role (member, owner, etc.)
	Role string `json:"role" gorm:"type:varchar(20);not null;default:'member'" enums:"member,owner" example:"member"`
	// ID of the last message read by this user
	LastReadMessageID *uint64 `json:"last_read_message_id,omitempty" gorm:"type:bigint"`
	// When the user joined the conversation
	JoinedAt time.Time `json:"joined_at" gorm:"autoCreateTime" format:"date-time"`

	// Relationships
	User            *User    `json:"user,omitempty" gorm:"foreignKey:UserID"`
	LastReadMessage *Message `json:"last_read_message,omitempty" gorm:"foreignKey:LastReadMessageID"`
}

func (ConversationParticipant) TableName() string {
	return "conversation_participants"
}
