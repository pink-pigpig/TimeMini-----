package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"timemini/db"
	"timemini/models"
	"timemini/services"
)

type App struct {
	ctx           context.Context
	timerService  *services.TimerService
	statsService  *services.StatisticsService
	todoService   *services.TodoService
	purposeService *services.PurposeService
}

func NewApp() *App {
	return &App{
		timerService:   services.NewTimerService(),
		statsService:   services.NewStatisticsService(),
		todoService:    services.NewTodoService(),
		purposeService: services.NewPurposeService(),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	fmt.Println("[App] Starting TimeMini...")

	// Try to initialize database with error logging
	err := db.InitDatabase()
	if err != nil {
		errMsg := fmt.Sprintf("[App] Database init failed: %v", err)
		fmt.Println(errMsg)
		// Try to write to a log file
		if userDir, err := os.UserHomeDir(); err == nil {
			logPath := filepath.Join(userDir, "timemini_error.log")
			if f, err := os.Create(logPath); err == nil {
				f.WriteString(errMsg)
				f.Close()
			}
		}
	} else {
		fmt.Println("[App] Database initialized successfully")
	}
}

func (a *App) shutdown(ctx context.Context) {
	fmt.Println("[App] Shutting down TimeMini...")
}

// Timer APIs
func (a *App) StartTimer(req models.TimerRequest) *models.TimerResponse {
	record, err := a.timerService.StartTimer(req)
	if err != nil {
		return &models.TimerResponse{Success: false, Message: err.Error()}
	}
	return &models.TimerResponse{Success: true, Message: "Timer started", Record: record}
}

func (a *App) StopTimer(id uint) *models.TimerResponse {
	record, err := a.timerService.StopTimer(id)
	if err != nil {
		return &models.TimerResponse{Success: false, Message: err.Error()}
	}
	return &models.TimerResponse{Success: true, Message: "Timer stopped", Record: record}
}

func (a *App) GetActiveTimer() *models.TimerResponse {
	record, err := a.timerService.GetActiveTimer()
	if err != nil {
		return &models.TimerResponse{Success: false, Message: err.Error()}
	}
	if record == nil {
		return &models.TimerResponse{Success: true, Message: "No active timer", Record: nil}
	}
	return &models.TimerResponse{Success: true, Message: "Active timer found", Record: record}
}

func (a *App) GetTodayRecords() *struct {
	Success bool
	Records []models.TimerRecord
} {
	records, err := a.timerService.GetTodayRecords()
	if err != nil {
		return &struct {
			Success bool
			Records []models.TimerRecord
		}{Success: false, Records: nil}
	}
	return &struct {
		Success bool
		Records []models.TimerRecord
	}{Success: true, Records: records}
}

// Statistics APIs
func (a *App) GetStatistics(period string) *struct {
	Success    bool
	Stats      *models.Statistics
	Formatted  string
} {
	stats, err := a.statsService.GetStatistics(period)
	if err != nil {
		return &struct {
			Success    bool
			Stats      *models.Statistics
			Formatted  string
		}{Success: false, Stats: nil, Formatted: ""}
	}
	formatted := a.statsService.FormatDuration(stats.TotalDuration)
	return &struct {
		Success    bool
		Stats      *models.Statistics
		Formatted  string
	}{Success: true, Stats: stats, Formatted: formatted}
}

// Todo APIs
func (a *App) CreateTodo(req models.TodoRequest) *models.TodoResponse {
	todo, err := a.todoService.CreateTodo(req)
	if err != nil {
		return &models.TodoResponse{Success: false, Message: err.Error()}
	}
	return &models.TodoResponse{Success: true, Message: "Todo created", Todo: todo}
}

func (a *App) GetAllTodos() *struct {
	Success bool
	Todos   []models.Todo
} {
	todos, err := a.todoService.GetAllTodos()
	if err != nil {
		return &struct {
			Success bool
			Todos   []models.Todo
		}{Success: false, Todos: nil}
	}
	return &struct {
		Success bool
		Todos   []models.Todo
	}{Success: true, Todos: todos}
}

func (a *App) GetTodosByStatus(status string) *struct {
	Success bool
	Todos   []models.Todo
} {
	todos, err := a.todoService.GetTodosByStatus(status)
	if err != nil {
		return &struct {
			Success bool
			Todos   []models.Todo
		}{Success: false, Todos: nil}
	}
	return &struct {
		Success bool
		Todos   []models.Todo
	}{Success: true, Todos: todos}
}

func (a *App) UpdateTodo(id uint, req models.TodoRequest) *models.TodoResponse {
	todo, err := a.todoService.UpdateTodo(id, req)
	if err != nil {
		return &models.TodoResponse{Success: false, Message: err.Error()}
	}
	return &models.TodoResponse{Success: true, Message: "Todo updated", Todo: todo}
}

func (a *App) CompleteTodo(id uint) *models.TodoResponse {
	todo, err := a.todoService.CompleteTodo(id)
	if err != nil {
		return &models.TodoResponse{Success: false, Message: err.Error()}
	}
	return &models.TodoResponse{Success: true, Message: "Todo completed", Todo: todo}
}

func (a *App) StartTodo(id uint) *models.TodoResponse {
	todo, err := a.todoService.StartTodo(id)
	if err != nil {
		return &models.TodoResponse{Success: false, Message: err.Error()}
	}
	return &models.TodoResponse{Success: true, Message: "Todo started", Todo: todo}
}

func (a *App) DeleteTodo(id uint) *struct {
	Success bool
	Message string
} {
	err := a.todoService.DeleteTodo(id)
	if err != nil {
		return &struct {
			Success bool
			Message string
		}{Success: false, Message: err.Error()}
	}
	return &struct {
		Success bool
		Message string
	}{Success: true, Message: "Todo deleted"}
}

// Purpose APIs
func (a *App) GetAllPurposes() *struct {
	Success   bool
	Purposes  []models.Purpose
} {
	purposes, err := a.purposeService.GetAllPurposes()
	if err != nil {
		return &struct {
			Success   bool
			Purposes  []models.Purpose
		}{Success: false, Purposes: nil}
	}
	return &struct {
		Success   bool
		Purposes  []models.Purpose
	}{Success: true, Purposes: purposes}
}

func (a *App) CreatePurpose(name, color, icon string) *struct {
	Success  bool
	Message  string
	Purpose  *models.Purpose
} {
	purpose, err := a.purposeService.CreatePurpose(name, color, icon)
	if err != nil {
		return &struct {
			Success  bool
			Message  string
			Purpose  *models.Purpose
		}{Success: false, Message: err.Error(), Purpose: nil}
	}
	return &struct {
		Success  bool
		Message  string
		Purpose  *models.Purpose
	}{Success: true, Message: "Purpose created", Purpose: purpose}
}

func (a *App) DeletePurpose(id uint) *struct {
	Success bool
	Message string
} {
	err := a.purposeService.DeletePurpose(id)
	if err != nil {
		return &struct {
			Success bool
			Message string
		}{Success: false, Message: err.Error()}
	}
	return &struct {
		Success bool
		Message string
	}{Success: true, Message: "Purpose deleted"}
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}