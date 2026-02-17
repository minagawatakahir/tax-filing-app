import { Router } from 'express';
import { calculateSalaryIncomeHandler } from '../controllers/salaryIncomeController';

const router = Router();

/**
 * POST /api/salary-income/calculate
 * 給与所得を計算
 */
router.post('/calculate', calculateSalaryIncomeHandler);

export default router;
