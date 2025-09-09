package response

import (
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
)

type MessageResponse struct {
	Message string `json:"message"`
}

type ImageURLResponse struct {
	ImageURL string `json:"image_url"`
}

type AuthRegisterResponse struct {
	User    models.User `json:"user"`
	Message string      `json:"message"`
}

type AuthLoginResponse struct {
	User models.User `json:"user"`
}
type SyncStatusResponse struct {
	Running  bool       `json:"running"`
	Queue    int        `json:"queue"`
	LastFull *time.Time `json:"lastFull,omitempty"`
	LastInc  *time.Time `json:"lastInc,omitempty"`
}

type OpportunityObjectResponse struct {
	Data models.Opportunity `json:"data"`
}
type OpportunityListResponse struct {
	Data       []models.Opportunity `json:"data"`
	Pagination PageMeta             `json:"pagination"`
}

type EventObjectResponse struct {
	Data models.Event `json:"data"`
}
type EventListResponse struct {
	Data       []models.Event `json:"data"`
	Pagination PageMeta       `json:"pagination"`
}

type NewsObjectResponse struct {
	Data models.News `json:"data"`
}
type NewsListResponse struct {
	Data       []models.News `json:"data"`
	Pagination PageMeta      `json:"pagination"`
}

type PartnerObjectResponse struct {
	Data models.Partner `json:"data"`
}
type PartnerListResponse struct {
	Data       []models.Partner `json:"data"`
	Pagination PageMeta         `json:"pagination"`
}

type InvestorObjectResponse struct {
	Data models.Investor `json:"data"`
}
type InvestorListResponse struct {
	Data       []models.Investor `json:"data"`
	Pagination PageMeta          `json:"pagination"`
}

type StartupObjectResponse struct {
	Data models.Startup `json:"data"`
}
type StartupListResponse struct {
	Data       []models.Startup `json:"data"`
	Pagination PageMeta         `json:"pagination"`
}

type UserObjectResponse struct {
	Data models.User `json:"data"`
}
type UserListResponse struct {
	Data       []models.User `json:"data"`
	Pagination PageMeta      `json:"pagination"`
}
