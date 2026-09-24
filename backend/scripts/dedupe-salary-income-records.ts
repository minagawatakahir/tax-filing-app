/**
 * 給与所得レコードの重複整理（TX-61 の一意インデックス {userId, year} を有効にするため）
 *
 * 既存データに同じ userId・年度のレコードが複数あると、MongoDB は一意インデックスを作成できず、
 * 「年度ごとに1件」の保証が効かない。本スクリプトは重複を整理してからインデックスを作成する。
 *
 * 使い方:
 *   npm run db:dedupe-salary            # 確認のみ（dry-run、何も変更しない）
 *   npm run db:dedupe-salary -- --apply # 実行（削除対象をバックアップしてから削除し、インデックスを作成）
 *
 * 残すレコード: 同じ userId・年度の中で最新のもの（updatedAt → createdAt → _id の降順）
 */
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SalaryIncomeRecord } from '../src/models/SalaryIncomeRecord';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tax-filing-app';
const BACKUP_DIR = path.resolve(__dirname, '../backups');

interface DuplicateGroup {
  _id: { userId: string | null; year: number };
  docs: Array<{
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    estimatedTax?: number;
  }>;
}

const formatDate = (d?: Date) => (d ? new Date(d).toISOString() : '-');

async function main() {
  const apply = process.argv.includes('--apply');
  // 接続時の自動インデックス作成は行わない（重複があると失敗するため。--apply 時に明示的に作成する）
  mongoose.set('autoIndex', false);
  await mongoose.connect(MONGODB_URI);
  const collection = SalaryIncomeRecord.collection;

  console.log(`対象: ${MONGODB_URI} / ${collection.collectionName}`);
  console.log(apply ? 'モード: 実行（--apply）\n' : 'モード: 確認のみ（dry-run）\n');

  const groups = (await collection
    .aggregate([
      { $sort: { updatedAt: -1, createdAt: -1, _id: -1 } },
      {
        $group: {
          _id: { userId: '$userId', year: '$year' },
          docs: {
            $push: {
              _id: '$_id',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
              estimatedTax: '$result.estimatedTax',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { '_id.userId': 1, '_id.year': 1 } },
    ])
    .toArray()) as unknown as DuplicateGroup[];

  const toDelete: mongoose.Types.ObjectId[] = [];
  if (groups.length === 0) {
    console.log('重複はありません。');
  }
  for (const group of groups) {
    const [keep, ...rest] = group.docs;
    console.log(`■ userId=${group._id.userId ?? '(なし)'} / ${group._id.year}年度: ${group.docs.length}件`);
    console.log(
      `  残す  : ${keep._id}  updatedAt=${formatDate(keep.updatedAt)}  推定税額=${keep.estimatedTax ?? '-'}`
    );
    for (const doc of rest) {
      console.log(
        `  削除  : ${doc._id}  updatedAt=${formatDate(doc.updatedAt)}  推定税額=${doc.estimatedTax ?? '-'}`
      );
      toDelete.push(doc._id);
    }
  }

  const indexes = await collection.indexes();
  const hasUniqueIndex = indexes.some(
    (i) => i.unique && i.key && i.key.userId === 1 && i.key.year === 1
  );
  console.log(`\n削除対象: ${toDelete.length}件 / 一意インデックス {userId, year}: ${hasUniqueIndex ? 'あり' : 'なし'}`);

  if (!apply) {
    console.log('\n確認のみのため何も変更していません。実行するには --apply を付けてください。');
    return;
  }

  if (toDelete.length > 0) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const backupFile = path.join(
      BACKUP_DIR,
      `salary-income-records-dedupe-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    const backupDocs = await collection.find({ _id: { $in: toDelete } }).toArray();
    fs.writeFileSync(backupFile, JSON.stringify(backupDocs, null, 2));
    console.log(`\n削除対象をバックアップしました: ${backupFile}`);

    const { deletedCount } = await collection.deleteMany({ _id: { $in: toDelete } });
    console.log(`${deletedCount}件を削除しました。`);
  }

  await SalaryIncomeRecord.createIndexes();
  const after = await collection.indexes();
  console.log(
    '一意インデックスを作成しました:',
    after.filter((i) => i.unique).map((i) => JSON.stringify(i.key)).join(', ')
  );
}

main()
  .catch((error) => {
    console.error('❌ エラー:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
