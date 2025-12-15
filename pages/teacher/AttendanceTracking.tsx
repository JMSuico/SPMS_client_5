import React, { useEffect, useState } from 'react';
import { User, Subject } from '../../types';
import { getSubjectsByTeacher, getStudentsByClass, recordAttendance, getAttendanceBySubjectAndDate } from '../../services/mockBackend';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AttendanceTrackingProps {
  user: User;
}

const AttendanceTracking: React.FC<AttendanceTrackingProps> = ({ user }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [students, setStudents] = useState<User[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // 'PRESENT' | 'ABSENT' | 'LATE' | 'CUTTING'
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Init Subjects
  useEffect(() => {
    const init = async () => {
      const subs = await getSubjectsByTeacher(user.id);
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubjectId(subs[0].id);
    };
    init();
  }, [user.id]);

  // 2. Load Class List AND Existing Attendance
  useEffect(() => {
    const loadClassAndAttendance = async () => {
      if (!selectedSubjectId) return;
      setLoading(true);

      try {
        // A. Get Students in this class
        const classList = await getStudentsByClass(user.id, selectedSubjectId);
        const uniqueStudents = Array.from(new Set(classList.map(c => c.student)));
        setStudents(uniqueStudents);

        // B. Get Existing Attendance for this Date & Subject
        const existingRecords = await getAttendanceBySubjectAndDate(selectedSubjectId, date);

        // C. Build the Map
        const newMap: Record<string, string> = {};
        uniqueStudents.forEach(s => {
          const record = existingRecords.find(r => r.studentId === s.id);
          // Default to 'PRESENT' if no record exists yet
          newMap[s.id] = record ? record.status : 'PRESENT';
        });

        setAttendanceMap(newMap);
      } catch (error) {
        console.error("Error loading attendance data", error);
      } finally {
        setLoading(false);
      }
    };

    loadClassAndAttendance();
  }, [selectedSubjectId, date, user.id]);

  const handleSubmit = async () => {
      setIsSaving(true);
      try {
        for (const student of students) {
          await recordAttendance({
            studentId: student.id,
            subjectId: selectedSubjectId,
            date: date,
            status: attendanceMap[student.id] as any
          }, user.id);
        }
        alert('Attendance saved successfully!');
      } catch (e) {
        alert('Failed to save attendance.');
      } finally {
        setIsSaving(false);
      }
  };

  const graphData = [
      { name: 'Present', value: Object.values(attendanceMap).filter(s => s === 'PRESENT').length, color: '#22c55e' },
      { name: 'Late', value: Object.values(attendanceMap).filter(s => s === 'LATE').length, color: '#eab308' }, // Changed to yellow
      { name: 'Cutting', value: Object.values(attendanceMap).filter(s => s === 'CUTTING').length, color: '#86efac' },
      { name: 'Absent', value: Object.values(attendanceMap).filter(s => s === 'ABSENT').length, color: '#ef4444' },
  ];

  const inputClass = "w-full px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Tracking</h2>
        {isSaving && <span className="text-blue-600 font-medium animate-pulse">Saving changes...</span>}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Select Subject</label>
          <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className={inputClass}>
            {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Select Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass}/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
             {loading ? <div className="p-8 text-center text-gray-500">Loading class roster...</div> : (
                 <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr><th className="p-3 dark:text-gray-200">Student Name</th><th className="p-3 text-center dark:text-gray-200">Mark Status</th></tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-600">
                            {students.length === 0 && <tr><td colSpan={2} className="p-4 text-center text-gray-500">No students enrolled.</td></tr>}
                            {students.map(s => (
                                <tr key={s.id}>
                                    <td className="p-3 dark:text-white font-medium">{s.fullName}</td>
                                    <td className="p-3 flex justify-center gap-2 flex-wrap">
                                        {['PRESENT', 'LATE', 'CUTTING', 'ABSENT'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setAttendanceMap(prev => ({...prev, [s.id]: status}))}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200
                                                    ${attendanceMap[s.id] === status ? 'ring-2 ring-offset-1 ring-blue-400 dark:ring-offset-gray-800 scale-105' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}
                                                    ${status === 'PRESENT' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100' : ''}
                                                    ${status === 'LATE' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100' : ''}
                                                    ${status === 'CUTTING' ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-100' : ''}
                                                    ${status === 'ABSENT' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-100' : ''}
                                                `}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
                  <div className="mt-6 flex justify-between items-center border-t pt-4 dark:border-gray-700">
                      <p className="text-xs text-gray-500">Changes are not final until saved.</p>
                      <button 
                        onClick={handleSubmit} 
                        disabled={isSaving || students.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {isSaving ? 'Saving...' : 'Save Attendance'}
                      </button>
                  </div>
                 </>
             )}
        </div>

        {/* Summary Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center justify-center">
            <h3 className="font-bold mb-4 dark:text-white">Daily Summary</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphData}>
                        <XAxis dataKey="name" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {graphData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div> Present: <b>{graphData[0].value}</b></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded"></div> Late: <b>{graphData[1].value}</b></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-300 rounded"></div> Cutting: <b>{graphData[2].value}</b></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div> Absent: <b>{graphData[3].value}</b></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracking;