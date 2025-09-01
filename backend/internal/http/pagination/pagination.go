package pagination

import (
	"github.com/gin-gonic/gin"
	"strconv"
)

type Params struct {
	Page    int
	PerPage int
	Sort    string
	Order   string
}

func Parse(c *gin.Context) Params {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	per, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	sort := c.DefaultQuery("sort", "created_at")
	order := c.DefaultQuery("order", "desc")

	if page < 1 {
		page = 1
	}
	if per < 1 || per > 200 {
		per = 20
	}
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	return Params{
		Page:    page,
		PerPage: per,
		Sort:    sort,
		Order:   order,
	}
}
