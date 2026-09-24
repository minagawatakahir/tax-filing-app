import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SidebarContextType {
  isExpanded: boolean;
  expandedGroups: Set<string>;
  toggleSidebar: () => void;
  toggleGroup: (groupName: string) => void;
  setGroupExpanded: (groupName: string, expanded: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('sidebar-expanded-groups');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set(['所得入力', '不動産・資産管理', 'レポート・一覧']);
      }
    }
    // Default: all groups expanded
    return new Set(['所得入力', '不動産・資産管理', 'レポート・一覧']);
  });

  const toggleSidebar = useCallback(() => {
    setIsExpanded(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebar-expanded', String(newValue));
      return newValue;
    });
  }, []);

  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      localStorage.setItem('sidebar-expanded-groups', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  }, []);

  const setGroupExpanded = useCallback((groupName: string, expanded: boolean) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (expanded) {
        newSet.add(groupName);
      } else {
        newSet.delete(groupName);
      }
      localStorage.setItem('sidebar-expanded-groups', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  }, []);

  const value: SidebarContextType = {
    isExpanded,
    expandedGroups,
    toggleSidebar,
    toggleGroup,
    setGroupExpanded,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};
