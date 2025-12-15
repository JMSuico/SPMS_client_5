
import React, { useEffect, useState } from 'react';
import { User, Subject } from '../../types';
import { getSubjectsByTeacher, getStudentsByClass, recordAttendance } from '../../services/mockBackend';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AttendanceTrackingProps {
  user: User;
}

const AttendanceTracking: React.FC<AttendanceTrackingProps> = ({ user }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [students, setStudents] = useState<User[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'CUTTING'>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const subs = await getSubjectsByTeacher(user.id);
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubjectId(subs[0].id);
    };
    init();
  }, [user.id]);

  useEffect(() => {
    const loadClass = async () => {
      if (!selectedSubjectId) return;
      setLoading(true);
      const classList = await getStudentsByClass(user.id, selectedSubjectId);
      const uniqueStudents = Array.from(new Set(classList.map(c => c.student)));
      setStudents(uniqueStudents);
      const initialMap: Record<string, any> = {};
      uniqueStudents.forEach(s => { initialMap[s.id] = 'PRESENT'; });
      setAttendanceMap(initialMap);
      setLoading(false);
    };
    loadClass();
  }, [selectedSubjectId, user.id]);

  const handleSubmit = async () => {
      for (const student of students) {
        await recordAttendance({
          studentId: student.id,
          subjectId: selectedSubjectId,
          date: date,
          status: attendanceMap[student.id] as any
        }, user.id);
      }
      alert('Attendance recorded!');
  };

  const graphData = [
      { name: 'Present', value: Object.values(attendanceMap).filter(s => s === 'PRESENT').length, color: '#22c55e' },
      { name: 'Late', value: Object.values(attendanceMap).filter(s => s === 'LATE').length, color: '#84cc16' },
      { name: 'Cutting', value: Object.values(attendanceMap).filter(s => s === 'CUTTING').length, color: '#86efac' },
      { name: 'Absent', value: Object.values(attendanceMap).filter(s => s === 'ABSENT').length, color: '#ef4444' },
  ];

  const inputClass = "w-full px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Tracking</h2>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Subject</label>
          <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className={inputClass}>
            {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.code}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass}/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
             {loading ? <p>Loading...</p> : (
                 <table className="w-full text-left text-sm">
                     <thead className="bg-gray-50 dark:bg-gray-700">
                         <tr><th className="p-3">Student</th><th className="p-3 text-center">Status</th></tr>
                     </thead>
                     <tbody className="divide-y dark:divide-gray-600">
                         {students.map(s => (
                             <tr key={s.id}>
                                 <td className="p-3 dark:text-white">{s.fullName}</td>
                                 <td className="p-3 flex justify-center gap-2">
                                     {['PRESENT', 'LATE', 'CUTTING', 'ABSENT'].map((status) => (
                                         <button
                                            key={status}
                                            onClick={() => setAttendanceMap(prev => ({...prev, [s.id]: status as any}))}
                                            className={`px-2 py-1 text-xs rounded border 
                                                ${attendanceMap[s.id] === status ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-50'}
                                                ${status === 'PRESENT' ? 'bg-green-500 text-white border-green-600' : ''}
                                                ${status === 'LATE' ? 'bg-lime-500 text-white border-lime-600' : ''}
                                                ${status === 'CUTTING' ? 'bg-green-300 text-green-900 border-green-400' : ''}
                                                ${status === 'ABSENT' ? 'bg-red-500 text-white border-red-600' : ''}
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
             )}
             <div className="mt-4 flex justify-end">
                 <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Submit Attendance</button>
             </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center justify-center">
            <h3 className="font-bold mb-4 dark:text-white">Daily Summary</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphData}>
                        <XAxis dataKey="name" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value">
                            {graphData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracking;
