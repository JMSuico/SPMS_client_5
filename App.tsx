import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { addLog } from './services/mockBackend';

// Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AuditLogs from './pages/admin/AuditLogs';
import SystemSettings from './pages/admin/SystemSettings';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import GradeEncoding from './pages/teacher/GradeEncoding';
import AttendanceTracking from './pages/teacher/AttendanceTracking';
import MyStudents from './pages/teacher/MyStudents';
import StudentDashboard from './pages/student/StudentDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Log system start/refresh
  useEffect(() => {
    addLog('SYSTEM', 'SYSTEM_START', 'Application loaded or refreshed');
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    if (user) {
      addLog(user.id, 'LOGOUT', `User ${user.username} logged out`);
    }
    setUser(null);
    setCurrentView('dashboard');
    setIsSidebarOpen(false);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    // Admin Routes
    if (user.role === UserRole.ADMIN) {
      if (currentView === 'dashboard') return <AdminDashboard />;
      if (currentView === 'users') return <UserManagement />;
      if (currentView === 'logs') return <AuditLogs />;
      if (currentView === 'settings') return <SystemSettings />;
    }

    // Teacher Routes
    if (user.role === UserRole.TEACHER) {
      if (currentView === 'dashboard') return <TeacherDashboard user={user} setView={setCurrentView} />;
      if (currentView === 'students') return <MyStudents user={user} />;
      if (currentView === 'grading') return <GradeEncoding user={user} />;
      if (currentView === 'attendance') return <AttendanceTracking user={user} />;
    }

    // Student Routes
    if (user.role === UserRole.STUDENT) {
      return <StudentDashboard user={user} currentView={currentView} />;
    }
    
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        <h3 className="text-xl font-medium">Page Under Construction</h3>
        <p>The {currentView} module is not yet implemented in this preview.</p>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      {/* Navbar - Fixed Height */}
      <div className="flex-none">
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
      </div>
      
      {/* Main Layout Container - Takes remaining height */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Sidebar - Fixed width on Desktop, Overlay on Mobile */}
        <Sidebar 
          role={user.role} 
          currentView={currentView} 
          setView={setCurrentView}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        {/* Main Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto w-full relative scroll-smooth">
          <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8 min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;