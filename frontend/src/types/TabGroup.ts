/**
 * Tab and TabGroup type definitions for TX-18 Phase 1
 * Improved UI structure with grouped navigation
 */

export type TabType = 
  | 'dashboard'
  | 'basic' 
  | 'salary' 
  | 'rsu' 
  | 'rsu-income-list' 
  | 'properties' 
  | 'real-estate-income' 
  | 'real-estate-income-list' 
  | 'capital-gain' 
  | 'capital-gain-list'
  | 'depreciation';

export interface TabItem {
  id: TabType;
  name: string;
  icon: string;
  help?: string; // Short description/help text for tooltips
}

export interface TabGroup {
  group: string; // Group name (e.g., "所得入力", "不動産・資産管理", "レポート・一覧")
  description?: string; // Group description
  color: 'blue' | 'green' | 'purple'; // Color scheme for visual grouping
  colorClasses?: {
    bg: string; // Background color class
    text: string; // Text color class
    border: string; // Border color class
  };
  tabs: TabItem[];
}

// Color scheme mapping
export const COLOR_SCHEMES = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-300',
    hover: 'hover:bg-blue-100',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-300',
    hover: 'hover:bg-green-100',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-300',
    hover: 'hover:bg-purple-100',
  },
};
