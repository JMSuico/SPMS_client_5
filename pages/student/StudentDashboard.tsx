import React, { useEffect, useState } from 'react';
import { User, Grade, Attendance, Subject } from '../../types';
import { getGradesByStudent, getAttendanceByStudent, getSubjects, updateUser } from '../../services/mockBackend';

interface StudentDashboardProps {
  user: User;
  currentView: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, currentView }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentUser, setCurrentUser] = useState(user);
  
  // Profile Edit State
  const [editProfile, setEditProfile] = useState({ ...user });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const g = await getGradesByStudent(user.id);
      const a = await getAttendanceByStudent(user.id);
      const s = await getSubjects();
      setGrades(g);
      setAttendance(a);
      setSubjects(s);
    };
    loadData();
    const interval = setInterval(loadData, 15000); 
    return () => clearInterval(interval);
  }, [user.id]);

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id;

  const handleUpdateProfile = async () => {
      try {
        await updateUser(editProfile);
        setCurrentUser(editProfile);
        setIsEditing(false);
        alert("Profile updated!");
      } catch (e) {
          alert("Error updating profile");
      }
  };

  const inputClass = "w-full px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:bg-gray-100 disabled:border-none";

  // --- OVERVIEW TAB ---
  const renderOverview = () => {
    const averageGrade = grades.length > 0 ? (grades.reduce((a, b) => a + b.score, 0) / grades.length).toFixed(1) : 'N/A';
    const presentRate = attendance.length > 0 
        ? ((attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100).toFixed(0) 
        : 0;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 border-blue-500">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">GPA (Approx)</p>
                    <p className="text-3xl font-bold dark:text-white mt-1">{averageGrade}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 border-green-500">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Attendance</p>
                    <p className="text-3xl font-bold dark:text-white mt-1">{presentRate}%</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 border-purple-500">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Enrolled Subjects</p>
                    <p className="text-3xl font-bold dark:text-white mt-1">{new Set(grades.map(g=>g.subjectId)).size}</p>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Recent Activity</h3>
                <div className="space-y-3">
                   {attendance.length === 0 && grades.length === 0 && <p className="text-gray-500 text-sm">No recent activity.</p>}
                   {attendance.slice(-3).reverse().map((a, i) => (
                       <div key={i} className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                           <span className={`w-2 h-2 rounded-full ${a.status === 'PRESENT' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                           <span className="dark:text-gray-300">Marked <b>{a.status}</b> in {getSubjectName(a.subjectId)} on {a.date}</span>
                       </div>
                   ))}
                   {grades.slice(-3).reverse().map((g, i) => (
                       <div key={'g'+i} className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                           <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                           <span className="dark:text-gray-300">Received <b>{g.score}</b> in {getSubjectName(g.subjectId)} ({g.term})</span>
                       </div>
                   ))}
                </div>
            </div>
        </div>
    );
  };

  const renderGrades = () => (
      <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Grades</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="p-4 text-sm font-semibold dark:text-gray-200">Subject</th>
                            <th className="p-4 text-sm font-semibold dark:text-gray-200">Assessment</th>
                            <th className="p-4 text-sm font-semibold dark:text-gray-200">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {grades.length === 0 ? (
                            <tr><td colSpan={3} className="p-4 text-center text-gray-500">No grades found.</td></tr>
                        ) : (
                            grades.map(g => (
                                <tr key={g.id}>
                                    <td className="p-4 font-medium dark:text-white">{getSubjectName(g.subjectId)}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">
                                        {g.assessmentName || g.term}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${g.score >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {g.score} {g.maxScore ? `/ ${g.maxScore}` : ''}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      </div>
  );

  const renderAttendance = () => {
    const daysInMonth = 30; 
    const grid = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const getStatusForDay = (day: number) => {
        const record = attendance.find(a => a.date.endsWith(`-${day < 10 ? '0'+day : day}`));
        return record ? record.status : null;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Attendance</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow animate-fade-in">
                <h3 className="text-xl font-bold mb-4 dark:text-white">Calendar View (Current Month)</h3>
                <div className="grid grid-cols-7 gap-2">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                        <div key={d} className="text-center font-bold text-gray-500 text-xs py-2">{d}</div>
                    ))}
                    {grid.map(day => {
                        const status = getStatusForDay(day);
                        let bg = "bg-gray-50 dark:bg-gray-700";
                        if (status === 'PRESENT') bg = "bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200";
                        if (status === 'ABSENT') bg = "bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200";
                        if (status === 'LATE') bg = "bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";

                        return (
                            <div key={day} className={`aspect-square ${bg} rounded-lg flex items-center justify-center relative group`}>
                                <span className="text-sm font-medium">{day}</span>
                                {status && (
                                    <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-current opacity-50"></span>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex flex-wrap gap-4 mt-6 text-sm">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div> Present</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div> Absent</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded"></div> Late</div>
                </div>
            </div>
        </div>
    );
  };

  const renderProfile = () => (
      <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Settings</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-2xl mx-auto animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold dark:text-white">User Details</h3>
                  {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:underline">Edit Credentials</button>
                  )}
              </div>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm text-gray-500 mb-1">User ID (Locked)</label>
                      <input value={editProfile.id} disabled className={inputClass} />
                  </div>
                  <div>
                      <label className="block text-sm text-gray-500 mb-1">Username</label>
                      <input 
                        value={editProfile.username} 
                        onChange={e => setEditProfile({...editProfile, username: e.target.value})}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                  </div>
                  <div>
                      <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                      <input 
                        value={editProfile.fullName} 
                        onChange={e => setEditProfile({...editProfile, fullName: e.target.value})}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                  </div>
                  <div>
                      <label className="block text-sm text-gray-500 mb-1">Email</label>
                      <input 
                        value={editProfile.email} 
                        onChange={e => setEditProfile({...editProfile, email: e.target.value})}
                        disabled={!isEditing}
                        className={inputClass}
                      />
                  </div>
                  {isEditing && (
                      <div className="flex justify-end gap-2 mt-4">
                          <button onClick={() => { setIsEditing(false); setEditProfile(currentUser); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                          <button onClick={handleUpdateProfile} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-[400px]">
       {/* Use switch logic instead of internal state */}
       {currentView === 'grades' && renderGrades()}
       {currentView === 'attendance' && renderAttendance()}
       {currentView === 'profile' && renderProfile()}
       {(currentView === 'dashboard' || currentView === '') && renderOverview()}
    </div>
  );
};

export default StudentDashboard;