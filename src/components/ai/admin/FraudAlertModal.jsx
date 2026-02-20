import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle,
  Shield,
  DollarSign,
  User,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  Globe,
  Clock,
  Ban,
  Activity
} from 'lucide-react';
import AILoadingSpinner from '../user/AILoadingSpinner';

const FraudAlertModal = ({ isOpen, onClose, alert, onBlock }) => {
  const [blockReason, setBlockReason] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const handleBlock = async () => {
    setBlocking(true);
    try {
      await onBlock(alert.id, alert.bookingId, blockReason);
      onClose();
    } catch (error) {
      console.error('Failed to block booking:', error);
    } finally {
      setBlocking(false);
    }
  };

  const getRiskColor = (score) => {
    if (score > 0.8) return 'text-red-600';
    if (score > 0.5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    switch(alert.fraudStatus) {
      case 'fraud':
        return <XCircle className="w-12 h-12 text-red-500" />;
      case 'suspicious':
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
      default:
        return <CheckCircle className="w-12 h-12 text-green-500" />;
    }
  };

  if (!alert) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Fraud Alert Details
          </DialogTitle>
        </DialogHeader>

        {/* Header Status */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          {getStatusIcon()}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Booking #{alert.bookingId}</h3>
              <Badge variant={alert.fraudStatus === 'fraud' ? 'destructive' : 'warning'}>
                {alert.fraudStatus.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Detected: {new Date(alert.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mt-4">
          {['details', 'anomalies', 'action'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-red-500 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Risk Score */}
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Risk Score</span>
                  <span className={`text-xl font-bold ${getRiskColor(alert.riskScore)}`}>
                    {(alert.riskScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      alert.riskScore > 0.8 ? 'bg-red-500' :
                      alert.riskScore > 0.5 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${alert.riskScore * 100}%` }}
                  />
                </div>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">User Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{alert.userName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{alert.userEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Booking Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span>${alert.amount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span>{alert.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{alert.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>IP: {alert.ipAddress || 'N/A'}</span>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2">Transaction Details</h4>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <p><span className="font-medium">Transaction ID:</span> {alert.transactionId}</p>
                  <p><span className="font-medium">Payment Status:</span> {alert.paymentStatus}</p>
                  <p><span className="font-medium">Attempts:</span> {alert.attemptCount || 1}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'anomalies' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Detected Anomalies</h4>
              {alert.detectedAnomalies && alert.detectedAnomalies.length > 0 ? (
                <div className="space-y-2">
                  {alert.detectedAnomalies.map((anomaly, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{anomaly}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No anomalies detected</p>
              )}

              {/* Pattern Analysis */}
              {alert.patterns && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Pattern Analysis</h4>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm">{alert.patterns}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'action' && (
            <div className="space-y-4">
              {alert.status === 'blocked' ? (
                <div className="text-center py-4">
                  <Ban className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">This booking has already been blocked</p>
                  {alert.resolution && (
                    <p className="text-sm text-gray-500 mt-2">Reason: {alert.resolution}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-orange-50 p-3 rounded">
                    <h4 className="text-sm font-medium mb-2">Action Required</h4>
                    <p className="text-sm">
                      This booking has been flagged as {alert.fraudStatus}. 
                      Review the details and take appropriate action.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason for blocking (optional)</label>
                    <Textarea
                      placeholder="Enter reason for blocking this booking..."
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleBlock}
                      disabled={blocking}
                    >
                      {blocking ? <AILoadingSpinner size="sm" /> : 'Block Booking'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={onClose}
                    >
                      Mark as Reviewed
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FraudAlertModal;