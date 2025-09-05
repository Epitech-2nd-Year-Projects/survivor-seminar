package v1_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	v1 "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestRootHandler_FullCoverage(t *testing.T) {
	cfg := &config.Config{App: config.AppConfig{Name: "TestApp", Env: "test", Version: "v1"}}
	h := v1.NewRootHandler(cfg)

	r := gin.Default()
	r.GET("/", h.Info)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}
