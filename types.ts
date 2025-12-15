
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  teacherId: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  score: number;
  term: string;
  assessmentName?: string; // New: For "Assignment 1", "Quiz 2", etc.
  maxScore?: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  subjectId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  details: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'GRADE' | 'ATTENDANCE' | 'SYSTEM';
  isRead: boolean;
  timestamp: string;
}

export interface SystemSettings {
  systemName: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  gradeModificationWindow: number;
  themeColor: string;
}
