package response

import (
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
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
	// Whether there is a next page
	HasNext bool `json:"has_next" example:"true"`
	// Whether there is a previous page
	HasPrev bool `json:"has_prev" example:"false"`
}

type StatisticsResponse struct {
	TotalProjects         int64   `json:"total_projects" example:"123"`
	ProjectsGrowth        int64   `json:"projects_growth" example:"10"`
	TotalViews            int64   `json:"total_views" example:"4200"`
	ViewsGrowthPercent    float64 `json:"views_growth_percent" example:"34.5"`
	EngagementRatePercent float64 `json:"engagement_rate_percent" example:"12.3"`
	Period                string  `json:"period" example:"weekly"`
}

type TopProject struct {
	ProjectID             uint64  `json:"project_id" example:"1"`
	Title                 string  `json:"title" example:"My Startup"`
	Views                 int64   `json:"views" example:"120"`
	Likes                 int64   `json:"likes" example:"45"`
	Comments              int64   `json:"comments" example:"12"`
	EngagementRatePercent float64 `json:"engagement_rate_percent" example:"23.4"`
}

type TopProjectsResponse struct {
	Period      string       `json:"period" example:"week"`
	Limit       int          `json:"limit" example:"10"`
	Count       int          `json:"count" example:"3"`
	TopProjects []TopProject `json:"top_projects"`
	GeneratedAt time.Time    `json:"generated_at" example:"2025-09-10T18:24:00Z"`
}

type FounderObjectResponse struct {
	Data models.Founder `json:"data"`
}
type FounderListResponse struct {
	Data       []models.Founder `json:"data"`
	Pagination PageMeta         `json:"pagination"`
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
