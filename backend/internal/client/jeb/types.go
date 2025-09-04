package jeb

// StartupList corresponds to the list item schema of the API.
type StartupList struct {
	ID       int64   `json:"id"`
	Name     string  `json:"name"`
	Legal    *string `json:"legal_status"`
	Address  *string `json:"address"`
	Email    string  `json:"email"`
	Phone    *string `json:"phone"`
	Sector   *string `json:"sector"`
	Maturity *string `json:"maturity"`
}

// StartupDetail corresponds to the detailed startup schema.
type StartupDetail struct {
	ID             int64     `json:"id"`
	Name           string    `json:"name"`
	LegalStatus    *string   `json:"legal_status"`
	Address        *string   `json:"address"`
	Email          string    `json:"email"`
	Phone          *string   `json:"phone"`
	CreatedAt      *string   `json:"created_at"`
	Description    *string   `json:"description"`
	WebsiteURL     *string   `json:"website_url"`
	SocialMediaURL *string   `json:"social_media_url"`
	ProjectStatus  *string   `json:"project_status"`
	Needs          *string   `json:"needs"`
	Sector         *string   `json:"sector"`
	Maturity       *string   `json:"maturity"`
	Founders       []Founder `json:"founders"`
}

type Founder struct {
	ID        int64  `json:"id"`
	StartupID int64  `json:"startup_id"`
	Name      string `json:"name"`
}

// NewsList corresponds to the list item schema of the API for news.
type NewsList struct {
	ID        int64   `json:"id"`
	Title     string  `json:"title"`
	NewsDate  *string `json:"news_date"`
	Location  *string `json:"location"`
	Category  *string `json:"category"`
	StartupID *int64  `json:"startup_id"`
}

// NewsDetail corresponds to the detailed news schema.
type NewsDetail struct {
	ID          int64   `json:"id"`
	Title       string  `json:"title"`
	NewsDate    *string `json:"news_date"`
	Location    *string `json:"location"`
	Category    *string `json:"category"`
	StartupID   *int64  `json:"startup_id"`
	Description string  `json:"description"`
}

// Event corresponds to Event schema exposed by JEB for both list and detail.
type Event struct {
	ID             int64   `json:"id"`
	Name           string  `json:"name"`
	Dates          *string `json:"dates"`
	Location       *string `json:"location"`
	Description    *string `json:"description"`
	EventType      *string `json:"event_type"`
	TargetAudience *string `json:"target_audience"`
}

// User corresponds to the user schema exposed by JEB.
type User struct {
	ID         int64  `json:"id"`
	Email      string `json:"email"`
	Name       string `json:"name"`
	Role       string `json:"role"`
	FounderID  *int64 `json:"founder_id"`
	InvestorID *int64 `json:"investor_id"`
}
