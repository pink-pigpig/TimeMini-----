export interface TimerRecord {
  id: number;
  purpose_id: number;
  purpose_name: string;
  duration: number;
  start_time: string;
  end_time?: string;
  is_completed: boolean;
  created_at: string;
}

export interface Purpose {
  id: number;
  name: string;
  color: string;
  icon: string;
  is_default: boolean;
  created_at: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string;
  purpose_id: number;
  purpose_name: string;
  timer_duration: number;
  status: 'pending' | 'in_progress' | 'completed';
  completed_at?: string;
  created_at: string;
}

export interface Statistics {
  total_duration: number;
  purpose_stats: Record<string, number>;
  date_stats: Record<string, number>;
  records: TimerRecord[];
}

export interface TimerRequest {
  purpose_id: number;
  duration: number;
  is_loop: boolean;
  loop_count: number;
}

export interface TodoRequest {
  title: string;
  description: string;
  purpose_id: number;
  timer_duration: number;
}