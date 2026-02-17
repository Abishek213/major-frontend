import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown } from "lucide-react";

export const Select = ({ children, value, onChange, onValueChange, className = "", ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelect = (newValue) => {
    if (onChange) {
      onChange({ target: { value: newValue } });
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
    setIsOpen(false);
  };

  // Find the selected value to display in trigger
  let selectedValueText = '';
  React.Children.forEach(children, child => {
    if (!child) return;
    
    if (child.type === SelectTrigger) {
      React.Children.forEach(child.props.children, triggerChild => {
        if (triggerChild?.type === SelectValue) {
          // Find matching item
          React.Children.forEach(children, itemChild => {
            if (itemChild?.type === SelectContent) {
              React.Children.forEach(itemChild.props.children, contentChild => {
                if (contentChild?.type === SelectGroup) {
                  React.Children.forEach(contentChild.props.children, groupChild => {
                    if (groupChild?.type === SelectItem && groupChild.props.value === value) {
                      selectedValueText = groupChild.props.children;
                    }
                  });
                } else if (contentChild?.type === SelectItem && contentChild.props.value === value) {
                  selectedValueText = contentChild.props.children;
                }
              });
            }
          });
        }
      });
    }
  });

  return (
    <div className={`relative ${className}`} ref={selectRef} {...props}>
      {React.Children.map(children, child => {
        if (!child) return null;
        
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            'aria-expanded': isOpen,
            'aria-haspopup': 'listbox',
            role: 'combobox',
          });
        }
        if (child.type === SelectValue) {
          return React.cloneElement(child, {
            selectedValue: value,
            displayText: selectedValueText,
          });
        }
        if (child.type === SelectContent) {
          return isOpen && React.cloneElement(child, {
            role: 'listbox',
            children: React.Children.map(child.props.children, contentChild => {
              if (!contentChild) return null;

              if (contentChild.type === SelectGroup) {
                return React.cloneElement(contentChild, {
                  children: React.Children.map(contentChild.props.children, groupChild => {
                    if (!groupChild) return null;

                    if (groupChild.type === SelectItem) {
                      return React.cloneElement(groupChild, {
                        onClick: () => handleSelect(groupChild.props.value),
                        onKeyDown: (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelect(groupChild.props.value);
                          }
                        },
                        role: 'option',
                        'aria-selected': groupChild.props.value === value,
                        tabIndex: groupChild.props.value === value ? 0 : -1,
                      });
                    }
                    return groupChild;
                  }),
                });
              }
              
              if (contentChild.type === SelectItem) {
                return React.cloneElement(contentChild, {
                  onClick: () => handleSelect(contentChild.props.value),
                  onKeyDown: (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(contentChild.props.value);
                    }
                  },
                  role: 'option',
                  'aria-selected': contentChild.props.value === value,
                  tabIndex: contentChild.props.value === value ? 0 : -1,
                });
              }
              return contentChild;
            }),
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectGroup = ({ children, className = "", ...props }) => {
  return (
    <div className={`px-1 py-1.5 ${className}`} role="group" {...props}>
      {children}
    </div>
  );
};

export const SelectLabel = ({ children, className = "", ...props }) => {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const SelectTrigger = React.forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900 ${className}`}
      {...props}
    >
      {children}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-200 ${props['aria-expanded'] ? 'rotate-180' : ''}`} />
    </button>
  );
});

SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue = ({ children, placeholder, className = "", selectedValue, displayText, ...props }) => {
  return (
    <span className={`block truncate ${className}`} {...props}>
      {displayText || children || placeholder || 'Select an option'}
    </span>
  );
};

export const SelectContent = React.forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`absolute top-full left-0 right-0 mt-1 z-50 max-h-60 min-w-[8rem] overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg animate-in fade-in-0 zoom-in-95 dark:border-gray-700 dark:bg-gray-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

SelectContent.displayName = 'SelectContent';

export const SelectItem = React.forwardRef(({ children, className = "", value, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="option"
      className={`relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 px-3 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:hover:bg-gray-700 dark:focus:bg-gray-700 ${
        props['aria-selected'] ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
      } ${className}`}
      {...props}
    >
      <span className="flex flex-1 items-center gap-2">
        {children}
      </span>
      {props['aria-selected'] && (
        <span className="ml-auto pl-3">
          <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </span>
      )}
    </div>
  );
});

SelectItem.displayName = 'SelectItem';

// Also export default for convenience
export default {
  Select,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
};