import { Request, Response } from 'express';
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '../services/propertyService';

/**
 * 不動産物件を作成するハンドラー
 */
export const createPropertyHandler = async (req: Request, res: Response) => {
  try {
    const propertyData = req.body;
    const result = await createProperty(propertyData);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * すべての不動産物件を取得するハンドラー
 */
export const getAllPropertiesHandler = async (req: Request, res: Response) => {
  try {
    const result = await getAllProperties();
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 特定の不動産物件を取得するハンドラー
 */
export const getPropertyByIdHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await getPropertyById(id);
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 不動産物件を更新するハンドラー
 */
export const updatePropertyHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const propertyData = req.body;
    const result = await updateProperty(id, propertyData);
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 不動産物件を削除するハンドラー
 */
export const deletePropertyHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await deleteProperty(id);
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
