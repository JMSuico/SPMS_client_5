
import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/mockBackend';
import { SystemSettings as SettingsType } from '../../types';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const s = await getSettings();
      setSettings(s);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleChange = (field: keyof SettingsType, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleSave = async () => {
    if (settings) {
      await updateSettings(settings);
      alert("System settings saved successfully!");
    }
  };

  if (loading || !settings) return <div className="p-6">Loading settings...</div>;

  const inputClass = "w-full px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500";
  const selectClass = "w-full px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">System Settings</h2>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
        
        {/* General Settings */}
        <div>
           <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">General Settings</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">System Name</label>
               <input 
                  type="text" 
                  value={settings.systemName} 
                  onChange={(e) => handleChange('systemName', e.target.value)}
                  className={inputClass}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Theme Color</label>
               <select 
                  value={settings.themeColor}
                  onChange={(e) => handleChange('themeColor', e.target.value)}
                  className={selectClass}
               >
                 <option value="blue">Blue</option>
                 <option value="purple">Purple</option>
                 <option value="teal">Teal</option>
               </select>
             </div>
           </div>
        </div>

        {/* Policies & Security */}
        <div>
           <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Policies & Security</h3>
           <div className="space-y-6">
             
             {/* Maintenance Mode */}
             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700">
                <div>
                   <p className="font-medium text-gray-800 dark:text-gray-200">Maintenance Mode</p>
                   <p className="text-xs text-gray-500">Prevent non-admin users from logging in.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
             </div>

             {/* Allow Registration */}
             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700">
                <div>
                   <p className="font-medium text-gray-800 dark:text-gray-200">Allow Public Registration</p>
                   <p className="text-xs text-gray-500">If disabled, only admins can create users.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.allowRegistration} onChange={(e) => handleChange('allowRegistration', e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Grade Modification Window (Days)</label>
               <input 
                  type="number" 
                  value={settings.gradeModificationWindow} 
                  onChange={(e) => handleChange('gradeModificationWindow', Number(e.target.value))}
                  className={`${inputClass} max-w-xs`}
               />
               <p className="text-xs text-gray-500 mt-1">Number of days teachers can edit grades after submission.</p>
             </div>
           </div>
        </div>

        <div className="pt-4 flex justify-end">
            <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-md">
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
