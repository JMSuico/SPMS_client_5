import React, { useEffect, useState } from 'react';
import { User, Subject } from '../../types';
import { getSubjectsByTeacher, requestSubject } from '../../services/mockBackend';

interface TeacherDashboardProps {
  user: User;
  setView: (view: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, setView }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');

  const loadData = async () => {
    const data = await getSubjectsByTeacher(user.id);
    setSubjects(data);
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const handleRequestSubject = async (e: React.FormEvent) => {
      e.preventDefault();
      await requestSubject(user.id, newSubName, newSubCode);
      setIsModalOpen(false);
      setNewSubName('');
      setNewSubCode('');
      loadData();
      alert("Subject requested successfully!");
  };

  const inputClass = "w-full px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Teacher Dashboard</h2>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-xl">
                  <h3 className="text-lg font-bold mb-4 dark:text-white">Request New Subject</h3>
                  <form onSubmit={handleRequestSubject} className="space-y-4">
                      <input 
                        placeholder="Subject Code (e.g. MATH101)" 
                        required 
                        value={newSubCode}
                        onChange={e => setNewSubCode(e.target.value)}
                        className={inputClass}
                      />
                      <input 
                        placeholder="Subject Name" 
                        required 
                        value={newSubName}
                        onChange={e => setNewSubName(e.target.value)}
                        className={inputClass}
                      />
                      <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Request</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => (
          <div key={sub.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-semibold">
                  {sub.code}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{sub.name}</h3>
            </div>
            
            <div className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-4">
              <button 
                onClick={() => setView('grading')}
                className="flex-1 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded text-sm font-medium transition"
              >
                Grades
              </button>
              <button 
                onClick={() => setView('students')}
                className="flex-1 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded text-sm font-medium transition"
              >
                Students
              </button>
            </div>
          </div>
        ))}
        
        {/* Request Subject Card */}
        <div 
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition cursor-pointer h-full min-h-[200px]"
        >
          <span className="text-3xl mb-2">+</span>
          <span className="font-medium text-center">Request New Subject</span>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;