package opportunities

import (
	"net/http"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/http/pagination"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Opportunity struct {
	ID           uint           `json:"id" gorm:"primarykey"`
	Title        string         `json:"title" gorm:"type:varchar(255);not null"`
	Type         string         `json:"type" gorm:"type:varchar(100);not null;index:idx_opportunities_type"`
	Organism     string         `json:"organism" gorm:"type:varchar(255);not null"`
	Description  *string        `json:"description,omitempty" gorm:"type:text"`
	Criteria     *string        `json:"criteria,omitempty" gorm:"type:text"`
	ExternalLink *string        `json:"external_link,omitempty" gorm:"type:varchar(500)"`
	Deadline     *time.Time     `json:"deadline,omitempty" gorm:"index:idx_opportunities_deadline"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type OpportunityHandler struct {
	cfg *config.Config
}

func NewOpportunityHandler(cfg *config.Config) *OpportunityHandler {
	return &OpportunityHandler{
		cfg: cfg,
	}
}

func (h *OpportunityHandler) getAllOpportunitiesData() []Opportunity {
	// Même données que dans GetOpportunities
	desc1 := "Stage de 6 mois en développement web avec React et Node.js"
	criteria1 := "Étudiant en informatique, niveau Bac+3"
	link1 := "https://techcorp.com/careers/stage-dev"
	deadline1 := time.Date(2024, 12, 31, 23, 59, 0, 0, time.UTC)

	desc2 := "Emploi de développeur backend senior avec Go et PostgreSQL"
	criteria2 := "5 ans d'expérience minimum en Go"
	link2 := "https://gocompany.com/jobs/backend-senior"
	deadline2 := time.Date(2024, 11, 15, 23, 59, 0, 0, time.UTC)

	desc3 := "Stage en data science et machine learning"
	criteria3 := "Master en mathématiques ou statistiques"
	link3 := "https://datalab.io/internships/data-scientist"
	deadline3 := time.Date(2024, 10, 30, 23, 59, 0, 0, time.UTC)

	desc4 := "Développeur frontend React/TypeScript"
	link4 := "https://frontend-co.com/jobs/react-dev"
	deadline4 := time.Date(2024, 12, 15, 23, 59, 0, 0, time.UTC)

	desc5 := "Stage DevOps avec Docker et Kubernetes"
	criteria5 := "Connaissance de base en containerisation"
	link5 := "https://cloudtech.com/internship/devops"

	desc6 := "Développeur mobile Flutter"
	criteria6 := "2 ans d'expérience en développement mobile"
	link6 := "https://mobileapp.com/jobs/flutter-dev"
	deadline6 := time.Date(2025, 1, 31, 23, 59, 0, 0, time.UTC)

	desc7 := "Stage en cybersécurité"
	criteria7 := "Étudiant en sécurité informatique"
	link7 := "https://securetech.com/internships/cyber"
	deadline7 := time.Date(2024, 11, 30, 23, 59, 0, 0, time.UTC)

	desc8 := "Architecte solutions cloud AWS"
	criteria8 := "Certification AWS Solutions Architect"
	link8 := "https://cloudpro.com/jobs/architect"

	desc9 := "Stage UX/UI Designer"
	criteria9 := "Portfolio requis, connaissance Figma"
	link9 := "https://designstudio.com/internships/ux-ui"
	deadline9 := time.Date(2024, 10, 15, 23, 59, 0, 0, time.UTC)

	desc10 := "Chef de projet technique"
	criteria10 := "3 ans d'expérience en gestion de projet IT"
	link10 := "https://projectmanagement.com/jobs/tech-lead"
	deadline10 := time.Date(2025, 2, 28, 23, 59, 0, 0, time.UTC)

	return []Opportunity{
		{
			ID: 1, Title: "Stage Développeur Web", Type: "internship", Organism: "TechCorp",
			Description: &desc1, Criteria: &criteria1, ExternalLink: &link1, Deadline: &deadline1,
			CreatedAt: time.Date(2024, 1, 15, 10, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2024, 1, 20, 14, 30, 0, 0, time.UTC),
		},
		{
			ID: 2, Title: "Développeur Backend Senior", Type: "job", Organism: "GoCompany",
			Description: &desc2, Criteria: &criteria2, ExternalLink: &link2, Deadline: &deadline2,
			CreatedAt: time.Date(2024, 1, 10, 9, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2024, 1, 18, 16, 0, 0, 0, time.UTC),
		},
		{
			ID: 3, Title: "Stage Data Scientist", Type: "internship", Organism: "DataLab",
			Description: &desc3, Criteria: &criteria3, ExternalLink: &link3, Deadline: &deadline3,
			CreatedAt: time.Date(2024, 1, 5, 11, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2024, 1, 22, 13, 15, 0, 0, time.UTC),
		},
		{
			ID: 4, Title: "Développeur Frontend React", Type: "job", Organism: "FrontendCo",
			Description: &desc4, ExternalLink: &link4, Deadline: &deadline4,
			CreatedAt: time.Date(2024, 1, 8, 8, 30, 0, 0, time.UTC),
			UpdatedAt: time.Date(2024, 1, 25, 12, 0, 0, 0, time.UTC),
		},
		{
			ID: 5, Title: "Stage DevOps", Type: "internship", Organism: "CloudTech",
			Description: &desc5, Criteria: &criteria5, ExternalLink: &link5,
			CreatedAt: time.Date(2024, 1, 12, 14, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2024, 1, 28, 10, 45, 0, 0, time.UTC),
		},
		{
			ID: 6, Title: "Développeur Mobile Flutter", Type: "job", Organism: "MobileApp Inc",
			Description: &desc6, Criteria: &criteria6, ExternalLink: &link6, Deadline: &deadline6,
			CreatedAt: time.Date(2024, 1, 3, 15, 30, 0, 0, time.UTC),
			UpdatedAt: time.Date(2024, 1, 19, 11, 20, 0, 0, time.UTC),
		},
		{
			ID: 7, Title: "Stage Cybersécurité", Type: "internship", Organism: "SecureTech",
			Description: &desc7, Criteria: &criteria7, ExternalLink: &link7, Deadline: &deadline7,
			CreatedAt: time.Date(2024, 1, 7, 13, 15, 0, 0, time.UTC),
			UpdatedAt: time.Date(2024, 1, 21, 9, 30, 0, 0, time.UTC),
		},
		{
			ID: 8, Title: "Architecte Solutions Cloud", Type: "job", Organism: "CloudPro",
			Description: &desc8, Criteria: &criteria8, ExternalLink: &link8,
			CreatedAt: time.Date(2024, 1, 14, 16, 45, 0, 0, time.UTC),
			UpdatedAt: time.Date(2024, 1, 26, 14, 10, 0, 0, time.UTC),
		},
		{
			ID: 9, Title: "Stage UX/UI Designer", Type: "internship", Organism: "Design Studio",
			Description: &desc9, Criteria: &criteria9, ExternalLink: &link9, Deadline: &deadline9,
			CreatedAt: time.Date(2024, 1, 2, 10, 20, 0, 0, time.UTC),
			UpdatedAt: time.Date(2024, 1, 17, 15, 50, 0, 0, time.UTC),
		},
		{
			ID: 10, Title: "Chef de Projet Technique", Type: "job", Organism: "PM Solutions",
			Description: &desc10, Criteria: &criteria10, ExternalLink: &link10, Deadline: &deadline10,
			CreatedAt: time.Date(2024, 1, 1, 12, 0, 0, 0, time.UTC),
			UpdatedAt: time.Date(2024, 1, 23, 17, 30, 0, 0, time.UTC),
		},
	}
}

// GetOpportunities handles HTTP GET requests for paginated opportunities data with optional sorting and ordering.
func (h *OpportunityHandler) GetOpportunities(c *gin.Context) {
	params := pagination.Parse(c)
	offset := (params.Page - 1) * params.PerPage

	allOpportunities := h.getAllOpportunitiesData()
	total := int64(len(allOpportunities))
	totalPages := (int(total) + params.PerPage - 1) / params.PerPage
	hasNext := params.Page < totalPages
	hasPrev := params.Page > 1

	startIndex := offset
	endIndex := offset + params.PerPage

	if startIndex >= len(allOpportunities) {
		startIndex = len(allOpportunities)
		endIndex = len(allOpportunities)
	} else if endIndex > len(allOpportunities) {
		endIndex = len(allOpportunities)
	}

	paginatedOpportunities := allOpportunities[startIndex:endIndex]

	response.JSON(c, http.StatusOK, gin.H{
		"data": paginatedOpportunities,
		"pagination": gin.H{
			"page":        params.Page,
			"per_page":    params.PerPage,
			"total":       total,
			"total_pages": totalPages,
			"has_next":    hasNext,
			"has_prev":    hasPrev,
		},
	})
}
