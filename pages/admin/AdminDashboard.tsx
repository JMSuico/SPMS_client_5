import React, { useEffect, useState } from 'react';
import { getSystemStats, getAllUsers, getSubjects } from '../../services/mockBackend';
import { User, UserRole, Subject } from '../../types';
import { exportToCSV } from '../../utils/export';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Overlay State
  const [modalType, setModalType] = useState<'NONE' | 'STUDENTS' | 'TEACHERS' | 'SUBJECTS' | 'RISK'>('NONE');

  useEffect(() => {
    const fetchData = async () => {
      const s = await getSystemStats();
      const u = await getAllUsers();
      const sub = await getSubjects();
      setStats(s);
      setAllUsers(u);
      setAllSubjects(sub);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleExport = () => {
    const reportData = allUsers.map(u => ({
      ID: u.id,
      Username: u.username,
      FullName: u.fullName,
      Role: u.role,
      Email: u.email
    }));
    exportToCSV(reportData, 'system_users_report.csv');
  };

  if (loading) return <div className="p-8">Loading dashboard data...</div>;

  const renderModalContent = () => {
    if (modalType === 'NONE') return null;

    let title = '';
    let content = null;

    if (modalType === 'STUDENTS') {
      title = 'Total Students';
      const students = allUsers.filter(u => u.role === UserRole.STUDENT);
      content = (
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr><th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">Email</th></tr>
          </thead>
          <tbody>
            {students.map(s => <tr key={s.id} className="border-b dark:border-gray-700"><td className="p-2">{s.id}</td><td className="p-2">{s.fullName}</td><td className="p-2">{s.email}</td></tr>)}
          </tbody>
        </table>
      );
    } else if (modalType === 'TEACHERS') {
      title = 'Total Teachers';
      const teachers = allUsers.filter(u => u.role === UserRole.TEACHER);
      content = (
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr><th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">Email</th></tr>
          </thead>
          <tbody>
            {teachers.map(s => <tr key={s.id} className="border-b dark:border-gray-700"><td className="p-2">{s.id}</td><td className="p-2">{s.fullName}</td><td className="p-2">{s.email}</td></tr>)}
          </tbody>
        </table>
      );
    } else if (modalType === 'SUBJECTS') {
      title = 'Active Subjects';
      content = (
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
             <tr><th className="p-2">Code</th><th className="p-2">Name</th><th className="p-2">Teacher ID</th></tr>
          </thead>
          <tbody>
            {allSubjects.map(s => <tr key={s.id} className="border-b dark:border-gray-700"><td className="p-2">{s.code}</td><td className="p-2">{s.name}</td><td className="p-2">{s.teacherId}</td></tr>)}
          </tbody>
        </table>
      );
    } else if (modalType === 'RISK') {
      title = 'At-Risk Alerts';
      content = (
        <div className="space-y-2">
            {stats.atRiskStudents && stats.atRiskStudents.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-red-50 dark:bg-red-900/20">
                    <tr><th className="p-2">ID</th><th className="p-2">Name</th><th className="p-2">Status</th></tr>
                  </thead>
                  <tbody>
                    {stats.atRiskStudents.map((s: User) => (
                      <tr key={s.id} className="border-b dark:border-gray-700">
                          <td className="p-2">{s.id}</td>
                          <td className="p-2">{s.fullName}</td>
                          <td className="p-2 text-red-600 font-bold">Low Performance</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            ) : <p>No at-risk students detected.</p>}
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
            <button onClick={() => setModalType('NONE')} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="p-6 overflow-y-auto">
            {content}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl flex justify-end">
             <button onClick={() => setModalType('NONE')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition">Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderModalContent()}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">System Overview</h2>
        <button 
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition shadow-md w-full sm:w-auto"
        >
          Export Report
        </button>
      </div>
      
      {/* Stats Cards - Clickable Overlays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div 
            onClick={() => setModalType('STUDENTS')}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-blue-500 transition duration-200 group"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">{stats.totalStudents}</p>
        </div>

        <div 
            onClick={() => setModalType('TEACHERS')}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-green-500 transition duration-200 group"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Teachers</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 group-hover:scale-105 transition-transform">{stats.totalTeachers}</p>
        </div>

        <div 
            onClick={() => setModalType('SUBJECTS')}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-purple-500 transition duration-200 group"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Subjects</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">{stats.totalSubjects}</p>
        </div>

        <div 
            onClick={() => setModalType('RISK')}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-red-500 transition duration-200 group"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">At-Risk Alerts</p>
          <p className="text-3xl font-bold text-red-500 dark:text-red-400 group-hover:scale-105 transition-transform">{stats.activeAlerts}</p>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
         <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Welcome to the Admin Dashboard</h3>
         <p className="text-blue-600 dark:text-blue-400 text-sm leading-relaxed">
            Click on any of the summary cards above to view detailed lists and manage records.
            Use the sidebar to navigate to User Management for full CRUD operations.
         </p>
      </div>
    </div>
  );
};

export default AdminDashboard;