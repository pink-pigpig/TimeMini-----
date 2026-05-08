package db

import (
	"fmt"
	"os"
	"timemini/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase() error {
	userDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	dbDir := userDir + "/.timemini"
	os.MkdirAll(dbDir, 0755)

	dbPath := dbDir + "/timemini.db"

	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return err
	}

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
	if count > 0 {
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
	DB.Create(&purposes)
}

func GetDB() *gorm.DB {
	return DB
}

func init() {
	fmt.Println("[DB] Initializing database...")
}