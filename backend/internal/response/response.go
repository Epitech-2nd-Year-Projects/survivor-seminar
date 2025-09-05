package response

import (
	"github.com/gin-gonic/gin"
)

type ErrorBody struct {
	// Machine-readable error code
	Code string `json:"code" example:"internal_error" enums:"invalid_params,invalid_sort,invalid_payload,internal_error,not_found,email_taken,invalid_token,invalid_credentials,no_fields,method_not_allowed,unauthorized"`
	// Human-readable error message
	Message string `json:"message" example:"failed to retrieve resource"`
	// Optional granular details (validation errors, etc.)
	Details interface{} `json:"details,omitempty"`
}

type PageMeta struct {
	// Current page number (1-based)
	Page int `json:"page" example:"1" minimum:"1"`
	// Page size (items per page)
	PerPage int `json:"per_page" example:"20" minimum:"1"`
	// Total number of items available
	Total int `json:"total" example:"123" minimum:"0"`
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
