import React, { useState } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * OnboardingModal Component
 * Displays a welcome guide for first-time users
 * Part of TX-18 Phase 1 improvements
 */
const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: '📊 確定申告アシスタントへようこそ！',
      description: 'このアプリケーションは、複雑な税務計算を簡単にしてくれます。',
      icon: '👋',
    },
    {
      title: '🧮 所得入力',
      description: '給与、RSU、不動産などの収入を入力します。基本計算では簡単な税額計算ができます。',
      icon: '💼',
      details: [
        '基本計算：簡単に税額を計算',
        '給与所得：給与収入を管理',
        'RSU所得：権利確定の計算',
      ],
    },
    {
      title: '🏢 不動産・資産管理',
      description: '不動産物件を登録・管理し、売却時の計算をします。',
      icon: '🏠',
      details: [
        '物件管理：物件の情報を登録・管理',
        '不動産所得：物件の所得を計算',
        '物件売却：売却時の譲渡所得を計算',
      ],
    },
    {
      title: '📊 レポート・一覧',
      description: '計算結果を一覧で確認し、CSV/PDFで出力します。',
      icon: '📈',
      details: [
        'RSU所得管理：複数年度の管理・保存',
        '不動産所得一覧：年度全体のレポート',
        '売却所得一覧：売却結果の一覧・CSV出力',
      ],
    },
  ];

  const currentStep = steps[step];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{currentStep.icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{currentStep.title}</h2>
            {step > 0 && (
              <p className="text-sm text-gray-500 mt-1">ステップ {step} / {steps.length - 1}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-4">{currentStep.description}</p>

        {/* Details */}
        {currentStep.details && (
          <ul className="space-y-2 mb-6 bg-gray-50 p-4 rounded-lg">
            {currentStep.details.map((detail, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="text-indigo-600 font-bold">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4 mt-8">
          <button
            onClick={() => {
              if (step > 0) {
                setStep(step - 1);
              }
            }}
            disabled={step === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              step === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            ← 戻る
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === step ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to step ${index}`}
              />
            ))}
          </div>

          {step === steps.length - 1 ? (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              開始 ✨
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              次へ →
            </button>
          )}
        </div>

        {/* Skip button */}
        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
        >
          スキップ
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
