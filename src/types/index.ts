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

export interface GroupDetail {
  id: number;
  name: string;
  description: string;
  color: string;
  members: Member[];
  tasks: Task[];
  createdAt?: string;
}

// User types
export interface User {
  nickname: string;
  imageUrl: string;
  email: string;
  introduction: string;
}

// Auth types
export interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  error?: string;
}
