import React, { useState } from 'react';

interface WorkflowGuideProps {
  currentTab?: string;
}

/**
 * WorkflowGuide Component
 * Displays step-by-step workflow guidance based on current tab
 * Part of TX-18 Phase 1 improvements
 */
const WorkflowGuide: React.FC<WorkflowGuideProps> = ({ currentTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const workflows = {
    default: [
      { step: 1, icon: '🏢', title: '物件管理', desc: '不動産物件を登録' },
      { step: 2, icon: '💼', title: '所得入力', desc: '給与やRSUの所得を入力' },
      { step: 3, icon: '🏠', title: '不動産所得', desc: '物件ごとの所得を計算' },
      { step: 4, icon: '📊', title: 'レポート', desc: '結果をエクスポート' },
    ],
    properties: [
      { step: 1, icon: '➕', title: '物件登録', desc: '新しい物件を追加' },
      { step: 2, icon: '📝', title: '詳細入力', desc: '物件情報とローン情報を入力' },
      { step: 3, icon: '🏠', title: '所得計算', desc: '不動産所得タブで計算' },
      { step: 4, icon: '💰', title: '売却管理', desc: '売却時は物件売却タブへ' },
    ],
    'real-estate-income': [
      { step: 1, icon: '🏢', title: '物件選択', desc: '計算する物件を選択' },
      { step: 2, icon: '💵', title: '収入入力', desc: '家賃収入を入力' },
      { step: 3, icon: '📉', title: '経費入力', desc: '経費と減価償却を入力' },
      { step: 4, icon: '💾', title: '保存', desc: '計算結果を保存' },
    ],
    'capital-gain': [
      { step: 1, icon: '🏢', title: '売却物件', desc: '売却した物件を選択' },
      { step: 2, icon: '💰', title: '売却情報', desc: '売却価格と日付を入力' },
      { step: 3, icon: '🔄', title: '特例選択', desc: '3000万円控除を確認' },
      { step: 4, icon: '📊', title: '結果確認', desc: '譲渡所得を確認' },
    ],
  };

  const getWorkflowForTab = (): typeof workflows.default => {
    if (currentTab && currentTab in workflows) {
      return workflows[currentTab as keyof typeof workflows];
    }
    return workflows.default;
  };

  const currentWorkflow = getWorkflowForTab();

  if (isCollapsed) {
    return (
      <div className="fixed right-4 bottom-4 z-40">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
          title="ワークフローガイドを表示"
        >
          <span className="text-2xl">🎯</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 bg-white rounded-lg shadow-xl p-6 max-w-sm z-40 border-2 border-indigo-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-indigo-700 flex items-center gap-2">
          <span>🎯</span>
          <span>次のステップ</span>
        </h3>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-gray-400 hover:text-gray-600 text-xl"
          title="最小化"
        >
          ✕
        </button>
      </div>

      {/* Workflow steps */}
      <ol className="space-y-3">
        {currentWorkflow.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
              {item.step}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <strong className="text-gray-800 text-sm">{item.title}</strong>
              </div>
              <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Footer tip */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 italic">
          💡 各タブにマウスを合わせると、詳しい説明が表示されます
        </p>
      </div>
    </div>
  );
};

export default WorkflowGuide;
