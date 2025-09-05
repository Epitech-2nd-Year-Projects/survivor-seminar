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

func setupNewsRouter(h *v1.NewsHandler) *gin.Engine {
	r := gin.Default()
	r.GET("/news", h.GetNews)
	r.GET("/news/:id", h.GetNewsItem)
	r.GET("/news/:id/image", h.GetNewsImage)
	r.POST("/admin/news", h.CreateNews)
	r.PATCH("/admin/news/:id", h.UpdateNews)
	r.DELETE("/admin/news/:id", h.DeleteNews)
	return r
}

func TestNewsHandler_FullCoverage(t *testing.T) {
	db := setupUsersDB(t)
	_ = db.AutoMigrate(&models.News{})
	h := v1.NewNewsHandler(db, logrus.New())
	r := setupNewsRouter(h)

	req := httptest.NewRequest(http.MethodPost, "/admin/news", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusBadRequest, w.Code)

	body := `{"title":"News1","description":"desc"}`
	req = httptest.NewRequest(http.MethodPost, "/admin/news", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	req = httptest.NewRequest(http.MethodGet, "/news", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	req = httptest.NewRequest(http.MethodGet, "/news/1", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	req = httptest.NewRequest(http.MethodGet, "/news/999", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusNotFound, w.Code)

	req = httptest.NewRequest(http.MethodGet, "/news/1/image", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusNotFound, w.Code)

	req = httptest.NewRequest(http.MethodPatch, "/admin/news/1", bytes.NewBufferString(`{"title":123}`))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusBadRequest, w.Code)

	req = httptest.NewRequest(http.MethodPatch, "/admin/news/1", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusBadRequest, w.Code)

	req = httptest.NewRequest(http.MethodPatch, "/admin/news/1", bytes.NewBufferString(`{"title":"Updated"}`))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	req = httptest.NewRequest(http.MethodDelete, "/admin/news/1", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	req = httptest.NewRequest(http.MethodDelete, "/admin/news/999", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusNotFound, w.Code)
}
