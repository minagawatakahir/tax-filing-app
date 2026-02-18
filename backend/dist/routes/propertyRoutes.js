"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyController_1 = require("../controllers/propertyController");
const router = (0, express_1.Router)();
/**
 * POST /api/properties
 * 不動産物件を作成
 */
router.post('/', propertyController_1.createPropertyHandler);
/**
 * GET /api/properties
 * 不動産物件一覧を取得
 */
router.get('/', propertyController_1.getAllPropertiesHandler);
/**
 * GET /api/properties/:id
 * 特定の不動産物件を取得
 */
router.get('/:id', propertyController_1.getPropertyByIdHandler);
/**
 * PUT /api/properties/:id
 * 不動産物件を更新
 */
router.put('/:id', propertyController_1.updatePropertyHandler);
/**
 * DELETE /api/properties/:id
 * 不動産物件を削除
 */
router.delete('/:id', propertyController_1.deletePropertyHandler);
exports.default = router;
