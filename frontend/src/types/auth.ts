export interface User {
  id: string;
  email: string;
  name: string;
  education?: string | null;
  graduationYear?: number | null;
  targetRoleId?: string | null;
  targetRole?: {
    id: string;
    code: string;
    name: string;
    description: string;
  } | null;
  careerHoursPerWeek: number;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}