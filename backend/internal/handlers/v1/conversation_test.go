package v1_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/auth"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	v1 "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupConversationsDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}

	err = db.AutoMigrate(&models.User{}, &models.Conversation{},
		&models.ConversationParticipant{}, &models.Message{}, &models.MessageRead{})
	if err != nil {
		t.Fatal(err)
	}

	return db
}

func setupConversationsRouter(h *v1.ConversationsHandler) *gin.Engine {
	cfg := &config.Config{Auth: config.AuthConfig{JWT: config.JWTConfig{Secret: "test-secret"}}}
	r := gin.Default()
	r.Use(middleware.AuthRequired(cfg))

	r.GET("/conversations", h.GetConversations)
	r.POST("/conversations", h.CreateConversation)
	r.GET("/conversations/:id", h.GetConversation)
	r.GET("/conversations/:id/messages", h.GetMessages)
	r.POST("/conversations/:id/messages", h.SendMessage)
	r.POST("/conversations/:id/mark-read", h.MarkMessageRead)

	return r
}

func createTestToken(userID uint64, email, role string) string {
	cfg := &config.Config{
		Auth: config.AuthConfig{
			JWT: config.JWTConfig{
				Secret:          "test-secret",
				AccessTokenTTL:  time.Hour,
				RefreshTokenTTL: time.Hour * 24,
			},
		},
	}

	pair, _ := auth.GenerateTokenPair(cfg, userID, email, role)
	return pair.AccessToken
}

func TestConversationsHandler_FullCoverage(t *testing.T) {
	db := setupConversationsDB(t)
	h := v1.NewConversationsHandler(db, logrus.New())
	r := setupConversationsRouter(h)

	user1 := models.User{ID: 1, Email: "user1@test.com", Name: "User 1", Role: "founder"}
	user2 := models.User{ID: 2, Email: "user2@test.com", Name: "User 2", Role: "investor"}
	db.Create(&user1)
	db.Create(&user2)

	token1 := createTestToken(1, "user1@test.com", "founder")
	token2 := createTestToken(2, "user2@test.com", "investor")

	body := `{"participant_ids":[1,2],"title":"Test Chat","is_group":false}`
	req := httptest.NewRequest(http.MethodPost, "/conversations", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token1)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	var createResp struct {
		Data models.Conversation `json:"data"`
	}
	err := json.Unmarshal(w.Body.Bytes(), &createResp)
	if err != nil {
		return
	}
	conversationID := createResp.Data.ID

	req = httptest.NewRequest(http.MethodGet, "/conversations", nil)
	req.Header.Set("Authorization", "Bearer "+token1)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	req = httptest.NewRequest(http.MethodGet, fmt.Sprintf("/conversations/%d", conversationID), nil)
	req.Header.Set("Authorization", "Bearer "+token1)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	body = `{"content":"Hello there!"}`
	req = httptest.NewRequest(http.MethodPost, fmt.Sprintf("/conversations/%d/messages", conversationID), bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token1)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	var msgResp struct {
		Data models.Message `json:"data"`
	}
	err = json.Unmarshal(w.Body.Bytes(), &msgResp)
	if err != nil {
		return
	}
	messageID := msgResp.Data.ID

	req = httptest.NewRequest(http.MethodGet, fmt.Sprintf("/conversations/%d/messages", conversationID), nil)
	req.Header.Set("Authorization", "Bearer "+token2)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	body = fmt.Sprintf(`{"message_id":%d}`, messageID)
	req = httptest.NewRequest(http.MethodPost, fmt.Sprintf("/conversations/%d/mark-read", conversationID), bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token2)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	req = httptest.NewRequest(http.MethodGet, "/conversations", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusUnauthorized, w.Code)

	user3 := models.User{ID: 3, Email: "user3@test.com", Name: "User 3", Role: "founder"}
	db.Create(&user3)
	token3 := createTestToken(3, "user3@test.com", "founder")

	req = httptest.NewRequest(http.MethodGet, fmt.Sprintf("/conversations/%d", conversationID), nil)
	req.Header.Set("Authorization", "Bearer "+token3)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusForbidden, w.Code)
}
