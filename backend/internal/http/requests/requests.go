package requests

import "time"

// Auth
type AuthRegisterRequest struct {
	// Email address of the user
	Email string `json:"email" example:"john@doe.tld" format:"email"`
	// Full name to display
	Name string `json:"name" example:"John Doe"`
	// Account role
	Role string `json:"role" enums:"investor,founder" example:"founder"`
	// Plain password (min 6 chars)
	Password string `json:"password" example:"secret123"`
	// Optional profile image URL
	ImageURL *string `json:"image_url,omitempty" example:"https://cdn.example.com/avatars/john.png" format:"uri"`
	// Optional associated founder profile ID
	FounderID *uint64 `json:"founder_id,omitempty" example:"1"`
	// Optional associated investor profile ID
	InvestorID *uint64 `json:"investor_id,omitempty" example:"2"`
}

type AuthLoginRequest struct {
	// Email address
	Email string `json:"email" example:"john@doe.tld" format:"email"`
	// Password
	Password string `json:"password" example:"secret123"`
}

type AuthRefreshRequest struct {
	// Optional refresh token (normally sent via HttpOnly cookie)
	RefreshToken string `json:"refresh_token,omitempty" example:"<jwt>"`
}

type AuthVerifyRequest struct {
	// One-time verification token
	Token string `json:"token" example:"<verify-token>"`
}

type AuthForgotPasswordRequest struct {
	// Account email to send reset instructions
	Email string `json:"email" example:"john@doe.tld" format:"email"`
}

type AuthResetPasswordRequest struct {
	// Password reset token
	Token string `json:"token" example:"<reset-token>"`
	// New password to set
	NewPassword string `json:"new_password" example:"secret123"`
}

// Users
type UserCreateRequest struct {
	// Email address
	Email string `form:"email" json:"email" binding:"required,email" example:"jane@doe.tld" format:"email"`
	// Display name
	Name string `form:"name" json:"name" binding:"required" example:"Jane"`
	// Role to assign
	Role string `form:"role" json:"role" binding:"required" enums:"admin,user,investor,founder" example:"admin"`
	// Initial password
	Password string `form:"password" json:"password" binding:"required,min=6" example:"secret123"`
	// Avatar image file (binary upload)
	Image string `form:"image" json:"image,omitempty" format:"binary" swagger:"desc(Avatar image file to upload)"`
}

type UserUpdateRequest struct {
	// New email address
	Email *string `form:"email" json:"email,omitempty" example:"jane@newmail.tld" format:"email"`
	// New display name
	Name *string `form:"name" json:"name,omitempty" example:"Jane Doe"`
	// New role
	Role *string `form:"role" json:"role,omitempty" enums:"admin,user,investor,founder" example:"user"`
	// New password
	Password *string `form:"password" json:"password,omitempty" example:"newSecret123"`
	// New avatar image file (binary upload)
	Image string `form:"image" json:"image,omitempty" format:"binary" swagger:"desc(New avatar image file to upload)"`
}

// Startups
type StartupCreateRequest struct {
	// Startup name
	Name string `json:"name" example:"Acme"`
	// Contact email
	Email *string `json:"email,omitempty" example:"contact@acme.tld" format:"email"`
	// Business sector
	Sector *string `json:"sector,omitempty" enums:"tech,health,finance" example:"tech"`
	// Maturity stage
	Maturity *string `json:"maturity,omitempty" enums:"early,middle,late" example:"early"`
	// Project status
	ProjectStatus *string `json:"project_status,omitempty" enums:"ongoing,completed" example:"ongoing"`
	// Short description
	Description *string `json:"description,omitempty" example:"AI platform for SMBs"`
}

type StartupUpdateRequest struct {
	// New name
	Name *string `json:"name,omitempty" example:"Acme Corp"`
	// New contact email
	Email *string `json:"email,omitempty" example:"hello@acme.tld" format:"email"`
	// New sector
	Sector *string `json:"sector,omitempty" enums:"tech,health,finance" example:"tech"`
	// New maturity
	Maturity *string `json:"maturity,omitempty" enums:"early,middle,late" example:"middle"`
	// New project status
	ProjectStatus *string `json:"project_status,omitempty" enums:"ongoing,completed" example:"completed"`
	// New description
	Description *string `json:"description,omitempty" example:"Updated description"`
}

// Investors
type InvestorCreateRequest struct {
	// Investor legal name
	Name string `json:"name" example:"VC Alpha"`
	// Legal status
	LegalStatus *string `json:"legal_status,omitempty" example:"SAS"`
	// Mailing address
	Address *string `json:"address,omitempty" example:"21 Jump Street, Paris"`
	// Contact email
	Email string `json:"email,omitempty" example:"contact@vcalpha.tld" format:"email"`
	// Contact phone
	Phone *string `json:"phone,omitempty" example:"+33 1 23 45 67 89"`
	// Short description
	Description *string `json:"description,omitempty" example:"Early-stage VC"`
	// Type (e.g., VC, CVC, angel)
	InvestorType *string `json:"investor_type,omitempty" example:"VC"`
	// Investment focus (industries, stages)
	InvestmentFocus *string `json:"investment_focus,omitempty" example:"Seed, Series A"`
}

type InvestorUpdateRequest struct {
	// New legal name
	Name *string `json:"name,omitempty" example:"VC Alpha"`
	// New legal status
	LegalStatus *string `json:"legal_status,omitempty" example:"SAS"`
	// New address
	Address *string `json:"address,omitempty" example:"21 Jump Street, Paris"`
	// New contact email
	Email *string `json:"email,omitempty" example:"new@vcalpha.tld" format:"email"`
	// New phone
	Phone *string `json:"phone,omitempty" example:"+33 1 23 45 67 89"`
	// New description
	Description *string `json:"description,omitempty" example:"New description"`
	// New type
	InvestorType *string `json:"investor_type,omitempty" example:"CVC"`
	// New investment focus
	InvestmentFocus *string `json:"investment_focus,omitempty" example:"Fintech, AI"`
}

// News
type NewsCreateRequest struct {
	// News title
	Title string `form:"title" json:"title" binding:"required" example:"Funding round"`
	// Publication date (YYYY-MM-DD)
	NewsDate *string `form:"news_date" json:"news_date,omitempty" example:"2025-09-01" format:"date"`
	// Location (if relevant)
	Location *string `form:"location" json:"location,omitempty" example:"Paris"`
	// Category or topic
	Category *string `form:"category" json:"category,omitempty" example:"startup"`
	// Related startup ID
	StartupID *uint64 `form:"startup_id" json:"startup_id,omitempty" example:"1"`
	// Body text
	Description string `form:"description" json:"description" binding:"required" example:"Series A raised"`
	// Image file (binary upload)
	Image string `form:"image" json:"image,omitempty" format:"binary" swagger:"desc(Image file to upload)"`
}

type NewsUpdateRequest struct {
	// New title
	Title *string `form:"title" json:"title,omitempty" example:"Updated title"`
	// New publication date
	NewsDate *string `form:"news_date" json:"news_date,omitempty" example:"2025-09-02" format:"date"`
	// New location
	Location *string `form:"location" json:"location,omitempty" example:"Lyon"`
	// New category
	Category *string `form:"category" json:"category,omitempty" example:"event"`
	// New related startup
	StartupID *uint64 `form:"startup_id" json:"startup_id,omitempty" example:"2"`
	// New body text
	Description *string `form:"description" json:"description,omitempty" example:"Updated description"`
	// New image file (binary upload)
	Image string `form:"image" json:"image,omitempty" format:"binary" swagger:"desc(New image file to upload)"`
}

// Events
type EventCreateRequest struct {
	// Event name
	Name string `json:"name" example:"Conf 2025"`
	// Short description
	Description *string `json:"description,omitempty" example:"Annual conference"`
	// Type (conference, meetup, ...)
	EventType *string `json:"event_type,omitempty" example:"conference"`
	// Venue or city
	Location *string `json:"location,omitempty" example:"Paris"`
	// Intended audience
	TargetAudience *string `json:"target_audience,omitempty" example:"Startups"`
	// Start date/time (RFC3339)
	StartDate *time.Time `json:"start_date,omitempty" format:"date-time"`
	// End date/time (RFC3339)
	EndDate *time.Time `json:"end_date,omitempty" format:"date-time"`
	// Capacity (seats)
	Capacity *int `json:"capacity,omitempty" example:"300"`
	// Image URL
	ImageURL *string `json:"image_url,omitempty" example:"https://cdn.example.com/events/1.png" format:"uri"`
}

type EventUpdateRequest struct {
	// New name
	Name *string `json:"name,omitempty" example:"Conf 2025"`
	// New description
	Description *string `json:"description,omitempty" example:"Updated agenda"`
	// New type
	EventType *string `json:"event_type,omitempty" example:"meetup"`
	// New location
	Location *string `json:"location,omitempty" example:"Lille"`
	// New target audience
	TargetAudience *string `json:"target_audience,omitempty" example:"Developers"`
	// New start date/time
	StartDate *time.Time `json:"start_date,omitempty" format:"date-time"`
	// New end date/time
	EndDate *time.Time `json:"end_date,omitempty" format:"date-time"`
	// New capacity
	Capacity *int `json:"capacity,omitempty" example:"350"`
	// New image URL
	ImageURL *string `json:"image_url,omitempty" example:"https://cdn.example.com/events/2.png" format:"uri"`
}

// Opportunities
type OpportunityCreateRequest struct {
	// Opportunity title
	Title string `json:"title" example:"AI Grant"`
	// Opportunity type (grant, contest, ...)
	Type string `json:"type" example:"grant"`
	// Issuing organization
	Organism string `json:"organism" example:"EU"`
	// Short description
	Description *string `json:"description,omitempty" example:"Funding for AI research"`
	// Eligibility criteria
	Criteria *string `json:"criteria,omitempty" example:"Student or Startup < 3 years"`
	// External reference URL
	ExternalLink *string `json:"external_link,omitempty" example:"https://example.com/grant" format:"uri"`
	// Deadline (RFC3339)
	Deadline *time.Time `json:"deadline,omitempty" format:"date-time"`
}

type OpportunityUpdateRequest struct {
	// New title
	Title *string `json:"title,omitempty" example:"AI Grant"`
	// New type
	Type *string `json:"type,omitempty" example:"contest"`
	// New organism
	Organism *string `json:"organism,omitempty" example:"EU"`
	// New description
	Description *string `json:"description,omitempty" example:"Updated description"`
	// New criteria
	Criteria *string `json:"criteria,omitempty" example:"New criteria"`
	// New external link
	ExternalLink *string `json:"external_link,omitempty" example:"https://example.com/opportunity" format:"uri"`
	// New deadline
	Deadline *time.Time `json:"deadline,omitempty" format:"date-time"`
}

// Partners
type PartnerCreateRequest struct {
	// Partner legal name
	Name string `json:"name" example:"ACME Corp"`
	// Legal status
	LegalStatus *string `json:"legal_status,omitempty" example:"SAS"`
	// Mailing address
	Address *string `json:"address,omitempty" example:"5 Avenue Anatole France, Paris"`
	// Contact email
	Email string `json:"email" example:"partners@acme.tld" format:"email"`
	// Contact phone
	Phone *string `json:"phone,omitempty" example:"+33 1 23 45 67 89"`
	// Partnership inception date/time
	CreatedAt *time.Time `json:"created_at,omitempty" format:"date-time"`
	// Short description
	Description *string `json:"description,omitempty" example:"Long-term sponsor"`
	// Type of partnership
	PartnershipType *string `json:"partnership_type,omitempty" example:"sponsor"`
}

type PartnerUpdateRequest struct {
	// New legal name
	Name *string `json:"name,omitempty" example:"ACME Corp"`
	// New legal status
	LegalStatus *string `json:"legal_status,omitempty" example:"SASU"`
	// New address
	Address *string `json:"address,omitempty" example:"10 Rue de Rivoli, Paris"`
	// New contact email
	Email *string `json:"email,omitempty" example:"partner@acme.tld" format:"email"`
	// New phone
	Phone *string `json:"phone,omitempty" example:"+33 6 12 34 56 78"`
	// New creation timestamp
	CreatedAt *time.Time `json:"created_at,omitempty" format:"date-time"`
	// New description
	Description *string `json:"description,omitempty" example:"Updated description"`
	// New partnership type
	PartnershipType *string `json:"partnership_type,omitempty" example:"institutional"`
}

type ConversationCreateRequest struct {
	// Participant user IDs
	ParticipantIDs []uint64 `json:"participant_ids" binding:"required,min=1" example:"[1,2,3]"`
	// Optional conversation title
	Title *string `json:"title,omitempty" example:"Project Discussion"`
	// Whether this is a group conversation
	IsGroup bool `json:"is_group" example:"false"`
}

type MessageSendRequest struct {
	// Message content
	Content string `json:"content" binding:"required,max=2000" example:"Hello, how are you?"`
}

type MessageMarkReadRequest struct {
	// Message ID to mark as read
	MessageID uint64 `json:"message_id" binding:"required" example:"1"`
}
