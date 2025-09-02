package models

import "time"

type Opportunity struct {
	ID           uint       `json:"id" gorm:"primarykey"`
	Title        string     `json:"title" gorm:"type:varchar(255);not null"`
	Type         string     `json:"type" gorm:"type:varchar(100);not null;index:idx_opportunities_type"`
	Organism     string     `json:"organism" gorm:"type:varchar(255);not null"`
	Description  *string    `json:"description,omitempty" gorm:"type:text"`
	Criteria     *string    `json:"criteria,omitempty" gorm:"type:text"`
	ExternalLink *string    `json:"external_link,omitempty" gorm:"type:varchar(500)"`
	Deadline     *time.Time `json:"deadline,omitempty" gorm:"index:idx_opportunities_deadline"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
