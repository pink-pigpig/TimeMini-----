package db

import (
	"fmt"
	"os"
	"path/filepath"
	"timemini/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase() error {
	userDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	dbDir := filepath.Join(userDir, ".timemini")
	err = os.MkdirAll(dbDir, 0755)
	if err != nil {
		return err
	}

	dbPath := filepath.Join(dbDir, "timemini.db")
	fmt.Println("[DB] Database path:", dbPath)

	// Also log to a file
	logFile, _ := os.Create(filepath.Join(dbDir, "debug.log"))
	logFile.WriteString(fmt.Sprintf("[DB] Database path: %s\n", dbPath))

	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		fmt.Println("[DB] Failed to open database:", err)
		logFile.WriteString(fmt.Sprintf("[DB] Failed to open database: %v\n", err))
		logFile.Close()
		return err
	}
	fmt.Println("[DB] Database opened successfully")
	logFile.WriteString("[DB] Database opened successfully\n")
	logFile.Close()

	err = DB.AutoMigrate(
		&models.TimerRecord{},
		&models.Todo{},
		&models.Purpose{},
	)
	if err != nil {
		return err
	}

	seedPurposes()

	return nil
}

func seedPurposes() {
	var count int64
	DB.Model(&models.Purpose{}).Count(&count)
	fmt.Println("[DB] Current purpose count:", count)
	
	// Also log to file
	if userDir, err := os.UserHomeDir(); err == nil {
		if logFile, err := os.OpenFile(filepath.Join(userDir, ".timemini", "debug.log"), os.O_APPEND|os.O_CREATE, 0644); err == nil {
			logFile.WriteString(fmt.Sprintf("[DB] Current purpose count: %d\n", count))
			logFile.Close()
		}
	}
	
	if count > 0 {
		fmt.Println("[DB] Purposes already exist, skipping seed")
		return
	}

	purposes := []models.Purpose{
		{Name: "学习", Color: "#1890ff", Icon: "book", IsDefault: true},
		{Name: "码字", Color: "#52c41a", Icon: "edit", IsDefault: true},
		{Name: "编程", Color: "#722ed1", Icon: "code", IsDefault: true},
		{Name: "运动", Color: "#fa8c16", Icon: "run", IsDefault: true},
		{Name: "休息", Color: "#eb2f96", Icon: "coffee", IsDefault: true},
		{Name: "其他", Color: "#8c8c8c", Icon: "star", IsDefault: true},
	}
	result := DB.Create(&purposes)
	if result.Error != nil {
		fmt.Println("[DB] Failed to seed purposes:", result.Error)
	} else {
		fmt.Println("[DB] Successfully seeded", len(purposes), "purposes")
		if userDir, err := os.UserHomeDir(); err == nil {
			if logFile, err := os.OpenFile(filepath.Join(userDir, ".timemini", "debug.log"), os.O_APPEND|os.O_CREATE, 0644); err == nil {
				logFile.WriteString(fmt.Sprintf("[DB] Successfully seeded %d purposes\n", len(purposes)))
				logFile.Close()
			}
		}
	}
}

func GetDB() *gorm.DB {
	return DB
}

func init() {
	fmt.Println("[DB] Initializing database...")
}