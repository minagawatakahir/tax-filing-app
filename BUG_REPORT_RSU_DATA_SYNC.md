# 🐛 バグレポート: RSU所得データがフロントエンド編集画面に反映されない

**報告日**: 2026年2月27日  
**優先度**: 🔴 高  
**ステータス**: 🔍 確認中  
**関連チケット**: TX-49（データ移行）, TX-50（DB仕様書化）

---

## 📋 概要

RSU所得のデータが MongoDB に正常に保存されており、API経由でも正しく取得可能ですが、フロントエンドの **RSUExchangeModule（編集画面）** には既存データが表示されず、初期状態（空フォーム）で表示されます。

---

## 🔍 確認事項

### ✅ データベース側
```
MongoDB コレクション: rsuincomerecords
2025年度データ: 存在 ✅
総RSU所得: ¥3,846,683
権利確定記録: 7件
```

### ✅ API側
```
エンドポイント: GET /api/rsu-income/list?year=2025
レスポンス: 200 OK ✅
データ: 正常に返される ✅
```

### ❌ フロントエンド側
```
RSUIncomeListModule（一覧）: データ表示 ✅
RSUExchangeModule（編集画面）: データ読み込み ❌
```

---

## 🐛 問題の原因

### RSUExchangeModule.tsx の実装不足

**ファイル**: `frontend/src/components/RSUExchangeModule.tsx`

**問題点**:

1. **useEffect がない、または不完全**
   - コンポーネント初期化時に既存データを取得していない
   - 年度（year）が変更されても、対応するRSUレコードを読み込まない

2. **フォーム初期化ロジックが不足**
   ```typescript
   // 現在の実装（推定）
   const [rsuEntries, setRsuEntries] = useState([]); // 常に空配列で初期化
   
   // 必要な実装
   useEffect(() => {
     if (selectedYear) {
       fetchRSUData(selectedYear); // 既存データを取得
     }
   }, [selectedYear]);
   ```

3. **データフロー**
   ```
   (期待される)
   ユーザーが年度を選択
     ↓
   useEffect が発動
     ↓
   API GET /api/rsu-income/list?year=2025 を呼び出し
     ↓
   MongoDB から 2025年度データを取得
     ↓
   フォーム入力欄にデータを自動埋め込み
   
   (実際の動作)
   ユーザーが年度を選択
     ↓
   フォームが初期状態（空）で表示される
   ```

---

## 🔧 修正方法

### 1. useEffect フックの追加

```typescript
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
const [rsuEntries, setRsuEntries] = useState([]);
const [loading, setLoading] = useState(false);

// 年度が変更されたときに既存データを読み込む
useEffect(() => {
  if (selectedYear) {
    fetchRSUData(selectedYear);
  }
}, [selectedYear]);

// API から RSU データを取得する関数
const fetchRSUData = async (year: number) => {
  try {
    setLoading(true);
    const response = await fetch(`/api/rsu-income/list?year=${year}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data && data.length > 0) {
        // 取得したデータをフォーム用に変換
        const rsuRecord = data[0];
        setRsuEntries(rsuRecord.input || []);
      } else {
        // その年度のデータが없으면 空フォーム
        setRsuEntries([]);
      }
    }
  } catch (error) {
    console.error('Failed to fetch RSU data:', error);
    setRsuEntries([]);
  } finally {
    setLoading(false);
  }
};
```

### 2. フォーム UI の改善

```typescript
return (
  <div>
    <h2>RSU所得 - {selectedYear}年度</h2>
    
    {loading && <p>データを読み込み中...</p>}
    
    {/* 既存データがある場合は表示 */}
    {!loading && rsuEntries.length > 0 && (
      <div className="alert alert-info">
        このページのRSU所得データ ({rsuEntries.length}件) を編集します
      </div>
    )}
    
    {/* フォーム */}
    <form>
      {rsuEntries.map((entry, idx) => (
        <div key={idx}>
          <input 
            type="text" 
            value={entry.companyName || ''} 
            placeholder="会社名"
          />
          <input 
            type="number" 
            value={entry.shares || ''} 
            placeholder="株数"
          />
          {/* その他のフィールド */}
        </div>
      ))}
    </form>
  </div>
);
```

---

## 📊 影響範囲

| 機能 | 状態 | 影響 |
|------|------|------|
| RSU所得一覧表示 | ✅ 正常 | なし |
| RSU所得新規作成 | ✅ 正常 | なし |
| **RSU所得編集** | ❌ 不具合 | **ユーザーが既存データを編集できない** |
| RSU所得削除 | ? 未確認 | ? |

---

## 🧪 再現手順

1. アプリケーションにアクセス
2. ダッシュボード → RSU所得モジュール
3. 2025年度を選択
4. **編集ボタン**をクリック（または RSUExchangeModule に遷移）
5. **期待**: 既存の7件の権利確定記録がフォーム内に表示される
6. **実際**: 空のフォームが表示される

---

## 📝 チェックリスト

- [ ] RSUExchangeModule に useEffect を追加
- [ ] fetchRSUData 関数を実装
- [ ] フォーム初期化ロジックを確認
- [ ] ローディング状態をハンドリング
- [ ] エラーハンドリングを追加
- [ ] フロントエンドテストを更新（TX-44）
- [ ] 動作確認（ブラウザで実際のデータフロー確認）

---

## 🔗 関連ファイル

| ファイル | 役割 | ステータス |
|---------|------|-----------|
| `frontend/src/components/RSUExchangeModule.tsx` | 編集画面（フロント） | ❌ 修正必要 |
| `backend/src/controllers/rsuIncomeController.ts` | API（バック） | ✅ 正常 |
| `backend/src/models/RSUIncomeRecord.ts` | スキーマ（DB） | ✅ 正常 |
| `frontend/src/components/RSUIncomeListModule.tsx` | 一覧画面 | ✅ 正常 |

---

## 📌 Jira タスク化推奨

このバグは新たに Jira タスクとして作成を推奨します：

**タイトル**: `RSU所得編集画面がDBデータを読み込まない`  
**優先度**: 🔴 高  
**工数**: 2-3時間  
**影響**: TX-44（Frontend テスト）の修正にも関連

---

## 次のアクション

1. ✅ バグ確認（本レポート）
2. 📝 Jira タスク作成
3. 🔧 RSUExchangeModule を修正
4. 🧪 テストケースを追加
5. ✅ 動作確認

---

**最終更新**: 2026年2月27日  
**報告者**: Development Team  
**確認者**: -
