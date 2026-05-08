import React, { useState, useEffect } from 'react';
import { Card, List, Button, Input, Modal, Form, Select, InputNumber, Tag, Checkbox, message, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Todo, Purpose, TodoRequest } from '../types';

interface TodoPageProps {
  purposes: Purpose[];
  onGetTodos: () => Promise<any>;
  onCreateTodo: (req: TodoRequest) => Promise<any>;
  onUpdateTodo: (id: number, req: TodoRequest) => Promise<any>;
  onCompleteTodo: (id: number) => Promise<any>;
  onStartTodo: (id: number) => Promise<any>;
  onDeleteTodo: (id: number) => Promise<any>;
}

export const TodoPage: React.FC<TodoPageProps> = ({
  purposes,
  onGetTodos,
  onCreateTodo,
  onUpdateTodo,
  onCompleteTodo,
  onStartTodo,
  onDeleteTodo,
}) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [form] = Form.useForm();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
    const result = await onGetTodos();
    console.log('Todos result:', result);
    if (result && result.Success) {
      setTodos(result.Todos || []);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingTodo(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    form.setFieldsValue({
      title: todo.title,
      description: todo.description,
      purpose_id: todo.purpose_id,
      timer_duration: todo.timer_duration ? Math.floor(todo.timer_duration / 60) : 0,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const req: any = {
      Title: values.title,
      Description: values.description || '',
      PurposeID: values.purpose_id || 1,
      TimerDuration: (values.timer_duration || 0) * 60,
    };

    let result;
    if (editingTodo) {
      result = await onUpdateTodo(editingTodo.id, req);
    } else {
      result = await onCreateTodo(req);
    }

    if (result && result.Success) {
      message.success(editingTodo ? '更新成功' : '创建成功');
      setModalVisible(false);
      loadTodos();
    } else {
      message.error(result?.Message || '操作失败');
    }
  };

  const handleComplete = async (id: number) => {
    const result = await onCompleteTodo(id);
    if (result && result.Success) {
      message.success('任务完成');
      loadTodos();
    }
  };

  const handleStart = async (id: number) => {
    const result = await onStartTodo(id);
    if (result && result.Success) {
      message.success('开始任务');
      loadTodos();
    }
  };

  const handleDelete = async (id: number) => {
    const result = await onDeleteTodo(id);
    if (result && result.Success) {
      message.success('删除成功');
      loadTodos();
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return m > 0 ? `${m} 分钟` : '';
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'all') return true;
    return todo.status === filter;
  });

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: '待开始' },
      in_progress: { color: 'processing', text: '进行中' },
      completed: { color: 'success', text: '已完成' },
    };
    return map[status] || { color: 'default', text: status };
  };

  const getPurposeColor = (purposeName: string) => {
    const purpose = purposes.find((p) => p.name === purposeName);
    return purpose?.color || '#8c8c8c';
  };

  return (
    <div className="todo-page">
      <div className="todo-header">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          新建任务
        </Button>
        <div className="filter-buttons">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((f) => (
            <Button
              key={f}
              type={filter === f ? 'primary' : 'default'}
              onClick={() => setFilter(f)}
              style={{ marginLeft: 8 }}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待开始' : f === 'in_progress' ? '进行中' : '已完成'}
            </Button>
          ))}
        </div>
      </div>

      <List
        loading={loading}
        dataSource={filteredTodos}
        locale={{ emptyText: <Empty description="暂无任务" /> }}
        renderItem={(todo) => (
          <Card
            hoverable
            style={{
              marginBottom: 16,
              background: todo.status === 'completed' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
              borderRadius: 16,
              border: 'none',
              opacity: todo.status === 'completed' ? 0.7 : 1,
            }}
          >
            <div className="todo-item">
              <div className="todo-left">
                <Checkbox
                  checked={todo.status === 'completed'}
                  onChange={() => todo.status !== 'completed' && handleComplete(todo.id)}
                  style={{ marginRight: 12 }}
                />
                <div className="todo-content">
                  <div className="todo-title" style={{ textDecoration: todo.status === 'completed' ? 'line-through' : 'none' }}>
                    {todo.title}
                  </div>
                  {todo.description && <div className="todo-desc">{todo.description}</div>}
                  <div className="todo-meta">
                    <Tag color={getPurposeColor(todo.purpose_name)}>{todo.purpose_name}</Tag>
                    {todo.timer_duration > 0 && (
                      <Tag icon={<PlayCircleOutlined />}>{formatDuration(todo.timer_duration)}</Tag>
                    )}
                    <Tag color={getStatusTag(todo.status).color}>{getStatusTag(todo.status).text}</Tag>
                  </div>
                </div>
              </div>
              <div className="todo-actions">
                {todo.status === 'pending' && (
                  <Button type="text" icon={<PlayCircleOutlined />} onClick={() => handleStart(todo.id)}>
                    开始
                  </Button>
                )}
                <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(todo)} />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(todo.id)} />
              </div>
            </div>
          </Card>
        )}
      />

      <Modal
        title={editingTodo ? '编辑任务' : '新建任务'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入任务标题' }]}>
            <Input placeholder="请输入任务标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
          <Form.Item name="purpose_id" label="用途">
            <Select
              options={purposes.map((p) => ({ label: p.name, value: p.id }))}
              placeholder="选择用途"
            />
          </Form.Item>
          <Form.Item name="timer_duration" label="倒计时时长(分钟)">
            <InputNumber min={0} max={1440} placeholder="0 表示无倒计时" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .todo-page {
          padding: 24px;
        }
        .todo-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .filter-buttons {
          display: flex;
        }
        .todo-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .todo-left {
          display: flex;
          align-items: flex-start;
        }
        .todo-content {
          display: flex;
          flex-direction: column;
        }
        .todo-title {
          font-size: 16px;
          font-weight: 500;
          color: #fff;
          margin-bottom: 4px;
        }
        .todo-desc {
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          margin-bottom: 8px;
        }
        .todo-meta {
          display: flex;
          gap: 8px;
        }
        .todo-actions {
          display: flex;
          gap: 4px;
        }
        .ant-modal-content {
          background: #1a1a2e !important;
        }
        .ant-modal-header {
          background: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        }
        .ant-modal-title {
          color: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default TodoPage;