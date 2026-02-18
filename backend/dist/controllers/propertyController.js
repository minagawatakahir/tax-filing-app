"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePropertyHandler = exports.updatePropertyHandler = exports.getPropertyByIdHandler = exports.getAllPropertiesHandler = exports.createPropertyHandler = void 0;
const propertyService_1 = require("../services/propertyService");
/**
 * 不動産物件を作成するハンドラー
 */
const createPropertyHandler = async (req, res) => {
    try {
        const propertyData = req.body;
        const result = await (0, propertyService_1.createProperty)(propertyData);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};
exports.createPropertyHandler = createPropertyHandler;
/**
 * すべての不動産物件を取得するハンドラー
 */
const getAllPropertiesHandler = async (req, res) => {
    try {
        const result = await (0, propertyService_1.getAllProperties)();
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.getAllPropertiesHandler = getAllPropertiesHandler;
/**
 * 特定の不動産物件を取得するハンドラー
 */
const getPropertyByIdHandler = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await (0, propertyService_1.getPropertyById)(id);
        if (!result) {
            res.status(404).json({
                success: false,
                error: '不動産物件が見つかりません',
            });
            return;
        }
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.getPropertyByIdHandler = getPropertyByIdHandler;
/**
 * 不動産物件を更新するハンドラー
 */
const updatePropertyHandler = async (req, res) => {
    try {
        const id = req.params.id;
        const propertyData = req.body;
        const result = await (0, propertyService_1.updateProperty)(id, propertyData);
        if (!result) {
            res.status(404).json({
                success: false,
                error: '不動産物件が見つかりません',
            });
            return;
        }
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};
exports.updatePropertyHandler = updatePropertyHandler;
/**
 * 不動産物件を削除するハンドラー
 */
const deletePropertyHandler = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await (0, propertyService_1.deleteProperty)(id);
        if (!result) {
            res.status(404).json({
                success: false,
                error: '不動産物件が見つかりません',
            });
            return;
        }
        res.json({
            success: true,
            message: '不動産物件を削除しました',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.deletePropertyHandler = deletePropertyHandler;
