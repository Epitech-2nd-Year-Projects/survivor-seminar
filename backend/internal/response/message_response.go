package response

import "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"

type ConversationObjectResponse struct {
	Data models.Conversation `json:"data"`
}

type ConversationListResponse struct {
	Data       []models.Conversation `json:"data"`
	Pagination PageMeta              `json:"pagination"`
}

type MessageObjectResponse struct {
	Data models.Message `json:"data"`
}

type MessageListResponse struct {
	Data       []models.Message `json:"data"`
	Pagination PageMeta         `json:"pagination"`
}

type ConversationWithUnreadCountResponse struct {
	Data        models.Conversation `json:"data"`
	UnreadCount int                 `json:"unread_count"`
}

type ConversationsWithUnreadResponse struct {
	Data       []ConversationWithUnreadCountResponse `json:"data"`
	Pagination PageMeta                              `json:"pagination"`
}
