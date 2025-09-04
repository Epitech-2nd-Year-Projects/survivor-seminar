package response

import (
	"github.com/gin-gonic/gin"
)

type ErrorBody struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

type PageMeta struct {
	Page    int `json:"page"`
	PerPage int `json:"per_page"`
	Total   int `json:"total"`
}

func JSON(c *gin.Context, status int, data interface{}) {
	c.JSON(status, data)
}

func JSONError(c *gin.Context, status int, code, message string, details interface{}) {
	c.JSON(status, ErrorBody{
		Code:    code,
		Message: message,
		Details: details,
	})
}

func JSONList(c *gin.Context, status int, items interface{}, meta PageMeta) {
	c.JSON(status, gin.H{
		"data":     items,
		"page":     meta.Page,
		"per_page": meta.PerPage,
		"total":    meta.Total,
	})
}
