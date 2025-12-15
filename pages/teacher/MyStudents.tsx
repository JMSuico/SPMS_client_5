
import React, { useEffect, useState } from 'react';
import { User, Subject, UserRole } from '../../types';
import { getSubjectsByTeacher, getStudentsByClass, updateUser } from '../../services/mockBackend';

interface MyStudentsProps {
  user: User;
}

const MyStudents: React.FC<MyStudentsProps> = ({ user }) => {
  const [students, setStudents] = useState<{ student: User, subject: Subject }[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);

  const init = async () => {
      const stus = await getStudentsByClass(user.id);
      setStudents(stus);
  };

  useEffect(() => { init(); }, [user.id]);

  const handleUpdate = async () => {
      if(editUser) {
          await updateUser(editUser);
          setEditUser(null);
          init();
          alert("Student updated");
      }
  };

  const inputClass = "w-full px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Students</h2>

      {editUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96 shadow-xl">
                  <h3 className="text-lg font-bold mb-4 dark:text-white">Edit Student</h3>
                  <div className="space-y-3">
                      <div>
                          <label className="text-xs text-gray-500">ID (Read Only)</label>
                          <input value={editUser.id} disabled className="w-full border border-gray-200 p-2 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-500">Full Name</label>
                          <input value={editUser.fullName} onChange={e => setEditUser({...editUser, fullName: e.target.value})} className={inputClass} />
                      </div>
                      <div>
                          <label className="text-xs text-gray-500">Email</label>
                          <input value={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})} className={inputClass} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                          <button onClick={() => setEditUser(null)} className="px-4 py-2 text-gray-500">Cancel</button>
                          <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 dark:text-gray-200">Name</th>
                <th className="px-6 py-4 dark:text-gray-200">ID</th>
                <th className="px-6 py-4 dark:text-gray-200">Email</th>
                <th className="px-6 py-4 dark:text-gray-200">Subject</th>
                <th className="px-6 py-4 dark:text-gray-200">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-600">
              {students.map((item, i) => (
                  <tr key={i}>
                      <td className="px-6 py-4 dark:text-white font-medium">{item.student.fullName}</td>
                      <td className="px-6 py-4 text-gray-500">{item.student.id}</td>
                      <td className="px-6 py-4 text-gray-500">{item.student.email}</td>
                      <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{item.subject.code}</span></td>
                      <td className="px-6 py-4">
                          <button onClick={() => setEditUser(item.student)} className="text-blue-600 hover:underline">Edit</button>
                      </td>
                  </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default MyStudents;
