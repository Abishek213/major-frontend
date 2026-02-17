import React, { useState } from 'react';

const Textarea = React.forwardRef(({ 
  className = "", 
  error,
  label,
  helperText,
  showCount = false,
  maxLength,
  onChange,
  value,
  ...props 
}, ref) => {
  const [charCount, setCharCount] = useState(value?.length || 0);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
    setCharCount(e.target.value.length);
  };

  const baseClasses = `
    flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm
    placeholder:text-gray-500 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
    disabled:cursor-not-allowed disabled:opacity-50
    transition-colors duration-200
    dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:placeholder:text-gray-400
  `;

  const errorClasses = error 
    ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-500' 
    : 'border-gray-200 dark:border-gray-800';

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {maxLength && <span className="ml-1 text-xs text-gray-500">(max {maxLength} chars)</span>}
        </label>
      )}
      
      <textarea
        className={`${baseClasses} ${errorClasses} ${className}`}
        ref={ref}
        onChange={handleChange}
        value={value}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? 'textarea-error' : helperText ? 'textarea-helper' : undefined}
        {...props}
      />
      
      <div className="flex justify-between text-xs">
        {error && (
          <span id="textarea-error" className="text-red-500 dark:text-red-400">
            {error}
          </span>
        )}
        
        {helperText && !error && (
          <span id="textarea-helper" className="text-gray-500 dark:text-gray-400">
            {helperText}
          </span>
        )}
        
        {showCount && maxLength && (
          <span className={`ml-auto ${charCount > maxLength * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = "Textarea";

// Specialized variants for AI components
export const AIAnalysisTextarea = React.forwardRef((props, ref) => (
  <Textarea
    ref={ref}
    className="min-h-[120px] font-mono text-sm bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
    {...props}
  />
));

AIAnalysisTextarea.displayName = "AIAnalysisTextarea";

export const AIPromptTextarea = React.forwardRef((props, ref) => (
  <Textarea
    ref={ref}
    className="min-h-[100px] bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800"
    placeholder="Enter your prompt for AI analysis..."
    {...props}
  />
));

AIPromptTextarea.displayName = "AIPromptTextarea";

export const AIResultTextarea = React.forwardRef(({ value, ...props }, ref) => (
  <Textarea
    ref={ref}
    value={value}
    readOnly
    className="min-h-[150px] bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 font-mono text-sm cursor-default"
    {...props}
  />
));

AIResultTextarea.displayName = "AIResultTextarea";

export { Textarea };