import React from 'react';
import { Loader2 } from "lucide-react";

export const Spinner = ({ className, size = "default", ...props }) => {
  const sizeClasses = {
    default: "h-4 w-4",
    sm: "h-3 w-3",
    lg: "h-6 w-6",
    xl: "h-8 w-8"
  };

  return (
    <div 
      role="status" 
      className={`flex items-center justify-center ${className}`} 
      {...props}
    >
      <Loader2 
        className={`animate-spin text-gray-500 dark:text-gray-400 ${sizeClasses[size] || sizeClasses.default}`} 
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};