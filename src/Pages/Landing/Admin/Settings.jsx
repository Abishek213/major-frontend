import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  Settings as SettingsIcon,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  XCircle,
  Brain,
  Bot,
  Sparkles,
  Gauge,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Upload,
  Filter,
  Eye,
  EyeOff,
  Cpu,
  Network,
  HardDrive,
  Cloud,
  Server,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Code,
  Terminal,
  Wifi,
  WifiOff,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  ChevronRight,
  Tag,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import AIBadge from '../../../components/ai/AIBadge';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [aiConfigExpanded, setAiConfigExpanded] = useState(true);
  const [testResult, setTestResult] = useState(null);
  
  // Add missing UI state for expanded sections
  const [ui, setUi] = useState({
    fraudExpanded: false,
    analyticsExpanded: false,
    sentimentExpanded: false,
    organizerExpanded: false
  });
  
  // Form states
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'e-VENTA',
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
    sessionTimeout: '60', // Add session timeout to settings state
    
    // AI Agent Settings
    aiAgents: {
      enabled: true,
      fraudDetection: {
        enabled: true,
        autoBlock: true,
        riskThreshold: 0.7,
        sensitivity: 'medium',
        notifyOnAlert: true,
        scanFrequency: 'realtime',
        maxAlertsPerDay: 100
      },
      analytics: {
        enabled: true,
        predictionConfidence: 0.8,
        generateReports: true,
        reportFrequency: 'daily',
        trackTrends: true,
        retentionPeriod: 90,
        exportData: true
      },
      sentiment: {
        enabled: true,
        analyzeReviews: true,
        detectToxicity: true,
        autoModerate: false,
        toxicityThreshold: 0.7,
        generateInsights: true,
        insightFrequency: 'weekly'
      },
      organizer: {
        enabled: true,
        priceSuggestions: true,
        tagRecommendations: true,
        capacityPlanning: true,
        dateOptimization: true,
        competitorAnalysis: true
      }
    },
    
    // Performance Settings
    performance: {
      cacheEnabled: true,
      cacheDuration: 3600,
      compressionEnabled: true,
      lazyLoading: true,
      prefetchData: true,
      maxConcurrentRequests: 10
    },
    
    // API Settings
    api: {
      rateLimit: 100,
      rateLimitWindow: 60,
      maxRequestSize: 10,
      enableCaching: true,
      logLevel: 'info',
      debugMode: false
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleNestedChange = (category, field, value, isCheckbox = false) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: isCheckbox ? !prev[category][field] : value
      }
    }));
  };

  // Handle UI state changes for expanded sections
  const handleUiChange = (section) => {
    setUi(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Settings saved:', settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAI = async (agent) => {
    setTestResult({ agent, status: 'testing' });
    
    // Simulate AI test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setTestResult({
      agent,
      status: 'success',
      message: `${agent} agent is working correctly`,
      latency: Math.floor(Math.random() * 200 + 50),
      confidence: Math.floor(Math.random() * 15 + 85)
    });
    
    setTimeout(() => setTestResult(null), 3000);
  };

  const sections = [
    {
      id: 'general',
      label: 'General Settings',
      icon: Globe,
      description: 'Basic system configuration and site information',
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              name="siteName"
              value={settings.siteName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">The name displayed across your platform</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
            <input
              type="url"
              name="siteUrl"
              value={settings.siteUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Your platform's base URL for links and redirects</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
            <input
              type="email"
              name="adminEmail"
              value={settings.adminEmail}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Primary email for system notifications</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Events Per User</label>
            <input
              type="number"
              name="maxEventsPerUser"
              value={settings.maxEventsPerUser}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum number of events a user can create</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
            <div>
              <label className="font-medium text-gray-800">Auto-approve Events</label>
              <p className="text-sm text-gray-600">Events are automatically approved without admin review</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="autoApproveEvents"
                checked={settings.autoApproveEvents}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-12 h-6 rounded-full peer bg-gray-300 peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500 after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-6"></div>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'aiAgents',
      label: 'AI Agents',
      icon: Brain,
      description: 'Configure AI agents and automation settings',
      content: (
        <div className="space-y-8">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">AI Agents Status</h3>
                <p className="text-white/80 text-sm">Enable or disable all AI agents globally</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.aiAgents.enabled}
                onChange={() => handleNestedChange('aiAgents', 'enabled', null, true)}
                className="sr-only peer"
              />
              <div className="w-16 h-8 rounded-full bg-white/30 peer-checked:bg-white after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-8"></div>
            </label>
          </div>

          {settings.aiAgents.enabled && (
            <>
              {/* Fraud Detection Agent */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-50 to-rose-50 p-6 cursor-pointer hover:from-red-100 hover:to-rose-100 transition-colors"
                  onClick={() => handleUiChange('fraudExpanded')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          Fraud Detection Agent
                          <AIBadge type="admin" agent="fraud" />
                        </h4>
                        <p className="text-sm text-gray-600">Real-time fraud monitoring and threat detection</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestAI('Fraud Detection');
                        }}
                        className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Test Agent
                      </button>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${ui.fraudExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
                
                {ui.fraudExpanded && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="font-medium text-gray-700">Enable Agent</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.aiAgents.fraudDetection.enabled}
                              onChange={() => handleNestedChange('aiAgents', 'fraudDetection.enabled', null, true)}
                              className="sr-only peer"
                            />
                            <div className="w-12 h-6 rounded-full bg-gray-300 peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-rose-500 after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-6"></div>
                          </label>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Risk Threshold</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={settings.aiAgents.fraudDetection.riskThreshold}
                                onChange={(e) => handleNestedChange('aiAgents', 'fraudDetection.riskThreshold', parseFloat(e.target.value))}
                                className="flex-1"
                              />
                              <span className="text-sm font-bold text-gray-700 w-12">
                                {(settings.aiAgents.fraudDetection.riskThreshold * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sensitivity</label>
                            <select
                              value={settings.aiAgents.fraudDetection.sensitivity}
                              onChange={(e) => handleNestedChange('aiAgents', 'fraudDetection.sensitivity', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-200"
                            >
                              <option value="low">Low (Fewer alerts)</option>
                              <option value="medium">Medium (Balanced)</option>
                              <option value="high">High (Maximum detection)</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Auto-block high risk</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.aiAgents.fraudDetection.autoBlock}
                                onChange={() => handleNestedChange('aiAgents', 'fraudDetection.autoBlock', null, true)}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 rounded-full bg-gray-300 peer-checked:bg-red-500 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h5 className="font-medium text-gray-700 mb-3">Current Stats</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Alerts today</span>
                            <span className="font-medium text-gray-900">23</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Blocked transactions</span>
                            <span className="font-medium text-gray-900">12</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">False positives</span>
                            <span className="font-medium text-gray-900">3 (13%)</span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Effectiveness</span>
                              <span className="text-sm font-bold text-green-600">94%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Analytics Agent */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 cursor-pointer hover:from-blue-100 hover:to-cyan-100 transition-colors"
                  onClick={() => handleUiChange('analyticsExpanded')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          Analytics Agent
                          <AIBadge type="admin" agent="analytics" />
                        </h4>
                        <p className="text-sm text-gray-600">Platform-wide data analysis and trend reporting</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestAI('Analytics');
                        }}
                        className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Test Agent
                      </button>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${ui.analyticsExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
                
                {ui.analyticsExpanded && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="font-medium text-gray-700">Enable Agent</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.aiAgents.analytics.enabled}
                              onChange={() => handleNestedChange('aiAgents', 'analytics.enabled', null, true)}
                              className="sr-only peer"
                            />
                            <div className="w-12 h-6 rounded-full bg-gray-300 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500 after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-6"></div>
                          </label>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Prediction Confidence</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="0.5"
                                max="0.95"
                                step="0.05"
                                value={settings.aiAgents.analytics.predictionConfidence}
                                onChange={(e) => handleNestedChange('aiAgents', 'analytics.predictionConfidence', parseFloat(e.target.value))}
                                className="flex-1"
                              />
                              <span className="text-sm font-bold text-gray-700 w-12">
                                {(settings.aiAgents.analytics.predictionConfidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Report Frequency</label>
                            <select
                              value={settings.aiAgents.analytics.reportFrequency}
                              onChange={(e) => handleNestedChange('aiAgents', 'analytics.reportFrequency', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-200"
                            >
                              <option value="hourly">Hourly</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Export data enabled</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.aiAgents.analytics.exportData}
                                onChange={() => handleNestedChange('aiAgents', 'analytics.exportData', null, true)}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 rounded-full bg-gray-300 peer-checked:bg-blue-500 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h5 className="font-medium text-gray-700 mb-3">Analytics Stats</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Reports generated</span>
                            <span className="font-medium text-gray-900">156</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Predictions accuracy</span>
                            <span className="font-medium text-green-600">87%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Data points analyzed</span>
                            <span className="font-medium text-gray-900">1.2M</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sentiment Agent */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-colors"
                  onClick={() => handleUiChange('sentimentExpanded')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          Sentiment Agent
                          <AIBadge type="admin" agent="sentiment" />
                        </h4>
                        <p className="text-sm text-gray-600">Review sentiment analysis and toxicity detection</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestAI('Sentiment');
                        }}
                        className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Test Agent
                      </button>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${ui.sentimentExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
                
                {ui.sentimentExpanded && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="font-medium text-gray-700">Enable Agent</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.aiAgents.sentiment.enabled}
                              onChange={() => handleNestedChange('aiAgents', 'sentiment.enabled', null, true)}
                              className="sr-only peer"
                            />
                            <div className="w-12 h-6 rounded-full bg-gray-300 peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-6"></div>
                          </label>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Toxicity Threshold</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="0.5"
                                max="0.95"
                                step="0.05"
                                value={settings.aiAgents.sentiment.toxicityThreshold}
                                onChange={(e) => handleNestedChange('aiAgents', 'sentiment.toxicityThreshold', parseFloat(e.target.value))}
                                className="flex-1"
                              />
                              <span className="text-sm font-bold text-gray-700 w-12">
                                {(settings.aiAgents.sentiment.toxicityThreshold * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Insight Frequency</label>
                            <select
                              value={settings.aiAgents.sentiment.insightFrequency}
                              onChange={(e) => handleNestedChange('aiAgents', 'sentiment.insightFrequency', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-200"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Auto-moderate toxic content</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.aiAgents.sentiment.autoModerate}
                                onChange={() => handleNestedChange('aiAgents', 'sentiment.autoModerate', null, true)}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 rounded-full bg-gray-300 peer-checked:bg-purple-500 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h5 className="font-medium text-gray-700 mb-3">Sentiment Stats</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Reviews analyzed</span>
                            <span className="font-medium text-gray-900">8,547</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Toxic content flagged</span>
                            <span className="font-medium text-gray-900">234</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg sentiment</span>
                            <span className="font-medium text-green-600">0.78</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Organizer Agent */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-colors"
                  onClick={() => handleUiChange('organizerExpanded')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          Organizer Agent
                          <AIBadge type="admin" agent="organizer" />
                        </h4>
                        <p className="text-sm text-gray-600">Event planning and optimization assistance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestAI('Organizer');
                        }}
                        className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Test Agent
                      </button>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${ui.organizerExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
                
                {ui.organizerExpanded && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 mb-1">Price Suggestions</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.aiAgents.organizer.priceSuggestions}
                            onChange={() => handleNestedChange('aiAgents', 'organizer.priceSuggestions', null, true)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 rounded-full bg-gray-300 peer-checked:bg-green-500 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                      </div>
                      
                      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-2">
                          <Tag className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 mb-1">Tag Recommendations</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.aiAgents.organizer.tagRecommendations}
                            onChange={() => handleNestedChange('aiAgents', 'organizer.tagRecommendations', null, true)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 rounded-full bg-gray-300 peer-checked:bg-blue-500 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                      </div>
                      
                      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-2">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 mb-1">Capacity Planning</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.aiAgents.organizer.capacityPlanning}
                            onChange={() => handleNestedChange('aiAgents', 'organizer.capacityPlanning', null, true)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 rounded-full bg-gray-300 peer-checked:bg-purple-500 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                      </div>
                      
                      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-2">
                          <Calendar className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 mb-1">Date Optimization</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.aiAgents.organizer.dateOptimization}
                            onChange={() => handleNestedChange('aiAgents', 'organizer.dateOptimization', null, true)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 rounded-full bg-gray-300 peer-checked:bg-amber-500 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )
    },
    {
      id: 'security',
      label: 'Security Settings',
      icon: Shield,
      description: 'Security policies and data protection',
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <label className="font-medium text-gray-800">Require Email Verification</label>
                <p className="text-sm text-gray-600">New users must verify their email before accessing the platform</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-12 h-6 rounded-full peer bg-gray-300 peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-500 after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-6"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
              <input
                type="number"
                name="retentionDays"
                value={settings.retentionDays}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">How long to keep user data before automatic deletion</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">User session duration before automatic logout</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'System alerts and notification preferences',
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <label className="font-medium text-gray-800">New Event Notifications</label>
                <p className="text-sm text-gray-600">Receive notifications when new events are created</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="notifyOnNewEvent"
                checked={settings.notifyOnNewEvent}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-12 h-6 rounded-full peer bg-gray-300 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500 after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-6"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <label className="font-medium text-gray-800">New User Notifications</label>
                <p className="text-sm text-gray-600">Receive notifications when new users register</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="notifyOnNewUser"
                checked={settings.notifyOnNewUser}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-12 h-6 rounded-full peer bg-gray-300 peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-6"></div>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'system',
      label: 'System',
      icon: Database,
      description: 'System maintenance and performance',
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <label className="font-medium text-gray-800">Maintenance Mode</label>
                <p className="text-sm text-gray-600">Enable maintenance mode to prevent user access</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-12 h-6 rounded-full peer bg-gray-300 peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-yellow-500 after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-6"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
              <select
                name="backupFrequency"
                value={settings.backupFrequency}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">How often system backups are created</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
              <input
                type="number"
                name="maxFileSize"
                value={settings.maxFileSize}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum file size for uploads</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <label className="font-medium text-gray-800">Auto-clean Logs</label>
                <p className="text-sm text-gray-600">Automatically clean old system logs</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="autoCleanLogs"
                checked={true}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-12 h-6 rounded-full peer bg-gray-300 peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500 after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-6"></div>
            </label>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Test Result Alert */}
      {testResult && (
        <div className={`relative p-5 pl-14 bg-gradient-to-r ${
          testResult.status === 'testing' ? 'from-blue-50 to-indigo-50' :
          testResult.status === 'success' ? 'from-green-50 to-emerald-50' :
          'from-red-50 to-rose-50'
        } border-l-4 ${
          testResult.status === 'testing' ? 'border-blue-500' :
          testResult.status === 'success' ? 'border-green-500' :
          'border-red-500'
        } rounded-lg shadow-sm animate-fade-in`}>
          <div className="absolute left-5 top-5">
            {testResult.status === 'testing' ? (
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            ) : testResult.status === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
          <div className="pr-10">
            <h4 className={`font-bold mb-1 ${
              testResult.status === 'testing' ? 'text-blue-800' :
              testResult.status === 'success' ? 'text-green-800' :
              'text-red-800'
            }`}>
              {testResult.status === 'testing' ? 'Testing AI Agent...' :
               testResult.status === 'success' ? 'Test Successful' :
               'Test Failed'}
            </h4>
            {testResult.message && (
              <p className={`text-sm ${
                testResult.status === 'testing' ? 'text-blue-600' :
                testResult.status === 'success' ? 'text-green-600' :
                'text-red-600'
              }`}>{testResult.message}</p>
            )}
            {testResult.latency && (
              <p className="text-xs text-gray-500 mt-1">Latency: {testResult.latency}ms | Confidence: {testResult.confidence}%</p>
            )}
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="relative p-5 pl-14 bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 rounded-lg shadow-sm animate-fade-in">
          <div className="absolute left-5 top-5">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="pr-10">
            <h4 className="font-bold text-emerald-800 mb-1">Success!</h4>
            <p className="text-sm text-emerald-600">Settings have been saved successfully.</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
          <div className="absolute left-5 top-5">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="pr-10">
            <h4 className="font-bold text-red-800 mb-1">Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-red-100 transition-colors"
            aria-label="Close error"
          >
            <XCircle className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}

      {/* Main Dashboard Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  System Settings Dashboard
                </h1>
                <AIBadge type="admin" agent="all" />
              </div>
              <p className="text-gray-600">
                Configure platform settings and AI agent configurations
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <Database className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Last saved: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Configuration Sections
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left group
                          ${activeSection === section.id
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-md'
                          }
                        `}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activeSection === section.id
                            ? 'bg-white/20'
                            : 'bg-gradient-to-br from-indigo-100 to-purple-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${activeSection === section.id ? 'text-white' : 'text-indigo-600'}`} />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium block">{section.label}</span>
                          <span className={`text-xs block mt-1 ${
                            activeSection === section.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {section.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      {(() => {
                        const SectionIcon = sections.find(s => s.id === activeSection)?.icon || Globe;
                        return <SectionIcon className="w-5 h-5 text-indigo-600" />;
                      })()}
                    </div>
                    {sections.find(s => s.id === activeSection)?.label}
                    {activeSection === 'aiAgents' && <AIBadge type="admin" agent="all" />}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {sections.find(s => s.id === activeSection)?.description}
                  </p>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleSubmit}>
                    <div className="max-w-2xl">
                      {sections.find(s => s.id === activeSection)?.content}
                      
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                              <Save className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">Apply Changes</p>
                              <p className="text-sm text-gray-600">Save all settings for this section</p>
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                              loading 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                            }`}
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-5 h-5" />
                                Save Settings
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Settings Status */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-8 h-8 text-indigo-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">Secure</h3>
                  <p className="text-gray-600 text-sm">All security settings are properly configured</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">Active</h3>
                  <p className="text-gray-600 text-sm">Notifications are enabled and working</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">Optimized</h3>
                  <p className="text-gray-600 text-sm">System performance is optimized</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;