import { Router } from 'express';
import {
  saveCapitalGainHandler,
  getCapitalGainRecordsHandler,
  deleteCapitalGainRecordHandler,
} from '../controllers/capitalGainController';

const router = Router();

// 譲渡所得計算結果を保存
router.post('/save', saveCapitalGainHandler);

// 譲渡所得計算履歴を取得
router.get('/records', getCapitalGainRecordsHandler);

// 譲渡所得計算履歴を削除
router.delete('/records/:id', deleteCapitalGainRecordHandler);

export default router;
