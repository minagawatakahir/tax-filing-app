/**
 * TX-31: 減価償却計算のヘルパー関数
 * 取得関連費用を土地・建物に按分し、建物の減価償却基礎額を計算
 */

import Property from '../models/Property';
import { DepreciableAsset } from './depreciationService';

export interface AllocationResult {
  landPortion: number;
  buildingPortion: number;
}

/**
 * 取得関連費用を土地・建物の価値比率で按分
 * @param totalCost 取得関連費用の合計
 * @param landValue 土地価値
 * @param buildingValue 建物価値
 * @returns 土地・建物への按分結果
 */
export const allocateAcquisitionCosts = (
  totalCost: number,
  landValue: number,
  buildingValue: number
): AllocationResult => {
  const totalValue = landValue + buildingValue;
  
  if (totalValue === 0) {
    return {
      landPortion: 0,
      buildingPortion: 0,
    };
  }
  
  const landRatio = landValue / totalValue;
  const buildingRatio = buildingValue / totalValue;
  
  return {
    landPortion: Math.round(totalCost * landRatio),
    buildingPortion: Math.round(totalCost * buildingRatio),
  };
};

/**
 * TX-31: Propertyモデルから建物の減価償却基礎額を計算
 * @param propertyId 物件ID
 * @returns 建物の減価償却基礎額（建物価値 + 建物分の取得関連費用）
 */
export const calculateDepreciableBasis = async (
  propertyId: string
): Promise<number> => {
  const property = await Property.findOne({ propertyId });
  
  if (!property) {
    throw new Error(`物件が見つかりません: ${propertyId}`);
  }
  
  // 登録免許税 + 仲介手数料を按分対象とする
  // （不動産取得税は経費計上、その他取得費用は任意）
  const costsToAllocate = 
    (property.registrationTax || 0) + 
    (property.brokerFee || 0);
  
  if (costsToAllocate === 0) {
    // 取得関連費用がない場合は建物価値のみ
    return property.buildingValue;
  }
  
  // 土地・建物に按分
  const allocation = allocateAcquisitionCosts(
    costsToAllocate,
    property.landValue,
    property.buildingValue
  );
  
  // 建物の減価償却基礎 = 建物価値 + 建物分の取得関連費用
  const depreciableBasis = property.buildingValue + allocation.buildingPortion;
  
  return depreciableBasis;
};

/**
 * TX-31: Propertyモデルから減価償却資産を生成
 * @param propertyId 物件ID
 * @param usefulLife 耐用年数（オプション、未指定時は物件情報から取得）
 * @returns 減価償却資産
 */
export const createDepreciableAssetFromProperty = async (
  propertyId: string,
  usefulLife?: number
): Promise<DepreciableAsset> => {
  const property = await Property.findOne({ propertyId });
  
  if (!property) {
    throw new Error(`物件が見つかりません: ${propertyId}`);
  }
  
  // TX-31: 建物の減価償却基礎額を計算
  const depreciableBasis = await calculateDepreciableBasis(propertyId);
  
  // 耐用年数の取得
  const effectiveUsefulLife = usefulLife || property.usefulLife || 47; // デフォルトはRC造
  
  return {
    assetId: property.propertyId,
    assetName: property.propertyName || '建物',
    acquisitionDate: property.acquisitionDate,
    acquisitionCost: depreciableBasis, // TX-31: 取得関連費用を含む
    category: 'building',
    usefulLife: effectiveUsefulLife,
    depreciationMethod: property.depreciationMethod === 'declining-balance' ? 'declining' : 'straight',
  };
};
