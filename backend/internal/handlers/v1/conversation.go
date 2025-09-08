package v1

import (
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strconv"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/http/pagination"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ConversationsHandler struct {
	db  *gorm.DB
	log *logrus.Logger
}

var validConversationSortFields = []string{
	"id",
	"created_at",
	"updated_at",
}

func NewConversationsHandler(db *gorm.DB, log *logrus.Logger) *ConversationsHandler {
	return &ConversationsHandler{
		db:  db,
		log: log,
	}
}

func (h *ConversationsHandler) isUserParticipant(userID uint64, conversationID string) bool {
	var count int64

	h.db.Model(&models.ConversationParticipant{}).
		Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Count(&count)
	return count > 0
}

func (h *ConversationsHandler) getUnreadCount(userID, conversationID uint64) int {
	var participant models.ConversationParticipant
	if err := h.db.Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		First(&participant).Error; err != nil {
		return 0
	}

	var count int64
	query := h.db.Model(&models.Message{}).
		Where("conversation_id = ? AND deleted_at IS NULL", conversationID)

	if participant.LastReadMessageID != nil {
		query = query.Where("id > ?", *participant.LastReadMessageID)
	}

	query.Count(&count)
	return int(count)
}

// GetConversations godoc
// @Summary      List user conversations
// @Description  Returns a paginated list of conversations for the authenticated user with unread counts.
// @Tags         Conversations
// @Security     BearerAuth
// @Param        page      query int    false "Page" default(1)
// @Param        per_page  query int    false "Page size" default(20)
// @Param        sort      query string false "Sort field" Enums(id,created_at,updated_at) default(updated_at)
// @Param        order     query string false "Sort order" Enums(asc,desc) default(desc)
// @Success      200 {object} response.ConversationsWithUnreadResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /conversations [get]
func (h *ConversationsHandler) GetConversations(c *gin.Context) {
	claims := middleware.GetClaims(c)
	if claims == nil {
		response.JSONError(c, http.StatusUnauthorized,
			"unauthorized", "missing auth", nil)
		return
	}

	params := pagination.Parse(c)
	offset := (params.Page - 1) * params.PerPage

	if !slices.Contains(validConversationSortFields, params.Sort) {
		response.JSONError(c, http.StatusBadRequest, "invalid_sort",
			fmt.Sprintf("invalid sort field '%s'. Allowed: %v", params.Sort, validConversationSortFields), nil)
		return
	}

	var conversations []models.Conversation
	query := h.db.
		Joins("JOIN conversation_participants cp ON cp.conversation_id = conversations.id").
		Where("cp.user_id = ?", claims.UserID).
		Preload("Participants.User").
		Preload("LastMessage.Sender")

	var total int64
	if err := query.Model(&models.Conversation{}).Count(&total).Error; err != nil {
		h.log.WithError(err).Error("failed to count conversations")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve conversations count", nil)
		return
	}

	orderBy := fmt.Sprintf("conversations.%s %s", params.Sort, params.Order)
	if err := query.Order(orderBy).Offset(offset).Limit(params.PerPage).Find(&conversations).Error; err != nil {
		h.log.WithError(err).Error("failed to fetch conversations")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve conversations", nil)
		return
	}

	var result []response.ConversationWithUnreadCountResponse
	for _, conv := range conversations {
		unreadCount := h.getUnreadCount(claims.UserID, conv.ID)
		result = append(result, response.ConversationWithUnreadCountResponse{
			Data:        conv,
			UnreadCount: unreadCount,
		})
	}

	totalPages := (int(total) + params.PerPage - 1) / params.PerPage
	hasNext := params.Page < totalPages
	hasPrev := params.Page > 1

	response.JSON(c, http.StatusOK, gin.H{
		"data": result,
		"pagination": gin.H{
			"page":     params.Page,
			"per_page": params.PerPage,
			"total":    total,
			"has_next": hasNext,
			"has_prev": hasPrev,
		},
	})
}

// GetConversation godoc
// @Summary      Get conversation
// @Description  Retrieves a conversation by ID with messages.
// @Tags         Conversations
// @Security     BearerAuth
// @Param        id path int true "Conversation ID"
// @Success      200 {object} response.ConversationObjectResponse
// @Failure      401 {object} response.ErrorBody
// @Failure      403 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /conversations/{id} [get]
func (h *ConversationsHandler) GetConversation(c *gin.Context) {
	claims := middleware.GetClaims(c)
	if claims == nil {
		response.JSONError(c, http.StatusUnauthorized,
			"unauthorized", "missing auth", nil)
		return
	}

	id := c.Param("id")

	if !h.isUserParticipant(claims.UserID, id) {
		response.JSONError(c, http.StatusForbidden,
			"forbidden", "not a participant", nil)
		return
	}

	var conversation models.Conversation
	if err := h.db.
		Preload("Participants.User").
		Preload("Messages.Sender").
		Where("id = ?", id).
		First(&conversation).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSONError(c, http.StatusNotFound,
				"not_found", "conversation not found", nil)
			return
		}
		h.log.WithError(err).Error("failed to fetch conversation")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to retrieve conversation", nil)
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"data": conversation})
}

// CreateConversation godoc
// @Summary      Create conversation
// @Description  Creates a new conversation with specified participants.
// @Tags         Conversations
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        payload body requests.ConversationCreateRequest true "Conversation" Example({"participant_ids":[1,2],"title":"Project Discussion","is_group":false})
// @Success      201 {object} response.ConversationObjectResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /conversations [post]
func (h *ConversationsHandler) CreateConversation(c *gin.Context) {
	claims := middleware.GetClaims(c)
	if claims == nil {
		response.JSONError(c, http.StatusUnauthorized,
			"unauthorized", "missing auth", nil)
		return
	}

	var req struct {
		ParticipantIDs []uint64 `json:"participant_ids" binding:"required,min=1"`
		Title          *string  `json:"title,omitempty"`
		IsGroup        bool     `json:"is_group"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, http.StatusBadRequest,
			"invalid_payload", "invalid request payload", err.Error())
		return
	}

	if !slices.Contains(req.ParticipantIDs, claims.UserID) {
		req.ParticipantIDs = append(req.ParticipantIDs, claims.UserID)
	}

	var userCount int64
	if err := h.db.Model(&models.User{}).Where("id IN ?", req.ParticipantIDs).Count(&userCount).Error; err != nil {
		h.log.WithError(err).Error("failed to validate participants")
		response.JSONError(c, http.StatusInternalServerError,
			"internal_error", "failed to validate participants", nil)
		return
	}

	if int64(len(req.ParticipantIDs)) != userCount {
		response.JSONError(c, http.StatusBadRequest,
			"invalid_participants", "some participants do not exist", nil)
		return
	}

	conversation := models.Conversation{
		Title:   req.Title,
		IsGroup: req.IsGroup,
	}

	if err := h.db.Create(&conversation).Error; err != nil {
		h.log.WithError(err).Error("failed to create conversation")
		response.JSONError(c, http.StatusInternalServerError, "internal_error", "failed to create conversation", nil)
		return
	}

	for i, userID := range req.ParticipantIDs {
		role := "member"
		if userID == claims.UserID {
			role = "owner"
		}

		participant := models.ConversationParticipant{
			ConversationID: conversation.ID,
			UserID:         userID,
			Role:           role,
		}

		if err := h.db.Create(&participant).Error; err != nil {
			h.log.WithError(err).WithField("user_id", userID).Error("failed to add participant")
		}

		if i == 0 {
			conversation.Participants = []models.ConversationParticipant{participant}
		} else {
			conversation.Participants = append(conversation.Participants, participant)
		}
	}

	if err := h.db.Preload("Participants.User").First(&conversation, conversation.ID).Error; err != nil {
		h.log.WithError(err).Error("failed to reload conversation")
	}

	response.JSON(c, http.StatusCreated, gin.H{
		"message": "conversation created successfully",
		"data":    conversation,
	})
}
