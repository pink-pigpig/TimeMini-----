package models

import (
	"time"

	"gorm.io/gorm"
)

type TimerRecord struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	PurposeID   uint      `json:"purpose_id"`
	PurposeName string    `json:"purpose_name"`
	Duration    int       `json:"duration"` // seconds
	StartTime   time.Time `json:"start_time"`
	EndTime     *time.Time `json:"end_time"`
	IsCompleted bool      `json:"is_completed"`
	CreatedAt   time.Time `json:"created_at"`
}

type Purpose struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Color     string    `json:"color"`
	Icon      string    `json:"icon"`
	IsDefault bool      `json:"is_default"`
	CreatedAt time.Time `json:"created_at"`
}

type Todo struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	PurposeID    uint       `json:"purpose_id"`
	PurposeName  string     `json:"purpose_name"`
	TimerDuration int       `json:"timer_duration"` // seconds, 0 means no timer
	Status       string     `json:"status"` // pending, in_progress, completed
	CompletedAt  *time.Time `json:"completed_at"`
	CreatedAt    time.Time  `json:"created_at"`
}

func (t *Todo) BeforeCreate(tx *gorm.DB) error {
	if t.Status == "" {
		t.Status = "pending"
	}
	return nil
}

type TimerRequest struct {
	PurposeID   uint `json:"purpose_id"`
	Duration    int  `json:"duration"` // seconds
	IsLoop      bool `json:"is_loop"`
	LoopCount   int  `json:"loop_count"`
}

type TimerResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Record  *TimerRecord `json:"record,omitempty"`
}

type Statistics struct {
	TotalDuration int                `json:"total_duration"` // seconds
	PurposeStats  map[string]int     `json:"purpose_stats"`  // purpose_name -> seconds
	DateStats     map[string]int     `json:"date_stats"`     // date -> seconds
	Records       []TimerRecord      `json:"records"`
}

type TodoRequest struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	PurposeID    uint   `json:"purpose_id"`
	TimerDuration int   `json:"timer_duration"`
}

type TodoResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Todo    *Todo  `json:"todo,omitempty"`
}