package services

import (
	"timemini/db"
	"timemini/models"
)

type PurposeService struct{}

func NewPurposeService() *PurposeService {
	return &PurposeService{}
}

func (s *PurposeService) GetAllPurposes() ([]models.Purpose, error) {
	var purposes []models.Purpose
	err := db.GetDB().Order("is_default DESC, id ASC").Find(&purposes).Error
	return purposes, err
}

func (s *PurposeService) CreatePurpose(name, color, icon string) (*models.Purpose, error) {
	purpose := models.Purpose{
		Name:      name,
		Color:     color,
		Icon:      icon,
		IsDefault: false,
	}

	if err := db.GetDB().Create(&purpose).Error; err != nil {
		return nil, err
	}

	return &purpose, nil
}

func (s *PurposeService) UpdatePurpose(id uint, name, color, icon string) (*models.Purpose, error) {
	var purpose models.Purpose
	if err := db.GetDB().First(&purpose, id).Error; err != nil {
		return nil, err
	}

	purpose.Name = name
	purpose.Color = color
	purpose.Icon = icon

	if err := db.GetDB().Save(&purpose).Error; err != nil {
		return nil, err
	}

	return &purpose, nil
}

func (s *PurposeService) DeletePurpose(id uint) error {
	var purpose models.Purpose
	if err := db.GetDB().First(&purpose, id).Error; err != nil {
		return err
	}

	if purpose.IsDefault {
		return nil
	}

	return db.GetDB().Delete(&purpose, id).Error
}