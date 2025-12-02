import React from 'react';
import { AlertCircle, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from '@/components/ui/alert';

const ConnectionStatus = ({ 
  isConnected, 
  reconnectAttempts, 
  maxReconnectAttempts,
  className = ""
}) => {
  
  if (isConnected) return null;
  
  const isMaxAttempts = reconnectAttempts >= maxReconnectAttempts;

  return (
    <Alert
      variant={isMaxAttempts ? "destructive" : "warning"}
      icon={isMaxAttempts ? AlertCircle : WifiOff}
      className={`
        fixed bottom-4 right-4 max-w-md z-50
        transition-all duration-300 transform
        shadow-lg shadow-gray-200/50
        border border-gray-200
        ${className}
      `}
    >
       <AlertDescription className="text-gray-700">
        {isMaxAttempts ? (
          <div className="flex flex-col gap-1">
            <span className="font-medium">Connection lost</span>
            <span className="text-sm opacity-90">Please refresh the page to reconnect</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="font-medium">Reconnecting...</span>
            <span className="text-sm opacity-90">
              Attempt {reconnectAttempts} of {maxReconnectAttempts}
            </span>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;