package response_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestJSON(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	data := map[string]string{"hello": "world"}
	response.JSON(c, http.StatusOK, data)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "world", resp["hello"])
}

func TestJSONError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	response.JSONError(c, http.StatusBadRequest, "invalid", "bad request", "details here")

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var resp response.ErrorBody
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "invalid", resp.Code)
	assert.Equal(t, "bad request", resp.Message)
	assert.Equal(t, "details here", resp.Details)
}

func TestJSONList(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	items := []string{"a", "b", "c"}
	meta := response.PageMeta{Page: 1, PerPage: 10, Total: 3}
	response.JSONList(c, http.StatusOK, items, meta)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)

	data := resp["data"].([]interface{})
	assert.Len(t, data, 3)
	assert.Equal(t, "a", data[0])

	assert.Equal(t, float64(1), resp["page"])
	assert.Equal(t, float64(10), resp["per_page"])
	assert.Equal(t, float64(3), resp["total"])
}
