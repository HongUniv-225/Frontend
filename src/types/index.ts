export type TodoStatus = "pending" | "in-progress" | "completed" | "failed";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  group: string;
  status?: TodoStatus;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  status: TodoStatus;
  dueDate: string;
  priority: "low" | "medium" | "high";
}

export interface Group {
  id: number;
  name: string;
  description: string;
  color: string;
  members: number;
  tasks: number;
  createdAt?: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface GroupDetail extends Group {
  members: Member[];
  tasks: Task[];
}
