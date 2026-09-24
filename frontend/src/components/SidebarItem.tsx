import React from 'react';
import { TabType } from '../types/TabGroup';

interface SidebarItemProps {
  id: TabType;
  name: string;
  icon: string;
  isActive: boolean;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    hover: string;
  };
  onClick: () => void;
  isCollapsed: boolean;
}

/**
 * SidebarItem Component
 * Individual navigation item in the sidebar
 * Part of TX-40 Phase 2 Sidebar implementation
 */
const SidebarItem: React.FC<SidebarItemProps> = ({
  id,
  name,
  icon,
  isActive,
  colorScheme,
  onClick,
  isCollapsed,
}) => {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? name : undefined}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg
        transition-all duration-200 group relative
        ${isActive
          ? `${colorScheme.bg} ${colorScheme.text} font-bold border-l-4 ${colorScheme.border} shadow-sm`
          : `text-gray-600 hover:${colorScheme.bg} hover:text-gray-800 border-l-4 border-transparent`
        }
      `}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      {!isCollapsed && (
        <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {name}
        </span>
      )}
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
          {name}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-[-4px]
                          w-0 h-0 border-t-4 border-b-4 border-r-4
                          border-transparent border-r-gray-900"></div>
        </div>
      )}
    </button>
  );
};

export default SidebarItem;
