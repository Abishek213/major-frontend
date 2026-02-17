import * as React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Brain, Sparkles } from 'lucide-react';

const Dialog = ({ children, open, onClose, className = "" }) => {
  if (!open) return null;
  
  return (
    <div className={`animate-in fade-in duration-200 ${className}`}>
      {children}
    </div>
  );
};

const DialogContent = React.forwardRef(({
  className = "",
  children,
  onClose,
  showCloseButton = true,
  size = "default", // default, sm, lg, xl, full
  ...props
}, ref) => {
  const dialogRef = React.useRef(null);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    const handleClickOutside = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw] max-h-[90vh]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={`
          relative w-full ${sizeClasses[size]} rounded-xl p-6 shadow-2xl 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          ring-1 ring-gray-200 dark:ring-gray-700
          animate-in zoom-in-95 slide-in-from-bottom-8 duration-300
          max-h-[90vh] overflow-y-auto
          ${className}
        `}
        {...props}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
});

DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className = "", ...props }) => (
  <div 
    className={`mb-6 ${className}`}
    {...props}
  />
);

const DialogTitle = ({ className = "", icon: Icon, ...props }) => (
  <div className="flex items-center gap-3">
    {Icon && (
      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
        <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      </div>
    )}
    <h2 
      className={`text-xl font-semibold leading-none tracking-tight dark:text-white ${className}`}
      {...props}
    />
  </div>
);

const DialogDescription = ({ className = "", ...props }) => (
  <div
    className={`text-sm leading-relaxed text-gray-600 dark:text-gray-300 mt-2 ${className}`}
    {...props}
  />
);

const DialogFooter = ({ className = "", ...props }) => (
  <div 
    className={`mt-8 flex items-center justify-end gap-3 ${className}`}
    {...props}
  />
);

const DialogClose = React.forwardRef(({ className = "", children = "Cancel", ...props }, ref) => (
  <button
    ref={ref}
    className={`
      inline-flex h-10 items-center justify-center rounded-lg px-4 py-2
      text-sm font-medium tracking-wide
      border border-gray-200 dark:border-gray-700
      bg-white hover:bg-gray-50
      dark:bg-gray-800 dark:hover:bg-gray-700
      dark:text-gray-200
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
));

DialogClose.displayName = 'DialogClose';

const DialogAction = React.forwardRef(({ 
  className = "", 
  variant = "primary", 
  children = "Continue",
  loading = false,
  ...props 
}, ref) => {
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 focus:ring-purple-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 focus:ring-green-500",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 focus:ring-red-500",
    warning: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 focus:ring-yellow-500"
  };

  return (
    <button
      ref={ref}
      disabled={loading}
      className={`
        inline-flex h-10 items-center justify-center rounded-lg px-6 py-2
        text-sm font-medium tracking-wide
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : children}
    </button>
  );
});

DialogAction.displayName = 'DialogAction';

// AI-Specific Dialog Components

export const AIAnalysisDialog = ({ open, onClose, title, description, children, onAnalyze }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent size="lg" onClose={onClose}>
        <DialogHeader>
          <DialogTitle icon={Brain}>
            {title || "AI Analysis"}
          </DialogTitle>
          <DialogDescription>
            {description || "Our AI is analyzing your request. Please wait..."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>
        
        <DialogFooter>
          <DialogClose onClick={onClose}>Cancel</DialogClose>
          <DialogAction onClick={onAnalyze} variant="primary">
            Run Analysis
          </DialogAction>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AIResultDialog = ({ open, onClose, title, result, confidence, recommendations }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent size="lg" onClose={onClose}>
        <DialogHeader>
          <DialogTitle icon={Sparkles}>
            {title || "AI Analysis Result"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {confidence && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{confidence}%</span>
            </div>
          )}
          
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{result}</p>
          </div>
          
          {recommendations && recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-purple-500 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <DialogAction onClick={onClose} variant="primary">
            Close
          </DialogAction>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AIConfirmationDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  variant = "primary",
  loading = false 
}) => {
  const icons = {
    primary: { icon: Info, color: "from-blue-500 to-indigo-500" },
    success: { icon: CheckCircle, color: "from-green-500 to-emerald-500" },
    danger: { icon: AlertTriangle, color: "from-red-500 to-rose-500" },
    warning: { icon: AlertCircle, color: "from-yellow-500 to-amber-500" }
  };

  const { icon: Icon, color } = icons[variant] || icons.primary;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent size="sm" onClose={onClose} showCloseButton={false}>
        <div className="text-center">
          <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-r ${color} bg-opacity-20 flex items-center justify-center mb-4`}>
            <Icon className={`h-6 w-6 text-${variant === 'danger' ? 'red' : variant === 'success' ? 'green' : 'blue'}-600`} />
          </div>
          
          <DialogTitle className="text-center">
            {title || "Confirm Action"}
          </DialogTitle>
          
          <DialogDescription className="text-center">
            {description || "Are you sure you want to proceed?"}
          </DialogDescription>
        </div>
        
        <DialogFooter className="justify-center gap-3">
          <DialogClose onClick={onClose}>Cancel</DialogClose>
          <DialogAction 
            onClick={onConfirm} 
            variant={variant}
            loading={loading}
          >
            Confirm
          </DialogAction>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogAction
};