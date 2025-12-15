
import { MOCK_USERS, MOCK_SUBJECTS, MOCK_GRADES, MOCK_ATTENDANCE } from '../constants';
import { User, Subject, Grade, Attendance, UserRole, AuditLog, Notification, SystemSettings } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- PERSISTENCE HELPERS ---
const STORAGE_KEYS = {
  USERS: 'SPMS_DATA_USERS',
  SUBJECTS: 'SPMS_DATA_SUBJECTS',
  GRADES: 'SPMS_DATA_GRADES',
  ATTENDANCE: 'SPMS_DATA_ATTENDANCE',
  LOGS: 'SPMS_DATA_LOGS',
  SETTINGS: 'SPMS_DATA_SETTINGS',
  NOTIFICATIONS: 'SPMS_DATA_NOTIFICATIONS'
};

const loadData = <T>(key: string, defaultData: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  } catch (e) {
    console.error(`Error loading ${key}`, e);
    return defaultData;
  }
};

const saveData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
};

// --- INITIALIZE DATA FROM STORAGE OR CONSTANTS ---
let localUsers: User[] = loadData(STORAGE_KEYS.USERS, [...MOCK_USERS]);
let localSubjects: Subject[] = loadData(STORAGE_KEYS.SUBJECTS, [...MOCK_SUBJECTS]);
let localGrades: Grade[] = loadData(STORAGE_KEYS.GRADES, [...MOCK_GRADES]);
let localAttendance: Attendance[] = loadData(STORAGE_KEYS.ATTENDANCE, [...MOCK_ATTENDANCE]);
let logs: AuditLog[] = loadData(STORAGE_KEYS.LOGS, [
  { id: 'l1', timestamp: new Date().toISOString(), action: 'SYSTEM_INIT', userId: 'SYSTEM', details: 'Database Initialized' }
]);
let notifications: Notification[] = loadData(STORAGE_KEYS.NOTIFICATIONS, [
  { id: 'n1', userId: '3', message: 'New grade posted for Calculus I', type: 'GRADE', isRead: false, timestamp: new Date().toISOString() },
  { id: 'n2', userId: '2', message: 'Attendance report due for Physics I', type: 'SYSTEM', isRead: false, timestamp: new Date().toISOString() }
]);

let settings: SystemSettings = loadData(STORAGE_KEYS.SETTINGS, {
  systemName: 'SPMS - Student Performance Monitoring',
  maintenanceMode: false,
  allowRegistration: true,
  gradeModificationWindow: 14,
  themeColor: 'blue'
});

// --- HELPER TO SAVE LOGS AUTOMATICALLY ---
export const addLog = (userId: string, action: string, details: string) => {
  const newLog: AuditLog = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    action,
    userId,
    details
  };
  logs.unshift(newLog);
  saveData(STORAGE_KEYS.LOGS, logs);
};

// --- SETTINGS ---
export const getSettings = async (): Promise<SystemSettings> => {
  await delay(200);
  return { ...settings };
};

export const updateSettings = async (newSettings: SystemSettings): Promise<void> => {
  await delay(500);
  settings = { ...newSettings };
  saveData(STORAGE_KEYS.SETTINGS, settings);
  addLog('ADMIN', 'SETTINGS_UPDATE', 'System settings updated');
};

// --- AUTH & REGISTRATION ---

export const mockLogin = async (identifier: string): Promise<User | null> => {
  await delay(500);
  
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

  localUsers.push(userData);
  saveData(STORAGE_KEYS.USERS, localUsers);
  addLog(userData.id, 'REGISTER', `New user registered: ${userData.username} as ${userData.role}`);
  return userData;
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
  saveData(STORAGE_KEYS.USERS, localUsers);
  addLog('ADMIN', 'USER_ADD', `Added user ${user.username} (${user.role})`);
};

export const updateUser = async (user: User): Promise<void> => {
  await delay(500);
  const index = localUsers.findIndex(u => u.id === user.id);
  if (index === -1) throw new Error("User not found");
  
  localUsers[index] = user;
  saveData(STORAGE_KEYS.USERS, localUsers);
  addLog('ADMIN', 'USER_UPDATE', `Updated profile for ${user.username}`);
};

export const deleteUser = async (userId: string): Promise<void> => {
  await delay(500);
  const user = localUsers.find(u => u.id === userId);
  localUsers = localUsers.filter(u => u.id !== userId);
  saveData(STORAGE_KEYS.USERS, localUsers);
  addLog('ADMIN', 'USER_DELETE', `Deleted user ${userId} (${user?.username})`);
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
  if (notif) {
      notif.isRead = true;
      saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
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
    saveData(STORAGE_KEYS.SUBJECTS, localSubjects);
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

export const updateGrade = async (gradeId: string, newScore: number, teacherId: string, studentId: string, subjectId: string, term: string, assessmentName?: string): Promise<void> => {
  await delay(500);
  
  if (gradeId) {
    const gradeIndex = localGrades.findIndex(g => g.id === gradeId);
    if (gradeIndex !== -1) {
        localGrades[gradeIndex] = { ...localGrades[gradeIndex], score: newScore };
    }
  } else {
      localGrades.push({
          id: Math.random().toString(36).substr(2,9),
          studentId,
          subjectId,
          score: newScore,
          term,
          assessmentName
      });
  }
  saveData(STORAGE_KEYS.GRADES, localGrades);
  addLog(teacherId, 'GRADE_UPDATE', `Updated grade for ${studentId}`);
};

export const createClassAssignment = async (teacherId: string, subjectId: string, term: string, assessmentName: string, maxScore: number): Promise<void> => {
    await delay(600);
    const students = await getStudentsByClass(teacherId, subjectId);
    const uniqueStudents = Array.from(new Set(students.map(s => s.student)));
    
    uniqueStudents.forEach(stu => {
        localGrades.push({
            id: Math.random().toString(36).substr(2,9),
            studentId: stu.id,
            subjectId,
            score: 0, 
            term,
            assessmentName,
            maxScore
        });
    });
    
    saveData(STORAGE_KEYS.GRADES, localGrades);
    addLog(teacherId, 'ASSIGNMENT_CREATE', `Created ${assessmentName} for ${subjectId}`);
};

// --- ATTENDANCE ---

export const recordAttendance = async (attendanceData: Omit<Attendance, 'id'>, teacherId: string): Promise<void> => {
  await delay(500);
  
  // Check if attendance record already exists for this student + subject + date
  const existingIndex = localAttendance.findIndex(
    a => a.studentId === attendanceData.studentId && 
         a.subjectId === attendanceData.subjectId && 
         a.date === attendanceData.date
  );

  if (existingIndex !== -1) {
    // Update existing record
    localAttendance[existingIndex] = {
      ...localAttendance[existingIndex],
      status: attendanceData.status
    };
  } else {
    // Create new record
    const newRecord: Attendance = {
      ...attendanceData,
      id: Math.random().toString(36).substr(2, 9)
    };
    localAttendance.push(newRecord);
  }
  
  saveData(STORAGE_KEYS.ATTENDANCE, localAttendance);
  // Log attendance batch only once per session or handled by UI? 
  // To avoid spamming logs, we might not log every single student check, 
  // but let's log it generically if needed. Here we keep it silent or add a log.
};

export const getAttendanceByStudent = async (studentId: string): Promise<Attendance[]> => {
  await delay(300);
  return localAttendance.filter(a => a.studentId === studentId);
};

export const getAttendanceBySubjectAndDate = async (subjectId: string, date: string): Promise<Attendance[]> => {
  await delay(300);
  return localAttendance.filter(a => a.subjectId === subjectId && a.date === date);
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
      // Logic: In a real DB, there would be an Enrollment table. 
      // For this mock, we assume ALL students are enrolled in ALL subjects 
      // handled by their teacher, OR we just return all students for demo purposes.
      // To make it cleaner: We verify if the student has grades in this subject or just return all students.
      // Let's return all students in the system as "Enrolled" for simplicity in this proto.
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
