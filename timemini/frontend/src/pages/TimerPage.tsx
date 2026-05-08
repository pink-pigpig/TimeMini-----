import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Select, InputNumber, Switch, Tag, Space, message, Progress } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, SyncOutlined } from '@ant-design/icons';
import { Purpose, TimerRecord, TimerRequest } from '../types';

const PRESET_TIMES = [
  { label: '15分钟', value: 15 * 60 },
  { label: '20分钟', value: 20 * 60 },
  { label: '25分钟', value: 25 * 60 },
  { label: '30分钟', value: 30 * 60 },
  { label: '45分钟', value: 45 * 60 },
];

interface TimerPageProps {
  purposes: Purpose[];
  onStartTimer: (req: TimerRequest) => Promise<any>;
  onStopTimer: (id: number) => Promise<any>;
  activeTimer: TimerRecord | null;
}

export const TimerPage: React.FC<TimerPageProps> = ({
  purposes,
  onStartTimer,
  onStopTimer,
  activeTimer,
}) => {
  const [selectedPurpose, setSelectedPurpose] = useState<number>(1);
  const [duration, setDuration] = useState<number>(25 * 60);
  const [isLoop, setIsLoop] = useState<boolean>(false);
  const [loopCount, setLoopCount] = useState<number>(4);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTimerId, setCurrentTimerId] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeTimer) {
      setCurrentTimerId(activeTimer.id);
      setSelectedPurpose(activeTimer.purpose_id);
      setDuration(activeTimer.duration);
      const elapsed = Math.floor((Date.now() - new Date(activeTimer.start_time).getTime()) / 1000);
      const remaining = Math.max(0, activeTimer.duration - elapsed);
      setTimeLeft(remaining);
      setIsRunning(true);
    }
  }, [activeTimer]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = async () => {
    if (duration <= 0) {
      message.error('请设置倒计时时长');
      return;
    }

    const req: TimerRequest = {
      purpose_id: selectedPurpose,
      duration,
      is_loop: isLoop,
      loop_count: loopCount,
    };

    const result = await onStartTimer(req);
    if (result.success) {
      setCurrentTimerId(result.record.id);
      setTimeLeft(duration);
      setIsRunning(true);
      message.success('开始计时');
    } else {
      message.error(result.message || '启动失败');
    }
  };

  const handlePause = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRunning(false);
  };

  const handleResume = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const handleStop = async () => {
    if (currentTimerId) {
      await onStopTimer(currentTimerId);
      setIsRunning(false);
      setTimeLeft(0);
      setCurrentTimerId(null);
      message.success('计时结束');
    }
  };

  const handleTimerComplete = async () => {
    if (currentTimerId) {
      await onStopTimer(currentTimerId);
      if (isLoop && loopCount > 0) {
        setLoopCount((prev) => prev - 1);
        handleStart();
      } else {
        setIsRunning(false);
        setTimeLeft(0);
        setCurrentTimerId(null);
        message.success('计时完成！');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  const selectedPurposeData = purposes.find((p) => p.id === selectedPurpose);

  return (
    <div className="timer-page">
      <Card className="timer-card" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: 'none',
        borderRadius: 20,
        padding: 20
      }}>
        <div className="timer-display">
          <Progress
            type="circle"
            percent={progress}
            format={() => (
              <span style={{ color: '#fff', fontSize: 48, fontWeight: 300 }}>
                {formatTime(timeLeft || duration)}
              </span>
            )}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            trailColor="rgba(255,255,255,0.1)"
            width={280}
          />
          {selectedPurposeData && (
            <Tag
              color={selectedPurposeData.color}
              style={{ marginTop: 20, fontSize: 16, padding: '4px 16px' }}
            >
              {selectedPurposeData.name}
            </Tag>
          )}
        </div>

        {!isRunning && !currentTimerId && (
          <div className="timer-settings">
            <div className="setting-row">
              <span className="setting-label">用途</span>
              <Select
                value={selectedPurpose}
                onChange={setSelectedPurpose}
                style={{ width: 200 }}
                options={purposes.map((p) => ({
                  label: p.name,
                  value: p.id,
                }))}
              />
            </div>

            <div className="setting-row">
              <span className="setting-label">预设时间</span>
              <Space>
                {PRESET_TIMES.map((t) => (
                  <Button
                    key={t.value}
                    type={duration === t.value ? 'primary' : 'default'}
                    onClick={() => setDuration(t.value)}
                  >
                    {t.label}
                  </Button>
                ))}
              </Space>
            </div>

            <div className="setting-row">
              <span className="setting-label">自定义(分钟)</span>
              <InputNumber
                min={1}
                max={1440}
                value={Math.floor(duration / 60)}
                onChange={(val) => setDuration((val || 1) * 60)}
                style={{ width: 120 }}
              />
            </div>

            <div className="setting-row">
              <span className="setting-label">循环</span>
              <Space>
                <Switch checked={isLoop} onChange={(checked) => setIsLoop(checked)} />
                {isLoop && (
                  <InputNumber
                    min={1}
                    max={10}
                    value={loopCount}
                    onChange={(val) => setLoopCount(val || 1)}
                    style={{ width: 80 }}
                  />
                )}
              </Space>
            </div>
          </div>
        )}

        <div className="timer-controls">
          <Space size="large">
            {!isRunning && !currentTimerId ? (
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleStart}
                style={{ width: 120, height: 50, fontSize: 18 }}
              >
                开始
              </Button>
            ) : isRunning ? (
              <>
                <Button
                  size="large"
                  icon={<PauseCircleOutlined />}
                  onClick={handlePause}
                  style={{ width: 100, height: 44 }}
                >
                  暂停
                </Button>
                <Button
                  danger
                  size="large"
                  icon={<StopOutlined />}
                  onClick={handleStop}
                  style={{ width: 100, height: 44 }}
                >
                  停止
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlayCircleOutlined />}
                  onClick={handleResume}
                  style={{ width: 100, height: 44 }}
                >
                  继续
                </Button>
                <Button
                  danger
                  size="large"
                  icon={<StopOutlined />}
                  onClick={handleStop}
                  style={{ width: 100, height: 44 }}
                >
                  停止
                </Button>
              </>
            )}
          </Space>
        </div>
      </Card>

      <style>{`
        .timer-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
        }
        .timer-card {
          max-width: 600px;
          width: 100%;
        }
        .timer-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }
        .timer-settings {
          margin-bottom: 30px;
        }
        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 0 20px;
        }
        .setting-label {
          color: rgba(255,255,255,0.7);
          font-size: 14px;
        }
        .timer-controls {
          display: flex;
          justify-content: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
};

export default TimerPage;