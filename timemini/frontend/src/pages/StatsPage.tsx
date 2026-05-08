import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Tag, Row, Col, Statistic } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Statistics as StatsType } from '../types';

const COLORS = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#8c8c8c', '#13c2c2', '#faad14'];

interface StatsPageProps {
  onGetStatistics: (period: string) => Promise<any>;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onGetStatistics }) => {
  const [period, setPeriod] = useState('day');
  const [stats, setStats] = useState<StatsType | null>(null);
  const [formatted, setFormatted] = useState('');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    const result = await onGetStatistics(period);
    if (result.success) {
      setStats(result.stats);
      setFormatted(result.formatted);
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const purposeData = stats ? Object.entries(stats.purpose_stats).map(([name, value], idx) => ({
    name,
    value,
    color: COLORS[idx % COLORS.length],
  })) : [];

  const dateData = stats ? Object.entries(stats.date_stats).map(([date, value]) => ({
    date: date.slice(5),
    value: Math.floor(value / 60),
  })).sort((a, b) => a.date.localeCompare(b.date)) : [];

  const columns = [
    { title: '用途', dataIndex: 'purpose_name', key: 'purpose_name' },
    { title: '时长', dataIndex: 'duration', key: 'duration', render: (v: number) => formatDuration(v) },
    { title: '开始时间', dataIndex: 'start_time', key: 'start_time', render: (v: string) => new Date(v).toLocaleString() },
  ];

  return (
    <div className="stats-page">
      <Tabs
        activeKey={period}
        onChange={(key) => { setPeriod(key); }}
        items={[
          { key: 'day', label: '当天' },
          { key: 'week', label: '本周' },
          { key: 'month', label: '本月' },
          { key: 'year', label: '本年' },
          { key: 'all', label: '全部' },
        ]}
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 16, border: 'none' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>总时长</span>}
              value={formatted}
              prefix={<ClockCircleOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: 16, border: 'none' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>记录次数</span>}
              value={stats?.records?.length || 0}
              prefix={<CalendarOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<span style={{ color: '#fff' }}>用途分布</span>} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: 'none' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={purposeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'rgba(255,255,255,0.5)' }}
                >
                  {purposeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8 }}
                  formatter={(value: number) => formatDuration(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<span style={{ color: '#fff' }}>时间趋势</span>} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: 'none' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dateData}>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 8 }}
                  formatter={(value: number) => [`${value} 分钟`, '时长']}
                />
                <Bar dataKey="value" fill="#1890ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title={<span style={{ color: '#fff' }}>详细记录</span>} style={{ marginTop: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: 'none' }}>
        <Table
          dataSource={stats?.records || []}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: '暂无记录' }}
        />
      </Card>

      <style>{`
        .stats-page {
          padding: 24px;
        }
        .ant-tabs-tab {
          color: rgba(255,255,255,0.6) !important;
        }
        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #fff !important;
        }
        .ant-card-head {
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .ant-card-head-title {
          color: #fff;
        }
        .ant-table {
          background: transparent !important;
        }
        .ant-table-thead > tr > th {
          background: rgba(255,255,255,0.1) !important;
          color: #fff !important;
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
          color: rgba(255,255,255,0.8) !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: rgba(255,255,255,0.05) !important;
        }
        .ant-pagination-item {
          background: rgba(255,255,255,0.1) !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
        .ant-pagination-item a {
          color: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default StatsPage;