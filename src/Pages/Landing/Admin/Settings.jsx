import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { 
  Bell, 
  Shield, 
  Mail, 
  Key, 
  Globe, 
  Database,
  Save,
  Lock,
  Clock,
  AlertTriangle
} from 'lucide-react';

const Settings = ({ isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  
  // Form states
  const [settings, setSettings] = useState({
    siteName: 'EventA',
    siteUrl: 'https://eventa.com',
    adminEmail: 'admin@eventa.com',
    maxEventsPerUser: '10',
    autoApproveEvents: false,
    requireEmailVerification: true,
    maintenanceMode: false,
    backupFrequency: 'daily',
    notifyOnNewEvent: true,
    notifyOnNewUser: true,
    retentionDays: '30',
    maxFileSize: '10',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Settings saved:', settings);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'general',
      label: 'General Settings',
      icon: Globe,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Site Name</label>
            <input
              type="text"
              name="siteName"
              value={settings.siteName}
              onChange={handleInputChange}
              className={`w-full p-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Site URL</label>
            <input
              type="url"
              name="siteUrl"
              value={settings.siteUrl}
              onChange={handleInputChange}
              className={`w-full p-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Admin Email</label>
            <input
              type="email"
              name="adminEmail"
              value={settings.adminEmail}
              onChange={handleInputChange}
              className={`w-full p-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>
      )
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Require Email Verification</label>
              <p className="text-sm opacity-70">New users must verify their email before accessing the platform</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className={`
                w-11 h-6 rounded-full peer 
                peer-checked:bg-blue-600
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-white after:rounded-full after:h-5 after:w-5 
                after:transition-all peer-checked:after:translate-x-full
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
              `}></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Data Retention (days)</label>
            <input
              type="number"
              name="retentionDays"
              value={settings.retentionDays}
              onChange={handleInputChange}
              className={`w-full p-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">New Event Notifications</label>
              <p className="text-sm opacity-70">Receive notifications when new events are created</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="notifyOnNewEvent"
                checked={settings.notifyOnNewEvent}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className={`
                w-11 h-6 rounded-full peer 
                peer-checked:bg-blue-600
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-white after:rounded-full after:h-5 after:w-5 
                after:transition-all peer-checked:after:translate-x-full
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
              `}></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">New User Notifications</label>
              <p className="text-sm opacity-70">Receive notifications when new users register</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="notifyOnNewUser"
                checked={settings.notifyOnNewUser}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className={`
                w-11 h-6 rounded-full peer 
                peer-checked:bg-blue-600
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-white after:rounded-full after:h-5 after:w-5 
                after:transition-all peer-checked:after:translate-x-full
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
              `}></div>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'system',
      label: 'System',
      icon: Database,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Maintenance Mode</label>
              <p className="text-sm opacity-70">Enable maintenance mode to prevent user access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className={`
                w-11 h-6 rounded-full peer 
                peer-checked:bg-blue-600
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-white after:rounded-full after:h-5 after:w-5 
                after:transition-all peer-checked:after:translate-x-full
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
              `}></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Backup Frequency</label>
            <select
              name="backupFrequency"
              value={settings.backupFrequency}
              onChange={handleInputChange}
              className={`w-full p-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Max File Size (MB)</label>
            <input
              type="number"
              name="maxFileSize"
              value={settings.maxFileSize}
              onChange={handleInputChange}
              className={`w-full p-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`grid grid-cols-4 gap-6`}>
        {/* Settings Navigation */}
        <div className="col-span-1">
          <nav>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center gap-2 p-3 mb-2 rounded-lg transition-all
                  ${activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="col-span-3">
          <div className={`p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow`}>
            <form onSubmit={handleSubmit}>
              {sections.find(s => s.id === activeSection)?.content}
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-blue-600 hover:bg-blue-700 text-white
                    transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;