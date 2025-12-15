
import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../../types';
import { searchUsers, addUser, updateUser, deleteUser } from '../../services/mockBackend';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<User>({ id: '', username: '', fullName: '', email: '', role: UserRole.STUDENT });

  const fetchUsers = async () => {
    setLoading(true);
    const data = await searchUsers(searchTerm, roleFilter);
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ id: '', username: '', fullName: '', email: '', role: UserRole.STUDENT });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setIsEditMode(true);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
        await deleteUser(id);
        fetchUsers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (isEditMode) {
            await updateUser(formData);
        } else {
            await addUser(formData);
        }
        setIsModalOpen(false);
        fetchUsers();
    } catch (error: any) {
        alert(error.message);
    }
  };

  const inputClass = "w-full px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md"
        >
          + Add User
        </button>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{isEditMode ? 'Edit User' : 'Add New User'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300">User ID</label>
                        <input 
                            required
                            disabled={isEditMode}
                            value={formData.id}
                            onChange={e => setFormData({...formData, id: e.target.value})}
                            className={`${inputClass} disabled:opacity-50`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300">Username</label>
                        <input 
                            required
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300">Full Name</label>
                        <input 
                            required
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300">Email</label>
                        <input 
                            required
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300">Role</label>
                        <select 
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                            className={inputClass}
                        >
                            <option value={UserRole.STUDENT}>Student</option>
                            <option value={UserRole.TEACHER}>Teacher</option>
                            <option value={UserRole.ADMIN}>Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{isEditMode ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search Users</label>
          <input
            type="text"
            placeholder="Search by ID, name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={inputClass}
          >
            <option value="ALL">All Roles</option>
            <option value={UserRole.STUDENT}>Student</option>
            <option value={UserRole.TEACHER}>Teacher</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">ID</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Username</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">{user.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.fullName}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                        user.role === UserRole.TEACHER ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(user)} className="text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 dark:text-red-400 hover:underline">Delete</button>
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
};

export default UserManagement;
