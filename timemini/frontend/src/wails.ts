import * as Wails from '@wailsjs/go/main/App';

export const WailsApp = {
  Greet: (name: string) => Wails.Greet(name),
  StartTimer: (req: any) => Wails.StartTimer(req),
  StopTimer: (id: number) => Wails.StopTimer(id),
  GetActiveTimer: () => Wails.GetActiveTimer(),
  GetTodayRecords: () => Wails.GetTodayRecords(),
  GetStatistics: (period: string) => Wails.GetStatistics(period),
  CreateTodo: (req: any) => Wails.CreateTodo(req),
  GetAllTodos: () => Wails.GetAllTodos(),
  GetTodosByStatus: (status: string) => Wails.GetTodosByStatus(status),
  UpdateTodo: (id: number, req: any) => Wails.UpdateTodo(id, req),
  CompleteTodo: (id: number) => Wails.CompleteTodo(id),
  StartTodo: (id: number) => Wails.StartTodo(id),
  DeleteTodo: (id: number) => Wails.DeleteTodo(id),
  GetAllPurposes: () => Wails.GetAllPurposes(),
  CreatePurpose: (name: string, color: string, icon: string) => Wails.CreatePurpose(name, color, icon),
  DeletePurpose: (id: number) => Wails.DeletePurpose(id),
};

export default WailsApp;