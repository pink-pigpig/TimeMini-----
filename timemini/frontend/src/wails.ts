import { TimerRecord, Purpose, Todo, TodoRequest, Statistics, TimerRequest } from './types';

export const WailsApp = {
  Greet: (name: string) => (window as any).go.main.App.Greet(name),
  StartTimer: (req: TimerRequest) => (window as any).go.main.App.StartTimer(req),
  StopTimer: (id: number) => (window as any).go.main.App.StopTimer(id),
  GetActiveTimer: () => (window as any).go.main.App.GetActiveTimer(),
  GetTodayRecords: () => (window as any).go.main.App.GetTodayRecords(),
  GetStatistics: (period: string) => (window as any).go.main.App.GetStatistics(period),
  CreateTodo: (req: TodoRequest) => (window as any).go.main.App.CreateTodo(req),
  GetAllTodos: () => (window as any).go.main.App.GetAllTodos(),
  GetTodosByStatus: (status: string) => (window as any).go.main.App.GetTodosByStatus(status),
  UpdateTodo: (id: number, req: TodoRequest) => (window as any).go.main.App.UpdateTodo(id, req),
  CompleteTodo: (id: number) => (window as any).go.main.App.CompleteTodo(id),
  StartTodo: (id: number) => (window as any).go.main.App.StartTodo(id),
  DeleteTodo: (id: number) => (window as any).go.main.App.DeleteTodo(id),
  GetAllPurposes: () => (window as any).go.main.App.GetAllPurposes(),
  CreatePurpose: (name: string, color: string, icon: string) => (window as any).go.main.App.CreatePurpose(name, color, icon),
  DeletePurpose: (id: number) => (window as any).go.main.App.DeletePurpose(id),
};

export default WailsApp;