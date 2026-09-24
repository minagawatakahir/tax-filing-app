import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { TabGroup, TabType } from '../types/TabGroup';
import { useSidebar } from '../contexts/SidebarContext';

interface SidebarLayoutProps {
  tabGroups: TabGroup[];
  activeTab: TabType;
  onTabChange: (tabId: TabType) => void;
  children: React.ReactNode;
  header: React.ReactNode;
  fiscalYearSelector: React.ReactNode;
}

/**
 * SidebarLayout Component
 * Main layout wrapper that combines Sidebar with main content area
 * Part of TX-40 Phase 2 Sidebar implementation
 */
const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  tabGroups,
  activeTab,
  onTabChange,
  children,
  header,
  fiscalYearSelector,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isExpanded } = useSidebar();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg z-20 flex-shrink-0">
        <div className={`h-16 flex items-center justify-between px-4 transition-all duration-300 ${isExpanded ? 'md:ml-72' : 'md:ml-20'}`}>
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-blue-700 transition-colors"
            title="メニューを開く"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Header content */}
          <div className="flex-1 flex items-center justify-between px-4">
            <h1 className="text-2xl font-bold">📊 確定申告アシスタント</h1>
            <p className="text-blue-100 hidden sm:block">高度な税務計算・資産管理システム</p>
          </div>
        </div>

        {/* Fiscal Year Selector */}
        <div className={`bg-blue-700 bg-opacity-50 border-t border-blue-500 py-3 px-4 flex items-center justify-center gap-4 flex-wrap text-sm transition-all duration-300 ${isExpanded ? 'md:ml-72' : 'md:ml-20'}`}>
          {fiscalYearSelector}
        </div>
      </header>

      {/* Main content container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          tabGroups={tabGroups}
          activeTab={activeTab}
          onTabChange={onTabChange}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main content area */}
        <main
          className={`
            flex-1 overflow-y-auto transition-all duration-300
            ${isExpanded ? 'md:ml-72' : 'md:ml-20'}
          `}
        >
          {/* Content wrapper */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </div>

          {/* Footer */}
          <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p>© 2024 確定申告アシスタント | 正確な税務申告については税理士にご相談ください</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
