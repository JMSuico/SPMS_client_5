import { User, UserRole, Subject, Grade, Attendance } from './types';

// Mock Database
export const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', fullName: 'System Administrator', role: UserRole.ADMIN, email: 'admin@spms.edu' },
  { id: '2', username: 'teacher', fullName: 'John Keating', role: UserRole.TEACHER, email: 'jkeating@spms.edu' },
  { id: '3', username: 'student', fullName: 'Alice Johnson', role: UserRole.STUDENT, email: 'alice@spms.edu' },
  { id: '4', username: 'student2', fullName: 'Bob Smith', role: UserRole.STUDENT, email: 'bob@spms.edu' },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: '101', code: 'MATH101', name: 'Calculus I', teacherId: '2' },
  { id: '102', code: 'PHY101', name: 'Physics I', teacherId: '2' },
  { id: '103', code: 'CS101', name: 'Intro to CS', teacherId: '2' },
];

export const MOCK_GRADES: Grade[] = [
  { id: 'g1', studentId: '3', subjectId: '101', score: 85, term: 'Midterm' },
  { id: 'g2', studentId: '3', subjectId: '101', score: 92, term: 'Final' },
  { id: 'g3', studentId: '3', subjectId: '102', score: 78, term: 'Midterm' },
  { id: 'g4', studentId: '3', subjectId: '103', score: 95, term: 'Final' },
  { id: 'g5', studentId: '4', subjectId: '101', score: 65, term: 'Midterm' },
];

export const MOCK_ATTENDANCE: Attendance[] = [
  { id: 'a1', studentId: '3', subjectId: '101', date: '2023-10-01', status: 'PRESENT' },
  { id: 'a2', studentId: '3', subjectId: '101', date: '2023-10-02', status: 'PRESENT' },
  { id: 'a3', studentId: '3', subjectId: '101', date: '2023-10-03', status: 'LATE' },
  { id: 'a4', studentId: '3', subjectId: '101', date: '2023-10-04', status: 'ABSENT' },
  { id: 'a5', studentId: '3', subjectId: '101', date: '2023-10-05', status: 'PRESENT' },
];