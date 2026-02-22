import React, { useState } from "react";
import { Bell, Moon, Shield, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const UserSettings = () => {
  const { user, toggleSubscription } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: user?.preferences?.notifications?.email ?? true,
    pushNotifications: user?.preferences?.notifications?.push ?? true,
    eventReminders: user?.preferences?.notifications?.eventReminders ?? true,
    marketingEmails: user?.emailSubscribed ?? true, // linked to subscription
  });

  const handleNotificationChange = (setting) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
    // Here you could also call updatePreferences from useAuth
  };

  const handleSubscriptionToggle = async () => {
    const newVal = !notificationSettings.marketingEmails;
    setNotificationSettings((prev) => ({ ...prev, marketingEmails: newVal }));
    await toggleSubscription(newVal);
  };

  return (
    <div className="min-h-screen pt-28 px-4 bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        {/* Account Settings */}
        <div className="rounded-lg border bg-white border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
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
              <button className="w-12 h-6 rounded-full relative bg-gray-200">
                <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all left-1" />
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

            {/* Verification statuses */}
            <div className="flex justify-between items-center">
              <span>Email Verified</span>
              <span
                className={
                  user?.isEmailVerified ? "text-green-600" : "text-red-600"
                }
              >
                {user?.isEmailVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Mobile Verified</span>
              <span
                className={
                  user?.isMobileVerified ? "text-green-600" : "text-red-600"
                }
              >
                {user?.isMobileVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-lg border bg-white border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries({
              emailNotifications: "Email Notifications",
              pushNotifications: "Push Notifications",
              eventReminders: "Event Reminders",
              marketingEmails: "Email Newsletter",
            }).map(([key, label]) => (
              <div key={key} className="flex justify-between items-center">
                <span>{label}</span>
                {key === "marketingEmails" ? (
                  <button
                    onClick={handleSubscriptionToggle}
                    className={`w-12 h-6 rounded-full relative ${
                      notificationSettings[key]
                        ? "bg-purple-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                        notificationSettings[key] ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => handleNotificationChange(key)}
                    className={`w-12 h-6 rounded-full relative ${
                      notificationSettings[key]
                        ? "bg-purple-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                        notificationSettings[key] ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="rounded-lg border bg-white border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
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
