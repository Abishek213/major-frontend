// src/components/admin/FraudDetection.jsx
import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Zap,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Flag,
  Ban,
  UserX,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  Smartphone,
  Laptop,
  Server,
  Database,
  Cloud,
  Shield as ShieldIcon,
  ShieldOff,
  AlertCircle,
  Info,
  Filter,
  Search,
  RefreshCw,
  Download,
  Share2,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  PieChart,
  BarChart3,
  LineChart,
  Users2,
  Fingerprint,
  Key,
  Wifi,
  WifiOff,
  X,
  Bot,
  Sparkles,
  Target,
  Award,
  Radar,
  Gauge,
  Network,
  Cpu
} from 'lucide-react';
import FraudDetectionPanel from "../../../components/ai/admin/FraudDetectionPanel";
import FraudAlertModal from "../../../components/ai/admin/FraudAlertModal";
import AIBadge from "../../../components/ai/user/AIBadge";
import { useAdminAI, useFraudDetection } from '../../../hooks/useAdminAI';
import { getRiskLevel, detectBookingAnomalies } from '../../../utils/fraudHelpers';
import { Line, Bar, Pie } from 'react-chartjs-2';

const FraudDetection = () => {
  const [loading, setLoading] = useState(false);
  const [fraudData, setFraudData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('24h');
  const [autoScan, setAutoScan] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState(0.7);
  const [scanHistory, setScanHistory] = useState([]);
  const [realTimeStats, setRealTimeStats] = useState({
    requestsPerSecond: 0,
    activeThreats: 0,
    avgResponseTime: 0,
    blockedToday: 0
  });

  const { 
    fraudAlerts, 
    loading: aiLoading, 
    fetchFraudAlerts, 
    blockBooking, 
    resolveAlert 
  } = useAdminAI();

  const { 
    analyzeBooking, 
    getRiskStatistics,
    transactionHistory 
  } = useFraudDetection();

  useEffect(() => {
    fetchFraudData();
    fetchFraudAlerts();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (autoScan) {
        fetchFraudData();
        updateRealTimeStats();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoScan, dateRange]);

  const fetchFraudData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFraudData(mockFraudData);
      setAlerts(mockAlerts);
      
      // Add to scan history
      setScanHistory(prev => [{
        timestamp: new Date().toISOString(),
        threatsFound: mockAlerts.filter(a => a.severity === 'high').length,
        totalScanned: 156,
        status: 'completed'
      }, ...prev].slice(0, 10));
      
    } catch (error) {
      console.error('Error fetching fraud data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRealTimeStats = () => {
    setRealTimeStats({
      requestsPerSecond: Math.floor(Math.random() * 50) + 10,
      activeThreats: alerts.filter(a => a.status === 'new').length,
      avgResponseTime: (Math.random() * 200 + 50).toFixed(0),
      blockedToday: fraudData?.blockedAttempts || 0
    });
  };

  const handleAction = async (alertId, action, reason = '') => {
    console.log(`Action ${action} on alert ${alertId}`);
    
    if (action === 'block') {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        await blockBooking(alert.bookingId, reason);
      }
    }
    
    // Update alert status
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: action === 'resolve' ? 'resolved' : 'investigating' }
        : alert
    ));
  };

  const handleAnalyzeTransaction = async (transactionData) => {
    const result = await analyzeBooking(transactionData);
    if (result.riskScore > riskThreshold) {
      // Create new alert
      const newAlert = {
        id: Date.now(),
        ...result,
        timestamp: new Date().toISOString(),
        status: 'new'
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
    return result;
  };

  const LoadingSpinner = () => (
    <div className="space-y-8 p-4 md:p-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <RefreshCw className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
                <Brain className="w-8 h-8 text-purple-500 absolute top-4 left-1/2 transform -translate-x-1/2 animate-pulse" />
              </div>
              <p className="text-lg font-medium text-gray-700">AI Scanning for threats...</p>
              <p className="text-sm text-gray-500 mt-2">Analyzing patterns and anomalies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !fraudData) return <LoadingSpinner />;

  // Chart data
  const fraudTrendData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Fraud Attempts',
        data: [12, 19, 25, 42, 38, 29],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const riskDistributionData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk', 'Safe'],
    datasets: [
      {
        data: [23, 45, 78, 345],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Main Fraud Detection Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Fraud Detection
                </h1>
                <AIBadge type="admin" agent="fraud" />
              </div>
              <p className="text-gray-600">
                Real-time monitoring and threat detection powered by AI
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <div className="flex items-center p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setAutoScan(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                    autoScan 
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Zap className="w-4 h-4 mr-1.5" />
                  Auto-Scan
                </button>
                <button
                  onClick={() => setAutoScan(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    !autoScan 
                      ? 'bg-white shadow-md text-gray-800' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Manual
                </button>
              </div>
              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`p-3 rounded-xl border transition-all duration-300 shadow-md hover:shadow-lg ${
                  showAIPanel 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Brain className="w-5 h-5" />
              </button>
              <button
                onClick={fetchFraudData}
                className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* AI Status Banner */}
          <div className={`relative overflow-hidden rounded-xl p-6 mb-8 ${
            fraudData?.riskLevel === 'high' 
              ? 'bg-gradient-to-r from-red-500 to-rose-500' 
              : fraudData?.riskLevel === 'medium' 
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500'
          } text-white shadow-xl`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-20 -mb-20"></div>
            
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {fraudData?.riskLevel === 'high' ? (
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-white" />
                  </div>
                ) : fraudData?.riskLevel === 'medium' ? (
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-xl font-semibold mb-1">
                    System Status: {fraudData?.riskLevel === 'high' ? 'High Risk Detected' :
                                  fraudData?.riskLevel === 'medium' ? 'Moderate Risk' :
                                  'Secure'}
                  </p>
                  <p className="text-white/90 text-sm">
                    {fraudData?.activeAlerts} active alerts • {fraudData?.blockedAttempts} blocked attempts today
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Brain className="w-5 h-5" />
                  <span className="text-sm font-medium">AI Confidence: {fraudData?.aiConfidence}%</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm">Risk Threshold</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={riskThreshold}
                    onChange={(e) => setRiskThreshold(parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm font-bold">{(riskThreshold * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Requests/sec</p>
              <p className="text-2xl font-bold text-gray-800">{realTimeStats.requestsPerSecond}</p>
              <p className="text-xs text-green-600 mt-1">Normal load</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Active Threats</p>
              <p className="text-2xl font-bold text-red-600">{realTimeStats.activeThreats}</p>
              <p className="text-xs text-gray-500 mt-1">Under investigation</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-800">{realTimeStats.avgResponseTime}ms</p>
              <p className="text-xs text-green-600 mt-1">Optimal</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Blocked Today</p>
              <p className="text-2xl font-bold text-indigo-600">{realTimeStats.blockedToday}</p>
              <p className="text-xs text-gray-500 mt-1">+12 since yesterday</p>
            </div>
          </div>

          {/* AI Fraud Detection Panel */}
          {showAIPanel && (
            <div className="mb-8">
              <FraudDetectionPanel />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Risk Score"
              value={fraudData?.riskScore || 0}
              unit="%"
              change={fraudData?.riskChange}
              icon={Gauge}
              color="red"
            />
            <StatCard
              title="Blocked Attempts"
              value={fraudData?.blockedAttempts || 0}
              change={fraudData?.blockedChange}
              icon={ShieldOff}
              color="amber"
            />
            <StatCard
              title="Active Investigations"
              value={fraudData?.investigations || 0}
              change={fraudData?.investigationsChange}
              icon={Eye}
              color="blue"
            />
            <StatCard
              title="False Positives"
              value={fraudData?.falsePositives || 0}
              unit="%"
              change={fraudData?.falsePositivesChange}
              icon={Target}
              color="green"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Alerts List */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="font-semibold text-gray-800 text-lg">Real-Time Alerts</h3>
                    <div className="flex gap-3">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white shadow-sm"
                      >
                        <option value="all">All Alerts</option>
                        <option value="high">High Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="low">Low Risk</option>
                      </select>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white shadow-sm"
                      >
                        <option value="1h">Last Hour</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {alerts.filter(a => filter === 'all' || a.severity === filter).map(alert => (
                    <AlertRow
                      key={alert.id}
                      alert={alert}
                      onSelect={setSelectedAlert}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="lg:col-span-1 space-y-6">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <h3 className="font-semibold flex items-center text-lg mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2">
                      <Brain className="w-4 h-4" />
                    </div>
                    AI Insights
                  </h3>
                  <div className="space-y-3">
                    <InsightItem
                      title="Pattern Detected"
                      description="Unusual login attempts from 3 new locations"
                      severity="high"
                      confidence={94}
                    />
                    <InsightItem
                      title="Behavior Analysis"
                      description="Multiple accounts with same IP address"
                      severity="medium"
                      confidence={76}
                    />
                    <InsightItem
                      title="Transaction Pattern"
                      description="Rapid ticket purchases detected"
                      severity="low"
                      confidence={82}
                    />
                  </div>
                </div>
              </div>

              {/* Recent Blocks */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 p-6 shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Recently Blocked
                </h3>
                <div className="space-y-3">
                  {mockBlocked.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
                          <ShieldOff className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-mono text-sm text-gray-700">{item.ip}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scan History */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 p-6 shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Recent Scans
                </h3>
                <div className="space-y-2">
                  {scanHistory.map((scan, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-gray-800 font-medium">
                        {scan.threatsFound} threats
                      </span>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {scan.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-100 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                Fraud Attempts Over Time
              </h3>
              <div className="h-64">
                <Line 
                  data={fraudTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          display: true,
                          color: 'rgba(0,0,0,0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-100 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                Risk Categories
              </h3>
              <div className="h-64">
                <Pie 
                  data={riskDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Threat Intelligence Feed */}
          <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-xl">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-400" />
              Threat Intelligence Feed
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm text-gray-300 mb-1">Known Bad IPs</p>
                <p className="text-2xl font-bold text-white">1,234</p>
                <p className="text-xs text-green-400 mt-2">+24 new today</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm text-gray-300 mb-1">Blacklisted Cards</p>
                <p className="text-2xl font-bold text-white">567</p>
                <p className="text-xs text-red-400 mt-2">+8 new today</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm text-gray-300 mb-1">Suspicious Patterns</p>
                <p className="text-2xl font-bold text-white">89</p>
                <p className="text-xs text-yellow-400 mt-2">Active patterns</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <FraudAlertModal
          isOpen={true}
          onClose={() => setSelectedAlert(null)}
          alert={selectedAlert}
          onBlock={(alertId, bookingId, reason) => handleAction(alertId, 'block', reason)}
        />
      )}
    </div>
  );
};

// Alert Row Component
const AlertRow = ({ alert, onSelect, onAction }) => {
  const severityColors = {
    high: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
    medium: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
    low: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
  };

  const statusColors = {
    new: 'bg-red-100 text-red-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800'
  };

  const risk = getRiskLevel(alert.riskScore || 
    (alert.severity === 'high' ? 0.9 : alert.severity === 'medium' ? 0.6 : 0.3));

  return (
    <div 
      className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white cursor-pointer transition-all duration-300 group"
      onClick={() => onSelect(alert)}
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {risk.level === 'High' ? (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          ) : risk.level === 'Medium' ? (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-md flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md flex-shrink-0">
              <Info className="w-5 h-5 text-white" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-gray-900">{alert.type}</h4>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${severityColors[alert.severity]}`}>
                {risk.level}
              </span>
              {alert.status === 'new' && (
                <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium shadow-sm">
                  New
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                {alert.time}
              </span>
              <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                <Fingerprint className="w-3 h-3 mr-1.5 text-gray-400" />
                {alert.user}
              </span>
              <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                <Globe className="w-3 h-3 mr-1.5 text-gray-400" />
                {alert.ip}
              </span>
              {alert.riskScore && (
                <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                  <Gauge className="w-3 h-3 mr-1.5 text-gray-400" />
                  Risk: {(alert.riskScore * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:border-l lg:border-gray-200 lg:pl-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction(alert.id, 'investigate');
            }}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
            title="Investigate"
          >
            <Eye className="w-4 h-4 text-gray-500 group-hover:text-yellow-600 transition-colors" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction(alert.id, 'resolve');
            }}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
            title="Resolve"
          >
            <CheckCircle className="w-4 h-4 text-gray-500 group-hover:text-green-600 transition-colors" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction(alert.id, 'block', 'Suspicious activity detected');
            }}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
            title="Block"
          >
            <Ban className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, unit = '', change, icon: Icon, color }) => {
  const colors = {
    red: {
      bg: 'from-red-50 to-rose-50',
      border: 'border-red-100',
      icon: 'from-red-500 to-rose-500',
      text: 'text-red-600'
    },
    amber: {
      bg: 'from-amber-50 to-yellow-50',
      border: 'border-amber-100',
      icon: 'from-amber-500 to-yellow-500',
      text: 'text-amber-600'
    },
    blue: {
      bg: 'from-blue-50 to-cyan-50',
      border: 'border-blue-100',
      icon: 'from-blue-500 to-cyan-500',
      text: 'text-blue-600'
    },
    green: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-100',
      icon: 'from-green-500 to-emerald-500',
      text: 'text-green-600'
    }
  };

  const isPositive = change?.startsWith('+');
  const isRiskPositive = title === 'Risk Score' ? !isPositive : isPositive;

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors[color].bg} border ${colors[color].border} p-6 shadow-md hover:shadow-lg transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-10 -mt-10"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-800">
              {value}{unit}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color].icon} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {change && (
          <div className={`flex items-center text-xs ${isRiskPositive ? 'text-green-600' : 'text-red-600'} bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit shadow-sm`}>
            {isRiskPositive ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
            {change} from yesterday
          </div>
        )}
      </div>
    </div>
  );
};

const InsightItem = ({ title, description, severity, confidence }) => {
  const colors = {
    high: 'bg-red-500/20 border-red-500/30',
    medium: 'bg-yellow-500/20 border-yellow-500/30',
    low: 'bg-blue-500/20 border-blue-500/30'
  };

  const textColors = {
    high: 'text-red-100',
    medium: 'text-yellow-100',
    low: 'text-blue-100'
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[severity]} backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-white text-sm">{title}</p>
        <span className="text-xs text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
          {confidence}% conf
        </span>
      </div>
      <p className={`text-xs ${textColors[severity]}`}>{description}</p>
    </div>
  );
};

// Mock Data
const mockFraudData = {
  riskLevel: 'medium',
  riskScore: 68,
  riskChange: '+12',
  blockedAttempts: 234,
  blockedChange: '+23',
  investigations: 12,
  investigationsChange: '-5',
  falsePositives: 3.2,
  falsePositivesChange: '-0.8',
  activeAlerts: 8,
  aiConfidence: 87
};

const mockAlerts = [
  {
    id: 1,
    type: 'Multiple Failed Logins',
    severity: 'high',
    description: '10 failed login attempts in 5 minutes',
    user: 'user123',
    ip: '192.168.1.100',
    location: 'Unknown VPN',
    time: '2 minutes ago',
    status: 'new',
    riskScore: 0.94,
    aiAnalysis: 'Pattern matches credential stuffing attack. Multiple attempts from different IPs.',
    aiConfidence: 94,
    bookingId: 'BOK12345',
    amount: 450,
    paymentMethod: 'Credit Card',
    transactionId: 'TXN789012'
  },
  {
    id: 2,
    type: 'Suspicious Purchase Pattern',
    severity: 'medium',
    description: 'Bulk ticket purchase with multiple credit cards',
    user: 'eventbuyer',
    ip: '203.0.113.45',
    location: 'New York, US',
    time: '15 minutes ago',
    status: 'investigating',
    riskScore: 0.76,
    aiAnalysis: 'Unusual purchase velocity but cards are verified. Possible reseller activity.',
    aiConfidence: 76,
    bookingId: 'BOK12346',
    amount: 1250,
    paymentMethod: 'Multiple Cards',
    transactionId: 'TXN789013'
  },
  {
    id: 3,
    type: 'Account Takeover Attempt',
    severity: 'high',
    description: 'Login from new device with suspicious behavior',
    user: 'premiumuser',
    ip: '198.51.100.67',
    location: 'Moscow, RU',
    time: '32 minutes ago',
    status: 'new',
    riskScore: 0.96,
    aiAnalysis: 'Geographic anomaly detected. User typically logs in from US.',
    aiConfidence: 96,
    bookingId: 'BOK12347',
    amount: 0,
    paymentMethod: 'N/A',
    transactionId: 'TXN789014'
  }
];

const mockBlocked = [
  { ip: '185.142.53.xxx', time: '2 min ago' },
  { ip: '103.152.24.xxx', time: '5 min ago' },
  { ip: '45.143.21.xxx', time: '12 min ago' },
  { ip: '91.234.67.xxx', time: '18 min ago' }
];

export default FraudDetection;