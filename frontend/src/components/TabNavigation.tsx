import React from 'react';
import { TabGroup, TabType, COLOR_SCHEMES } from '../types/TabGroup';

interface TabNavigationProps {
  tabGroups: TabGroup[];
  activeTab: TabType;
  onTabChange: (tabId: TabType) => void;
}

/**
 * TabNavigation Component
 * Displays grouped tab navigation with visual separators and tooltips
 * Part of TX-18 Phase 1 UI improvements
 */
const TabNavigation: React.FC<TabNavigationProps> = ({ tabGroups, activeTab, onTabChange }) => {
  return (
    <div className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex flex-wrap gap-6 py-2">
          {tabGroups.map((group, groupIndex) => {
            const colorScheme = COLOR_SCHEMES[group.color];
            
            return (
              <div key={group.group} className="flex items-center gap-2">
                {/* Group separator (except for first group) */}
                {groupIndex > 0 && (
                  <div className="h-10 w-px bg-gray-300 mx-2"></div>
                )}
                
                {/* Group label */}
                <div className="flex flex-col mr-2">
                  <span className={`text-xs font-semibold ${colorScheme.text} uppercase tracking-wide`}>
                    {group.group}
                  </span>
                  {group.description && (
                    <span className="text-xs text-gray-500 italic">
                      {group.description}
                    </span>
                  )}
                </div>
                
                {/* Tabs in this group */}
                <div className="flex space-x-1">
                  {group.tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        title={tab.help || tab.name}
                        className={`
                          px-4 py-2 font-medium whitespace-nowrap rounded-t-lg
                          transition-all duration-200 border-b-2
                          ${isActive
                            ? `${colorScheme.bg} ${colorScheme.text} ${colorScheme.border} border-b-4 font-bold shadow-sm`
                            : `border-transparent text-gray-600 ${colorScheme.hover} hover:text-gray-800`
                          }
                        `}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;
