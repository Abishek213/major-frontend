import React, { useState } from 'react';
import { Bell, Moon, Shield, User, Mail, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const UserSettings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    marketingEmails: false
  });

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className={`min-h-screen pt-20 px-4 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        
        <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="p-4 border-b border-inherit">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <User className="h-5 w-5" />
              Account Settings
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                <span>Dark Mode</span>
              </div>
              <button 
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full relative ${isDarkMode ? 'bg-purple-600' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isDarkMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span>Email Address</span>
              </div>
              <button className="text-blue-600 hover:underline">Change</button>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span>Password</span>
              </div>
              <button className="text-blue-600 hover:underline">Update</button>
            </div>
          </div>
        </div>

        <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="p-4 border-b border-inherit">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries({
              emailNotifications: 'Email Notifications',
              pushNotifications: 'Push Notifications',
              eventReminders: 'Event Reminders',
              marketingEmails: 'Marketing Emails'
            }).map(([key, label]) => (
              <div key={key} className="flex justify-between items-center">
                <span>{label}</span>
                <button
                  onClick={() => handleNotificationChange(key)}
                  className={`w-12 h-6 rounded-full relative ${
                    notificationSettings[key] ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                    notificationSettings[key] ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="p-4 border-b border-inherit">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </h2>
          </div>
          <div className="p-6">
            <button className="w-full py-2 text-red-500 hover:text-red-600">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;