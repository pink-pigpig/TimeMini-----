package services

import (
	"time"
	"timemini/db"
	"timemini/models"
)

type TodoService struct{}

func NewTodoService() *TodoService {
	return &TodoService{}
}

func (s *TodoService) CreateTodo(req models.TodoRequest) (*models.Todo, error) {
	var purpose models.Purpose
	if err := db.GetDB().First(&purpose, req.PurposeID).Error; err != nil {
		if req.PurposeID == 0 {
			purpose = models.Purpose{Name: "其他", Color: "#8c8c8c", Icon: "star"}
		} else {
			return nil, err
		}
	}

	todo := models.Todo{
		Title:        req.Title,
		Description:  req.Description,
		PurposeID:    purpose.ID,
		PurposeName:  purpose.Name,
		TimerDuration: req.TimerDuration,
		Status:       "pending",
	}

	if err := db.GetDB().Create(&todo).Error; err != nil {
		return nil, err
	}

	return &todo, nil
}

func (s *TodoService) GetAllTodos() ([]models.Todo, error) {
	var todos []models.Todo
	err := db.GetDB().Order("created_at DESC").Find(&todos).Error
	return todos, err
}

func (s *TodoService) GetTodosByStatus(status string) ([]models.Todo, error) {
	var todos []models.Todo
	err := db.GetDB().Where("status = ?", status).Order("created_at DESC").Find(&todos).Error
	return todos, err
}

func (s *TodoService) UpdateTodo(id uint, req models.TodoRequest) (*models.Todo, error) {
	var todo models.Todo
	if err := db.GetDB().First(&todo, id).Error; err != nil {
		return nil, err
	}

	if req.Title != "" {
		todo.Title = req.Title
	}
	if req.Description != "" {
		todo.Description = req.Description
	}
	if req.PurposeID > 0 {
		var purpose models.Purpose
		if err := db.GetDB().First(&purpose, req.PurposeID).Error; err == nil {
			todo.PurposeID = purpose.ID
			todo.PurposeName = purpose.Name
		}
	}
	if req.TimerDuration > 0 {
		todo.TimerDuration = req.TimerDuration
	}

	if err := db.GetDB().Save(&todo).Error; err != nil {
		return nil, err
	}

	return &todo, nil
}

func (s *TodoService) CompleteTodo(id uint) (*models.Todo, error) {
	var todo models.Todo
	if err := db.GetDB().First(&todo, id).Error; err != nil {
		return nil, err
	}

	now := time.Now()
	todo.Status = "completed"
	todo.CompletedAt = &now

	if err := db.GetDB().Save(&todo).Error; err != nil {
		return nil, err
	}

	return &todo, nil
}

func (s *TodoService) StartTodo(id uint) (*models.Todo, error) {
	var todo models.Todo
	if err := db.GetDB().First(&todo, id).Error; err != nil {
		return nil, err
	}

	todo.Status = "in_progress"

	if err := db.GetDB().Save(&todo).Error; err != nil {
		return nil, err
	}

	return &todo, nil
}

func (s *TodoService) DeleteTodo(id uint) error {
	return db.GetDB().Delete(&models.Todo{}, id).Error
}

func (s *TodoService) GetPendingTodos() ([]models.Todo, error) {
	var todos []models.Todo
	err := db.GetDB().Where("status IN ?", []string{"pending", "in_progress"}).Order("created_at DESC").Find(&todos).Error
	return todos, err
}