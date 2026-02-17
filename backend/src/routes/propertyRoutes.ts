import { Router } from 'express';
import {
  createPropertyHandler,
  getAllPropertiesHandler,
  getPropertyByIdHandler,
  updatePropertyHandler,
  deletePropertyHandler,
} from '../controllers/propertyController';

const router = Router();

/**
 * POST /api/properties
 * 不動産物件を作成
 */
router.post('/', createPropertyHandler);

/**
 * GET /api/properties
 * 不動産物件一覧を取得
 */
router.get('/', getAllPropertiesHandler);

/**
 * GET /api/properties/:id
 * 特定の不動産物件を取得
 */
router.get('/:id', getPropertyByIdHandler);

/**
 * PUT /api/properties/:id
 * 不動産物件を更新
 */
router.put('/:id', updatePropertyHandler);

/**
 * DELETE /api/properties/:id
 * 不動産物件を削除
 */
router.delete('/:id', deletePropertyHandler);

export default router;
