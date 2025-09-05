package middleware_test

import (
	"bytes"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

func TestRequestID_GeneratesIfMissing(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()

	r := gin.New()
	r.Use(middleware.RequestID())
	r.GET("/", func(c *gin.Context) {
		rid := c.Writer.Header().Get(middleware.RequestIDHeader)
		c.JSON(200, gin.H{"rid": rid})
	})

	req := httptest.NewRequest("GET", "/", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.NotEmpty(t, w.Header().Get(middleware.RequestIDHeader))
}

func TestRequestID_UsesExistingHeader(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()

	r := gin.New()
	r.Use(middleware.RequestID())
	r.GET("/", func(c *gin.Context) {
		rid := c.Writer.Header().Get(middleware.RequestIDHeader)
		c.JSON(200, gin.H{"rid": rid})
	})

	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set(middleware.RequestIDHeader, "custom-id-123")
	r.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.Equal(t, "custom-id-123", w.Header().Get(middleware.RequestIDHeader))
}

func TestRecovery_CatchesPanic(t *testing.T) {
	gin.SetMode(gin.TestMode)
	var buf bytes.Buffer
	logger := logrus.New()
	logger.SetOutput(&buf)

	r := gin.New()
	r.Use(middleware.Recovery(logger))
	r.GET("/", func(c *gin.Context) {
		panic("boom")
	})

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.Contains(t, buf.String(), "panic recovered")

	assert.Contains(t, w.Body.String(), response.ErrorBody{Code: "internal_error"}.Code)
}

func TestLogger_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	var buf bytes.Buffer
	logger := logrus.New()
	logger.SetOutput(&buf)

	r := gin.New()
	r.Use(middleware.RequestID())
	r.Use(middleware.Logger(logger))
	r.GET("/", func(c *gin.Context) {
		c.String(200, "ok")
	})

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.Contains(t, buf.String(), "request completed")
}

func TestLogger_WithError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	var buf bytes.Buffer
	logger := logrus.New()
	logger.SetOutput(&buf)

	r := gin.New()
	r.Use(middleware.Logger(logger))
	r.GET("/", func(c *gin.Context) {
		_ = c.Error(errors.New("something went wrong"))
		c.String(500, "fail")
	})

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, 500, w.Code)
	assert.Contains(t, buf.String(), "request completed with errors")
	assert.Contains(t, buf.String(), "something went wrong")
}
