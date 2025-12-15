
import { MOCK_USERS, MOCK_SUBJECTS, MOCK_GRADES, MOCK_ATTENDANCE } from '../constants';
import { User, Subject, Grade, Attendance, UserRole, AuditLog, Notification, SystemSettings } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK STORAGE ---
let localUsers = [...MOCK_USERS]; 
let localGrades = [...MOCK_GRADES];
let localAttendance = [...MOCK_ATTENDANCE];
let localSubjects = [...MOCK_SUBJECTS];
let logs: AuditLog[] = [
  { id: 'l1', timestamp: new Date().toISOString(), action: 'SYSTEM_INIT', userId: '1', details: 'System initialized' }
];

let settings: SystemSettings = {
  systemName: 'SPMS - Student Performance Monitoring',
  maintenanceMode: false,
  allowRegistration: true,
  gradeModificationWindow: 14,
  themeColor: 'blue'
};

let notifications: Notification[] = [
  { id: 'n1', userId: '3', message: 'New grade posted for Calculus I', type: 'GRADE', isRead: false, timestamp: new Date().toISOString() },
  { id: 'n2', userId: '2', message: 'Attendance report due for Physics I', type: 'SYSTEM', isRead: false, timestamp: new Date().toISOString() }
];

// --- SETTINGS ---
export const getSettings = async (): Promise<SystemSettings> => {
  await delay(200);
  return { ...settings };
};

export const updateSettings = async (newSettings: SystemSettings): Promise<void> => {
  await delay(500);
  settings = { ...newSettings };
  addLog('ADMIN', 'SETTINGS_UPDATE', 'System settings updated');
};

// --- AUTH & REGISTRATION ---

export const mockLogin = async (identifier: string): Promise<User | null> => {
  await delay(500);
  
  // Check Maintenance Mode (Skip for admin to allow them to fix it)
  if (settings.maintenanceMode && identifier !== 'admin' && identifier !== '1') {
      throw new Error("System is in Maintenance Mode. Please try again later.");
  }

  const user = localUsers.find(u => u.username === identifier || u.id === identifier);
  if (user) {
    addLog(user.id, 'LOGIN', `User ${user.username} logged in`);
  }
  return user || null;
};

export const mockRegister = async (userData: User): Promise<User> => {
  await delay(800);

  if (!settings.allowRegistration) {
      throw new Error("Public registration is currently disabled.");
  }
  
  const existing = localUsers.find(u => u.username === userData.username || u.id === userData.id);
  if (existing) {
    throw new Error('Username or User ID already taken');
  }

  // Enforce ID Prefix based on Role if not provided or just rely on manual input
  // For this requirement, we assume the user provides the ID in the form, 
  // but we could validate it here.
  
  localUsers.push(userData);
  addLog(userData.id, 'REGISTER', `New user registered: ${userData.username} as ${userData.role}`);
  return userData;
};

export const addLog = (userId: string, action: string, details: string) => {
  const newLog: AuditLog = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    action,
    userId,
    details
  };
  logs.unshift(newLog);
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  await delay(300);
  return [...logs];
};

// --- USER MANAGEMENT (CRUD) ---

export const getAllUsers = async (): Promise<User[]> => {
  await delay(300);
  return [...localUsers];
};

export const addUser = async (user: User): Promise<void> => {
  await delay(500);
  if (localUsers.find(u => u.id === user.id || u.username === user.username)) {
    throw new Error("User ID or Username already exists");
  }
  localUsers.push(user);
  addLog('ADMIN', 'USER_ADD', `Added user ${user.username} (${user.role})`);
};

export const updateUser = async (user: User): Promise<void> => {
  await delay(500);
  const index = localUsers.findIndex(u => u.id === user.id);
  if (index === -1) throw new Error("User not found");
  localUsers[index] = user;
  addLog('ADMIN', 'USER_UPDATE', `Updated profile for ${user.username}`);
};

export const deleteUser = async (userId: string): Promise<void> => {
  await delay(500);
  localUsers = localUsers.filter(u => u.id !== userId);
  addLog('ADMIN', 'USER_DELETE', `Deleted user ${userId}`);
};

export const searchUsers = async (query: string, roleFilter: string): Promise<User[]> => {
  await delay(300);
  let users = [...localUsers];
  
  if (roleFilter && roleFilter !== 'ALL') {
    users = users.filter(u => u.role === roleFilter);
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    users = users.filter(u => 
      u.username.toLowerCase().includes(lowerQuery) || 
      u.fullName.toLowerCase().includes(lowerQuery) || 
      u.email.toLowerCase().includes(lowerQuery) ||
      u.id.toLowerCase().includes(lowerQuery)
    );
  }
  return users;
};

// --- NOTIFICATIONS ---

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  await delay(300);
  return notifications.filter(n => n.userId === userId);
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
  const notif = notifications.find(n => n.id === notificationId);
  if (notif) notif.isRead = true;
};

// --- DATA ACCESS & FILTERING ---

export const getSubjects = async (): Promise<Subject[]> => {
  await delay(300);
  return [...localSubjects];
};

export const getSubjectsByTeacher = async (teacherId: string): Promise<Subject[]> => {
  await delay(300);
  return localSubjects.filter(s => s.teacherId === teacherId);
};

export const requestSubject = async (teacherId: string, subjectName: string, code: string): Promise<void> => {
    await delay(500);
    const newSub: Subject = {
        id: Math.random().toString(36).substr(2, 5).toUpperCase(),
        name: subjectName,
        code: code,
        teacherId: teacherId
    };
    localSubjects.push(newSub);
    addLog(teacherId, 'SUBJECT_REQUEST', `Teacher requested/created subject ${code}`);
};

export const getGradesByStudent = async (studentId: string): Promise<Grade[]> => {
  await delay(300);
  return localGrades.filter(g => g.studentId === studentId); 
};

export const getGradesBySubject = async (subjectId: string): Promise<Grade[]> => {
  await delay(300);
  return localGrades.filter(g => g.subjectId === subjectId);
};

// Updated to handle optional assessmentName
export const updateGrade = async (gradeId: string, newScore: number, teacherId: string, studentId: string, subjectId: string, term: string, assessmentName?: string): Promise<void> => {
  await delay(500);
  
  if (gradeId) {
    const gradeIndex = localGrades.findIndex(g => g.id === gradeId);
    if (gradeIndex !== -1) {
        localGrades[gradeIndex] = { ...localGrades[gradeIndex], score: newScore };
    }
  } else {
      // Create new grade
      localGrades.push({
          id: Math.random().toString(36).substr(2,9),
          studentId,
          subjectId,
          score: newScore,
          term,
          assessmentName
      });
  }

  addLog(teacherId, 'GRADE_UPDATE', `Updated grade for ${studentId}`);
};

// New: Create assignment for all students in a class
export const createClassAssignment = async (teacherId: string, subjectId: string, term: string, assessmentName: string, maxScore: number): Promise<void> => {
    await delay(600);
    // Find students
    const students = await getStudentsByClass(teacherId, subjectId);
    const uniqueStudents = Array.from(new Set(students.map(s => s.student)));
    
    uniqueStudents.forEach(stu => {
        localGrades.push({
            id: Math.random().toString(36).substr(2,9),
            studentId: stu.id,
            subjectId,
            score: 0, // Default to 0 or null
            term,
            assessmentName,
            maxScore
        });
    });
    
    addLog(teacherId, 'ASSIGNMENT_CREATE', `Created ${assessmentName} for ${subjectId}`);
};

export const recordAttendance = async (attendanceData: Omit<Attendance, 'id'>, teacherId: string): Promise<void> => {
  await delay(500);
  const newRecord: Attendance = {
    ...attendanceData,
    id: Math.random().toString(36).substr(2, 9)
  };
  localAttendance.push(newRecord);
};

export const getAttendanceByStudent = async (studentId: string): Promise<Attendance[]> => {
  await delay(300);
  return localAttendance.filter(a => a.studentId === studentId);
};

export const getStudentsByClass = async (teacherId: string, subjectId?: string): Promise<{ student: User, subject: Subject }[]> => {
  await delay(300);
  const teacherSubjects = localSubjects.filter(s => s.teacherId === teacherId);
  const relevantSubjects = subjectId 
    ? teacherSubjects.filter(s => s.id === subjectId) 
    : teacherSubjects;

  const results: { student: User, subject: Subject }[] = [];
  const allStudents = localUsers.filter(u => u.role === UserRole.STUDENT);

  relevantSubjects.forEach(sub => {
    allStudents.forEach(stu => {
      // In a real DB we check enrollment table. 
      // For mock, let's assume all students are in all subjects for simplicity 
      // OR filter based on if they have grades/attendance in it.
      // Let's just return ALL students for the demo to populate the lists.
      results.push({ student: stu, subject: sub });
    });
  });

  return results;
};

export const getSystemStats = async () => {
  await delay(300);
  const students = localUsers.filter(u => u.role === UserRole.STUDENT);
  const atRisk = students.filter(s => {
      const g = localGrades.filter(gr => gr.studentId === s.id);
      if(g.length === 0) return false;
      const avg = g.reduce((a,b) => a + b.score, 0) / g.length;
      return avg < 75;
  });

  return {
    totalStudents: students.length,
    totalTeachers: localUsers.filter(u => u.role === UserRole.TEACHER).length,
    totalSubjects: localSubjects.length,
    activeAlerts: atRisk.length,
    atRiskStudents: atRisk
  };
};
