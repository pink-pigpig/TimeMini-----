import { useState, useEffect } from 'react';
import { Layout, Menu, ConfigProvider, theme, Button, Switch } from 'antd';
import { ClockCircleOutlined, BarChartOutlined, UnorderedListOutlined, SettingOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import TimerPage from './pages/TimerPage';
import StatsPage from './pages/StatsPage';
import TodoPage from './pages/TodoPage';
import { Purpose, TimerRecord, TodoRequest, TimerRequest } from './types';
import WailsApp from './wails';

const { Sider, Content } = Layout;

function App() {
  const [activeMenu, setActiveMenu] = useState('timer');
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimerRecord | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    loadPurposes();
    loadActiveTimer();
  }, []);

  const loadPurposes = async () => {
    try {
      const result = await WailsApp.GetAllPurposes();
      if (result && result.Purposes) {
        setPurposes(result.Purposes);
      }
    } catch (e) {
      console.error('Error loading purposes:', e);
    }
  };

  const loadActiveTimer = async () => {
    const result = await WailsApp.GetActiveTimer();
    if (result && result.Success && result.Record) {
      setActiveTimer(result.Record);
    }
  };

  const handleStartTimer = async (req: TimerRequest) => {
    const result = await WailsApp.StartTimer(req);
    if (result && result.Success && result.Record) {
      setActiveTimer(result.Record);
    }
    return result;
  };

  const handleStopTimer = async (id: number) => {
    const result = await WailsApp.StopTimer(id);
    if (result && result.Success) {
      setActiveTimer(null);
    }
    return result;
  };

  const handleGetStatistics = async (period: string) => {
    return await WailsApp.GetStatistics(period);
  };

  const handleGetTodos = async () => {
    return await WailsApp.GetAllTodos();
  };

  const handleCreateTodo = async (req: TodoRequest) => {
    return await WailsApp.CreateTodo(req);
  };

  const handleUpdateTodo = async (id: number, req: TodoRequest) => {
    return await WailsApp.UpdateTodo(id, req);
  };

  const handleCompleteTodo = async (id: number) => {
    return await WailsApp.CompleteTodo(id);
  };

  const handleStartTodo = async (id: number) => {
    return await WailsApp.StartTodo(id);
  };

  const handleDeleteTodo = async (id: number) => {
    return await WailsApp.DeleteTodo(id);
  };

  const menuItems = [
    { key: 'timer', icon: <ClockCircleOutlined />, label: '倒计时' },
    { key: 'stats', icon: <BarChartOutlined />, label: '统计' },
    { key: 'todo', icon: <UnorderedListOutlined />, label: '待办事项' },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: darkMode ? '#0f0f1a' : '#f5f5f5' }}>
        <Sider
          width={220}
          style={{
            background: darkMode ? '#1a1a2e' : '#fff',
            boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
          }}
          theme={darkMode ? 'dark' : 'light'}
        >
          <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h1 style={{ color: '#1890ff', fontSize: 24, fontWeight: 700, margin: 0 }}>
              TimeMini
            </h1>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
              高效时间管理
            </div>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[activeMenu]}
            onClick={({ key }) => setActiveMenu(key)}
            items={menuItems}
            style={{ background: 'transparent', borderRight: 'none', marginTop: 16 }}
          />
          <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
              <span style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)' }}>
                {darkMode ? <MoonOutlined /> : <SunOutlined />}
              </span>
              <Switch checked={darkMode} onChange={setDarkMode} />
            </div>
          </div>
        </Sider>
        <Layout style={{ background: darkMode ? '#0f0f1a' : '#f5f5f5' }}>
          <Content style={{ height: '100vh', overflow: 'auto' }}>
            {activeMenu === 'timer' && (
              <TimerPage
                purposes={purposes}
                onStartTimer={handleStartTimer}
                onStopTimer={handleStopTimer}
                activeTimer={activeTimer}
              />
            )}
            {activeMenu === 'stats' && (
              <StatsPage onGetStatistics={handleGetStatistics} />
            )}
            {activeMenu === 'todo' && (
              <TodoPage
                purposes={purposes}
                onGetTodos={handleGetTodos}
                onCreateTodo={handleCreateTodo}
                onUpdateTodo={handleUpdateTodo}
                onCompleteTodo={handleCompleteTodo}
                onStartTodo={handleStartTodo}
                onDeleteTodo={handleDeleteTodo}
              />
            )}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;