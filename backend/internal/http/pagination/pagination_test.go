package pagination_test

import (
	"net/http/httptest"
	"testing"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/http/pagination"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestParse_DefaultValues(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	req := httptest.NewRequest("GET", "/test", nil)
	c.Request = req

	params := pagination.Parse(c)

	assert.Equal(t, 1, params.Page)
	assert.Equal(t, 20, params.PerPage)
	assert.Equal(t, "created_at", params.Sort)
	assert.Equal(t, "desc", params.Order)
}

func TestParse_CustomValues(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	req := httptest.NewRequest("GET", "/test?page=2&per_page=50&sort=name&order=asc", nil)
	c.Request = req

	params := pagination.Parse(c)

	assert.Equal(t, 2, params.Page)
	assert.Equal(t, 50, params.PerPage)
	assert.Equal(t, "name", params.Sort)
	assert.Equal(t, "asc", params.Order)
}

func TestParse_InvalidPageAndPerPage(t *testing.T) {

	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	req := httptest.NewRequest("GET", "/test?page=-5&per_page=500", nil)
	c.Request = req

	params := pagination.Parse(c)

	assert.Equal(t, 1, params.Page)
	assert.Equal(t, 20, params.PerPage)
}

func TestParse_InvalidOrder(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	req := httptest.NewRequest("GET", "/test?order=invalid", nil)
	c.Request = req

	params := pagination.Parse(c)

	assert.Equal(t, "desc", params.Order)
}
