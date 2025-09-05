package v1_test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	v1 "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

func setupStartupsRouter(h *v1.StartupsHandler) *gin.Engine {
	r := gin.Default()
	r.GET("/startups", h.ListStartups)
	r.GET("/startups/:id", h.GetStartup)
	r.POST("/admin/startups", h.CreateStartup)
	r.PATCH("/admin/startups/:id", h.UpdateStartup)
	r.DELETE("/admin/startups/:id", h.DeleteStartup)
	return r
}

func TestStartupsHandler_FullCoverage(t *testing.T) {
	db := setupUsersDB(t)
	_ = db.AutoMigrate(&models.Startup{})
	h := v1.NewStartupsHandler(db, logrus.New())
	r := setupStartupsRouter(h)

	req := httptest.NewRequest(http.MethodPost, "/admin/startups", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusBadRequest, w.Code)

	body := `{"name":"MyStartup","created_at":"2024-01-01"}`
	req = httptest.NewRequest(http.MethodPost, "/admin/startups", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	req = httptest.NewRequest(http.MethodGet, "/startups", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	req = httptest.NewRequest(http.MethodGet, "/startups/1", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	req = httptest.NewRequest(http.MethodGet, "/startups/999", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusNotFound, w.Code)

	req = httptest.NewRequest(http.MethodPatch, "/admin/startups/1", bytes.NewBufferString(`{"email":"bad"}`))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusBadRequest, w.Code)

	req = httptest.NewRequest(http.MethodPatch, "/admin/startups/1", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusBadRequest, w.Code)

	req = httptest.NewRequest(http.MethodPatch, "/admin/startups/1", bytes.NewBufferString(`{"name":"Updated"}`))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	req = httptest.NewRequest(http.MethodDelete, "/admin/startups/1", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	req = httptest.NewRequest(http.MethodDelete, "/admin/startups/999", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusNotFound, w.Code)
}
