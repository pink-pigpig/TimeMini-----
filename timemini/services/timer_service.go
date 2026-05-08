package services

import (
	"time"
	"timemini/db"
	"timemini/models"

	"gorm.io/gorm"
)

type TimerService struct{}

func NewTimerService() *TimerService {
	return &TimerService{}
}

func (s *TimerService) StartTimer(req models.TimerRequest) (*models.TimerRecord, error) {
	var purpose models.Purpose
	if err := db.GetDB().First(&purpose, req.PurposeID).Error; err != nil {
		if req.PurposeID == 0 {
			purpose = models.Purpose{Name: "其他", Color: "#8c8c8c", Icon: "star"}
		} else {
			return nil, err
		}
	}

	record := models.TimerRecord{
		PurposeID:   purpose.ID,
		PurposeName: purpose.Name,
		Duration:    req.Duration,
		StartTime:   time.Now(),
		IsCompleted: false,
	}

	if err := db.GetDB().Create(&record).Error; err != nil {
		return nil, err
	}

	return &record, nil
}

func (s *TimerService) StopTimer(id uint) (*models.TimerRecord, error) {
	var record models.TimerRecord
	if err := db.GetDB().First(&record, id).Error; err != nil {
		return nil, err
	}

	now := time.Now()
	record.EndTime = &now
	record.IsCompleted = true

	if err := db.GetDB().Save(&record).Error; err != nil {
		return nil, err
	}

	return &record, nil
}

func (s *TimerService) GetActiveTimer() (*models.TimerRecord, error) {
	var record models.TimerRecord
	err := db.GetDB().Where("is_completed = ?", false).Order("start_time DESC").First(&record).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &record, err
}

func (s *TimerService) GetTodayRecords() ([]models.TimerRecord, error) {
	startOfDay := time.Now().Truncate(24 * time.Hour)
	var records []models.TimerRecord
	err := db.GetDB().Where("start_time >= ? AND is_completed = ?", startOfDay, true).Find(&records).Error
	return records, err
}

func (s *TimerService) GetAllRecords() ([]models.TimerRecord, error) {
	var records []models.TimerRecord
	err := db.GetDB().Where("is_completed = ?", true).Order("start_time DESC").Find(&records).Error
	return records, err
}

func (s *TimerService) GetRecordsByDateRange(start, end time.Time) ([]models.TimerRecord, error) {
	var records []models.TimerRecord
	err := db.GetDB().Where("start_time >= ? AND start_time <= ? AND is_completed = ?", start, end, true).Find(&records).Error
	return records, err
}