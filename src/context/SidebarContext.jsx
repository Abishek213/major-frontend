import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const value = {
    isSidebarOpen,
    setIsSidebarOpen,
    // Add any additional sidebar-related state or functions here
    toggleSidebar: () => setIsSidebarOpen(prev => !prev),
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;