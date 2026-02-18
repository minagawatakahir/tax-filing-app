import { Router } from 'express';
import {
  saveSalaryIncomeHandler,
  getSalaryIncomeRecordsHandler,
  deleteSalaryIncomeRecordHandler,
} from '../controllers/salaryIncomeController';

const router = Router();

// 給与所得計算結果を保存
router.post('/save', saveSalaryIncomeHandler);

// 給与所得計算履歴を取得
router.get('/records', getSalaryIncomeRecordsHandler);

// 給与所得計算履歴を削除
router.delete('/records/:id', deleteSalaryIncomeRecordHandler);

export default router;
