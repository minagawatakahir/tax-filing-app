/**
 * 譲渡所得計算サービス
 */

import Property from '../models/Property';

export interface CapitalGainInput {
  propertyId: string; // Property モデルから取得費を取得するため必須
  saleDate: string;
  salePrice: number;
  brokerageFee: number;
  surveyCost: number;
  registrationCost: number;
  otherExpenses: number;
  specialDeduction: number;
  // 以下のフィールドは後方互換性のため残す（propertyIdがあれば不要）
  acquisitionDate?: string;
  acquisitionCost?: number;
  acquisitionExpenses?: number;
}

export interface OwnershipPeriod {
  years: number;
  months: number;
}

export interface CapitalGainCalculation {
  saleAmount: number;
  acquisitionCost: number; // 取得費（取得関連費用含む）
  transferExpenses: number;
  capitalGain: number;
  specialDeduction: number;
  taxableCapitalGain: number;
  ownershipPeriod: OwnershipPeriod;
  transferType: 'long-term' | 'short-term';
  taxRate: number;
  incomeTax: number;
  residentTax: number;
  reconstructionTax: number;
  totalTax: number;
  // TX-30: 取得関連費用の内訳を追加
  breakdown?: {
    baseCost: number; // 基本取得費
    acquisitionTax: number; // 不動産取得税
    registrationTax: number; // 登録免許税
    brokerFee: number; // 仲介手数料
    otherAcquisitionCosts: number; // その他取得費用
  };
}

/**
 * 所有期間を計算（年と月）
 */
const calculateOwnershipPeriod = (acquisitionDate: Date, saleDate: Date): OwnershipPeriod => {
  let years = saleDate.getFullYear() - acquisitionDate.getFullYear();
  let months = saleDate.getMonth() - acquisitionDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months };
};

/**
 * 譲渡所得を計算（TX-30: Property モデルから取得関連費用を取得）
 */
export const calculateCapitalGain = async (
  input: CapitalGainInput
): Promise<CapitalGainCalculation> => {
  // TX-30: propertyId から物件情報を取得
  let property = null;
  let acquisitionDate: Date;
  let baseCost: number;
  let acquisitionTaxAmount: number = 0;
  let registrationTaxAmount: number = 0;
  let brokerFeeAmount: number = 0;
  let otherCostsAmount: number = 0;

  if (input.propertyId) {
    try {
      property = await Property.findOne({ propertyId: input.propertyId });
      
      if (property) {
        acquisitionDate = property.acquisitionDate;
        baseCost = property.acquisitionCost;
        
        // TX-30: 取得関連費用を取得
        acquisitionTaxAmount = property.acquisitionTax || 0;
        registrationTaxAmount = property.registrationTax || 0;
        brokerFeeAmount = property.brokerFee || 0;
        otherCostsAmount = property.otherAcquisitionCosts || 0;
      } else {
        // 物件が見つからない場合は入力値を使用（後方互換性）
        acquisitionDate = input.acquisitionDate ? new Date(input.acquisitionDate) : new Date();
        baseCost = input.acquisitionCost || 0;
      }
    } catch (error) {
      console.warn(`Property lookup failed for ${input.propertyId}:`, error);
      // エラーが発生した場合は入力値を使用
      acquisitionDate = input.acquisitionDate ? new Date(input.acquisitionDate) : new Date();
      baseCost = input.acquisitionCost || 0;
    }
  } else {
    // propertyId がない場合は入力値を使用（後方互換性）
    acquisitionDate = input.acquisitionDate ? new Date(input.acquisitionDate) : new Date();
    baseCost = input.acquisitionCost || 0;
  }

  const saleDate = new Date(input.saleDate);

  // 所有期間計算
  const ownershipPeriod = calculateOwnershipPeriod(acquisitionDate, saleDate);
  const isSaleYearEnd = saleDate.getFullYear();
  const acquisitionYearEnd = acquisitionDate.getFullYear();

  // 長期/短期判定：売却年の1月1日時点で取得後5年超
  const transferType: 'long-term' | 'short-term' =
    isSaleYearEnd - acquisitionYearEnd > 5 ? 'long-term' : 'short-term';

  // 転売費用
  const transferExpenses =
    input.brokerageFee +
    input.surveyCost +
    input.registrationCost +
    input.otherExpenses;

  // TX-30: 取得費 = 基本取得費 + 取得関連費用
  const totalAcquisitionCost = 
    baseCost +
    acquisitionTaxAmount +
    registrationTaxAmount +
    brokerFeeAmount +
    otherCostsAmount;

  // 譲渡所得 = 売却価格 - (取得費 + 転売費用)
  const capitalGain = input.salePrice - (totalAcquisitionCost + transferExpenses);

  // 特別控除後の課税譲渡所得
  const taxableCapitalGain = Math.max(0, capitalGain - input.specialDeduction);

  // 税率
  const taxRate = transferType === 'long-term' ? 0.20315 : 0.3963;

  // 所得税、住民税、復興特別所得税を計算
  const incomeTax = transferType === 'long-term'
    ? taxableCapitalGain * 0.15
    : taxableCapitalGain * 0.30;

  const residentTax = transferType === 'long-term'
    ? taxableCapitalGain * 0.05
    : taxableCapitalGain * 0.09;

  const reconstructionTax =
    transferType === 'long-term'
      ? taxableCapitalGain * 0.15 * 0.0021
      : taxableCapitalGain * 0.30 * 0.0021;

  const totalTax = incomeTax + residentTax + reconstructionTax;

  return {
    saleAmount: input.salePrice,
    acquisitionCost: totalAcquisitionCost,
    transferExpenses,
    capitalGain,
    specialDeduction: input.specialDeduction,
    taxableCapitalGain,
    ownershipPeriod,
    transferType,
    taxRate,
    incomeTax: Math.round(incomeTax),
    residentTax: Math.round(residentTax),
    reconstructionTax: Math.round(reconstructionTax),
    totalTax: Math.round(totalTax),
    // TX-30: 内訳を追加
    breakdown: {
      baseCost,
      acquisitionTax: acquisitionTaxAmount,
      registrationTax: registrationTaxAmount,
      brokerFee: brokerFeeAmount,
      otherAcquisitionCosts: otherCostsAmount,
    },
  };
};
