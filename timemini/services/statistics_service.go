package services

import (
	"fmt"
	"time"
	"timemini/models"
)

type StatisticsService struct{}

func NewStatisticsService() *StatisticsService {
	return &StatisticsService{}
}

func (s *StatisticsService) GetStatistics(period string) (*models.Statistics, error) {
	now := time.Now()
	var start, end time.Time

	switch period {
	case "day":
		start = now.Truncate(24 * time.Hour)
		end = start.Add(24 * time.Hour)
	case "week":
		weekday := int(now.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		start = now.AddDate(0, 0, -(weekday - 1)).Truncate(24 * time.Hour)
		end = start.AddDate(0, 0, 7)
	case "month":
		start = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end = start.AddDate(0, 1, 0)
	case "year":
		start = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
		end = start.AddDate(1, 0, 0)
	case "all":
		start = time.Date(2020, 1, 1, 0, 0, 0, 0, now.Location())
		end = now.AddDate(10, 0, 0)
	default:
		start = now.Truncate(24 * time.Hour)
		end = start.Add(24 * time.Hour)
	}

	timerSvc := NewTimerService()
	records, err := timerSvc.GetRecordsByDateRange(start, end)
	if err != nil {
		return nil, err
	}

	stats := &models.Statistics{
		TotalDuration: 0,
		PurposeStats:  make(map[string]int),
		DateStats:     make(map[string]int),
		Records:       records,
	}

	for _, r := range records {
		duration := r.Duration
		if r.EndTime != nil {
			duration = int(r.EndTime.Sub(r.StartTime).Seconds())
		}
		stats.TotalDuration += duration
		stats.PurposeStats[r.PurposeName] += duration

		dateKey := r.StartTime.Format("2006-01-02")
		stats.DateStats[dateKey] += duration
	}

	return stats, nil
}

func (s *StatisticsService) FormatDuration(seconds int) string {
	hours := seconds / 3600
	minutes := (seconds % 3600) / 60
	secs := seconds % 60

	if hours > 0 {
		return fmt.Sprintf("%d小时%d分%d秒", hours, minutes, secs)
	}
	if minutes > 0 {
		return fmt.Sprintf("%d分%d秒", minutes, secs)
	}
	return fmt.Sprintf("%d秒", secs)
}

func (s *StatisticsService) FormatDurationShort(seconds int) string {
	hours := seconds / 3600
	minutes := (seconds % 3600) / 60

	if hours > 0 {
		return fmt.Sprintf("%dh %dm", hours, minutes)
	}
	return fmt.Sprintf("%dm", minutes)
}