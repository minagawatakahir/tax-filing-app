import { Request, Response } from 'express';
import {
  calculateRealEstateIncome,
  calculateRealEstateIncomePortfolio,
  RentalIncomeData,
  RealEstateExpense,
} from '../services/realEstateIncomeService';
import { DepreciableAsset } from '../services/depreciationService';
import Property from '../models/Property';

/**
 * 単一物件の不動産所得を計算
 */
export const calculateSinglePropertyIncomeHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { income, expenses, depreciationAsset } = req.body;

    if (!income || !expenses) {
      res.status(400).json({
        success: false,
        error: '収入データと経費データが必要です',
      });
      return;
    }

    // 物件IDが指定されている場合、物件情報から減価償却資産を作成
    let depreciationAssetToUse = depreciationAsset;
    
    if (income.propertyId && !depreciationAsset) {
      const property = await Property.findOne({ propertyId: income.propertyId });
      
      if (property && property.buildingValue && property.buildingValue > 0) {
        // 物件情報から減価償却資産を自動生成
        depreciationAssetToUse = {
          assetId: property.propertyId,
          assetName: property.propertyName || '建物',
          acquisitionDate: property.acquisitionDate,
          acquisitionCost: property.buildingValue, // 建物価値を取得価額とする
          category: 'building',
          usefulLife: property.usefulLife || getDefaultUsefulLife(property.buildingStructure, property.category),
          depreciationMethod: property.depreciationMethod === 'declining-balance' ? 'declining' : 'straight',
        } as DepreciableAsset;
      }
    }

    const result = calculateRealEstateIncome(
      income as RentalIncomeData,
      expenses as RealEstateExpense,
      depreciationAssetToUse as DepreciableAsset | undefined
    );

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
 * 建物構造とカテゴリーからデフォルト耐用年数を取得
 */
function getDefaultUsefulLife(
  structure?: 'wood' | 'steel' | 'rc' | 'src',
  category?: 'residential' | 'commercial' | 'land'
): number {
  // デフォルト値
  if (!structure) return 22; // RC造住宅用のデフォルト

  // 住宅用建物の耐用年数
  if (category === 'residential') {
    switch (structure) {
      case 'wood':
        return 22; // 木造
      case 'steel':
        return 27; // 鉄骨造（3mm超4mm以下）
      case 'rc':
      case 'src':
        return 47; // RC造・SRC造
      default:
        return 22;
    }
  }

  // 事業用建物の耐用年数
  if (category === 'commercial') {
    switch (structure) {
      case 'wood':
        return 22;
      case 'steel':
        return 38;
      case 'rc':
      case 'src':
        return 50;
      default:
        return 22;
    }
  }

  return 22; // その他のデフォルト
}

/**
 * 複数物件の不動産所得を一括計算
 */
export const calculatePortfolioIncomeHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { year, properties } = req.body;

    if (!year || !properties || !Array.isArray(properties)) {
      res.status(400).json({
        success: false,
        error: '年度と物件データ配列が必要です',
      });
      return;
    }

    const calculations = properties.map((property: any) => {
      return calculateRealEstateIncome(
        property.income as RentalIncomeData,
        property.expenses as RealEstateExpense,
        property.depreciationAsset as DepreciableAsset | undefined
      );
    });

    const portfolio = calculateRealEstateIncomePortfolio(year, calculations);

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
