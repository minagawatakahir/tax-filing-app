"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const capitalGainController_1 = require("../controllers/capitalGainController");
const router = (0, express_1.Router)();
// 譲渡所得計算結果を保存
router.post('/save', capitalGainController_1.saveCapitalGainHandler);
// 譲渡所得計算履歴を取得
router.get('/records', capitalGainController_1.getCapitalGainRecordsHandler);
// 譲渡所得計算履歴を削除
router.delete('/records/:id', capitalGainController_1.deleteCapitalGainRecordHandler);
exports.default = router;
