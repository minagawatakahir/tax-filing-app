import React from 'react';
import SidebarItem from './SidebarItem';
import { TabGroup, TabType, COLOR_SCHEMES } from '../types/TabGroup';
import { useSidebar } from '../contexts/SidebarContext';

interface SidebarProps {
  tabGroups: TabGroup[];
  activeTab: TabType;
  onTabChange: (tabId: TabType) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

/**
 * Sidebar Component
 * Main navigation sidebar with collapsible groups
 * Part of TX-40 Phase 2 Sidebar implementation
 */
const Sidebar: React.FC<SidebarProps> = ({
  tabGroups,
  activeTab,
  onTabChange,
  isMobileOpen,
  onMobileClose,
}) => {
  const { isExpanded, expandedGroups, toggleSidebar, toggleGroup } = useSidebar();

  const handleTabClick = (tabId: TabType) => {
    onTabChange(tabId);
    // Close mobile menu after selection
    if (window.innerWidth < 768) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onMobileClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-xl z-40
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${isExpanded ? 'w-72' : 'w-20'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          {isExpanded && (
            <h2 className="text-white font-bold text-lg">📊 メニュー</h2>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-blue-700 text-white transition-colors"
            title={isExpanded ? 'サイドバーを折りたたむ' : 'サイドバーを展開'}
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation content */}
        <nav className="h-[calc(100vh-4rem)] overflow-y-auto py-4 px-2">
          {/* Dashboard - Special item */}
          <div className="mb-4">
            <button
              onClick={() => handleTabClick('dashboard')}
              title={!isExpanded ? 'ダッシュボード' : undefined}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 relative group
                ${activeTab === 'dashboard'
                  ? 'bg-yellow-50 text-yellow-700 font-bold border-l-4 border-yellow-400 shadow-sm'
                  : 'text-gray-600 hover:bg-yellow-50 hover:text-gray-800 border-l-4 border-transparent'
                }
              `}
            >
              <span className="text-xl">📊</span>
              {isExpanded && <span className="text-sm font-medium">ダッシュボード</span>}
              
              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                  ダッシュボード
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-[-4px]
                                  w-0 h-0 border-t-4 border-b-4 border-r-4
                                  border-transparent border-r-gray-900"></div>
                </div>
              )}
            </button>
          </div>

          {/* Tab Groups */}
          {tabGroups.map((group, index) => {
            const colorScheme = COLOR_SCHEMES[group.color];
            const isGroupExpanded = expandedGroups.has(group.group);

            return (
              <div key={group.group} className="mb-4">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.group)}
                  className={`
                    w-full flex items-center justify-between px-4 py-2 mb-2
                    rounded-lg transition-all duration-200
                    hover:bg-gray-100
                  `}
                >
                  {isExpanded ? (
                    <>
                      <span className={`text-xs font-bold ${colorScheme.text} uppercase tracking-wide`}>
                        {group.group}
                      </span>
                      <svg
                        className={`w-4 h-4 ${colorScheme.text} transition-transform duration-300 ${
                          isGroupExpanded ? 'rotate-0' : '-rotate-90'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  ) : (
                    <div className={`w-full h-px ${colorScheme.bg}`}></div>
                  )}
                </button>

                {/* Group Items */}
                {isGroupExpanded && (
                  <div className="space-y-1">
                    {group.tabs.map((tab) => (
                      <SidebarItem
                        key={tab.id}
                        id={tab.id}
                        name={tab.name}
                        icon={tab.icon}
                        isActive={activeTab === tab.id}
                        colorScheme={colorScheme}
                        onClick={() => handleTabClick(tab.id)}
                        isCollapsed={!isExpanded}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
