"use strict";
/**
 * 不動産所得計算サービス (TX-20 & TX-29)
 * 家賃収入、経費管理、減価償却費を統合して不動産所得を計算
 * TX-29: 取得関連費用（不動産取得税）を取得年度に計上
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRealEstateIncomePortfolio = exports.calculateRealEstateIncome = exports.calculateTotalExpenses = exports.calculateRentalIncome = exports.calculateProportionalLoanGuarantee = exports.calculateProportionalInsurance = exports.calculateProportionalAmount = void 0;
const depreciationService_1 = require("./depreciationService");
const Property_1 = __importDefault(require("../models/Property"));
// TX-32: 複数年払い経費計算
const multiYearExpenseHelpers_1 = require("./multiYearExpenseHelpers");
/**
 * 月別按分計算（TX-33対応）
 * @param annualAmount - 年間金額
 * @param endMonth - 終了月（1-12、未指定 or 12 = 全年度）
 * @returns 按分計算後の金額
 */
const calculateProportionalAmount = (annualAmount, endMonth) => {
    if (!endMonth || endMonth >= 12) {
        return annualAmount;
    }
    if (endMonth < 1 || endMonth > 12) {
        throw new Error('終了月は1-12の範囲で指定してください');
    }
    return Math.round(annualAmount * endMonth / 12);
};
exports.calculateProportionalAmount = calculateProportionalAmount;
/**
 * TX-48: 複数年払い保険料の按分計算
 * @param totalAmount - 総支払額
 * @param startMonth - 開始年月（YYYY-MM形式）
 * @param endMonth - 終了年月（YYYY-MM形式）
 * @param fiscalYear - 会計年度（開始年）
 * @returns 当年度按分額
 */
const calculateProportionalInsurance = (totalAmount, startMonth, endMonth, fiscalYear) => {
    if (!startMonth || !endMonth || totalAmount === 0) {
        return 0;
    }
    const startDate = new Date(startMonth);
    const endDate = new Date(endMonth);
    // 総月数を計算
    const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth()) + 1;
    // 当年度利用月数を計算（会計年度: 4月-3月）
    const fiscalYearStart = new Date(fiscalYear, 3, 1); // 4月1日
    const fiscalYearEnd = new Date(fiscalYear + 1, 2, 31); // 3月31日
    const overlapStart = new Date(Math.max(startDate.getTime(), fiscalYearStart.getTime()));
    const overlapEnd = new Date(Math.min(endDate.getTime(), fiscalYearEnd.getTime()));
    if (overlapStart > overlapEnd) {
        return 0; // 対象期間外
    }
    const fiscalYearMonths = (overlapEnd.getFullYear() - overlapStart.getFullYear()) * 12 +
        (overlapEnd.getMonth() - overlapStart.getMonth()) + 1;
    return Math.round(totalAmount * (fiscalYearMonths / totalMonths));
};
exports.calculateProportionalInsurance = calculateProportionalInsurance;
/**
 * TX-48: ローン保証料の按分計算
 * @param totalAmount - 総支払額
 * @param loanYears - ローン期間（年）
 * @param paymentMonth - 支払開始年月（YYYY-MM形式）
 * @param fiscalYear - 会計年度（開始年）
 * @returns 当年度按分額
 */
const calculateProportionalLoanGuarantee = (totalAmount, loanYears, paymentMonth, fiscalYear) => {
    if (!paymentMonth || loanYears === 0 || totalAmount === 0) {
        return 0;
    }
    const paymentDate = new Date(paymentMonth);
    const annualAmount = totalAmount / loanYears;
    // 当年度利用月数を計算
    const fiscalYearStart = new Date(fiscalYear, 3, 1); // 4月1日
    const fiscalYearEnd = new Date(fiscalYear + 1, 2, 31); // 3月31日
    const loanEndDate = new Date(paymentDate.getFullYear() + loanYears, paymentDate.getMonth(), paymentDate.getDate());
    const overlapStart = new Date(Math.max(paymentDate.getTime(), fiscalYearStart.getTime()));
    const overlapEnd = new Date(Math.min(loanEndDate.getTime(), fiscalYearEnd.getTime()));
    if (overlapStart > overlapEnd) {
        return 0;
    }
    const fiscalYearMonths = (overlapEnd.getFullYear() - overlapStart.getFullYear()) * 12 +
        (overlapEnd.getMonth() - overlapStart.getMonth()) + 1;
    return Math.round(annualAmount * (fiscalYearMonths / 12));
};
exports.calculateProportionalLoanGuarantee = calculateProportionalLoanGuarantee;
/**
 * 家賃収入を計算（TX-33対応）
 */
const calculateRentalIncome = (monthlyRent, months, otherIncome = 0) => {
    return monthlyRent * months + otherIncome;
};
exports.calculateRentalIncome = calculateRentalIncome;
/**
 * 経費合計を計算
 */
const calculateTotalExpenses = (expenses) => {
    return (expenses.managementFee +
        expenses.repairCost +
        expenses.insurance +
        expenses.utilities +
        expenses.otherExpenses +
        expenses.propertyTax +
        expenses.loanInterest);
};
exports.calculateTotalExpenses = calculateTotalExpenses;
/**
 * 不動産所得を計算（TX-29: 取得年度に不動産取得税を計上）
 */
const calculateRealEstateIncome = async (income, expenses, depreciationAsset) => {
    // TX-29: propertyId から物件情報を取得（取得年度の判定）
    let isAcquisitionYear = false;
    let acquisitionTaxAmount = 0;
    if (expenses.propertyId && expenses.acquisitionTax !== undefined) {
        try {
            const property = await Property_1.default.findOne({ propertyId: expenses.propertyId });
            if (property) {
                // 取得年度かどうかを判定
                const acquisitionYear = property.acquisitionDate.getFullYear();
                isAcquisitionYear = (acquisitionYear === expenses.year);
                // 取得年度の場合のみ不動産取得税を計上
                if (isAcquisitionYear) {
                    acquisitionTaxAmount = expenses.acquisitionTax || 0;
                }
            }
        }
        catch (error) {
            console.warn(`Property lookup failed for ${expenses.propertyId}:`, error);
            // エラーが発生した場合は入力値を信頼する
            isAcquisitionYear = expenses.acquisitionTax ? true : false;
            acquisitionTaxAmount = isAcquisitionYear ? (expenses.acquisitionTax || 0) : 0;
        }
    }
    else {
        // propertyId がない場合は、acquisitionTax があれば計上
        acquisitionTaxAmount = expenses.acquisitionTax || 0;
    }
    // TX-33: 月別按分計算
    const rentalMonths = income.rentalEndMonth || 12;
    const totalRentalIncome = (0, exports.calculateRentalIncome)(income.monthlyRent, rentalMonths, income.otherIncome);
    const totalIncome = totalRentalIncome;
    // 経費計算（TX-33対応で按分）
    const expenseEndMonth = expenses.expenseEndMonth || 12;
    const operatingExpenses = (0, exports.calculateProportionalAmount)(expenses.managementFee +
        expenses.repairCost +
        expenses.insurance +
        expenses.utilities +
        expenses.otherExpenses, expenseEndMonth);
    const propertyTaxExpense = (0, exports.calculateProportionalAmount)(expenses.propertyTax, expenseEndMonth);
    const loanInterestExpense = (0, exports.calculateProportionalAmount)(expenses.loanInterest, expenseEndMonth);
    // 減価償却費の計算
    let depreciationExpense = 0;
    if (depreciationAsset) {
        // 日付を確実にDateオブジェクトに変換
        const asset = {
            ...depreciationAsset,
            acquisitionDate: new Date(depreciationAsset.acquisitionDate),
        };
        const schedule = (0, depreciationService_1.generateDepreciationSchedule)(asset);
        const currentYear = income.year; // 指定された年度を使用
        const currentYearSchedule = schedule.find(s => s.year === currentYear);
        if (currentYearSchedule) {
            // TX-33対応: 減価償却費も按分
            depreciationExpense = (0, exports.calculateProportionalAmount)(currentYearSchedule.annualDepreciation, expenseEndMonth);
        }
    }
    // TX-32: 複数年払い経費を計算
    let annualInsuranceExpense = 0;
    let annualLoanGuaranteeExpense = 0;
    let renovationExpense = 0;
    let loanProcessingFeeExpense = 0;
    if (expenses.propertyId) {
        try {
            const property = await Property_1.default.findOne({ propertyId: expenses.propertyId });
            if (property) {
                // 火災・地震保険の按分計算
                if (property.insurancePaidAmount &&
                    property.insuranceCoveragePeriodYears &&
                    property.insurancePaymentStartDate) {
                    annualInsuranceExpense = (0, multiYearExpenseHelpers_1.calculateAnnualExpenseFromMultiYearPayment)(property.insurancePaidAmount, property.insuranceCoveragePeriodYears, property.insurancePaymentStartDate, expenses.year);
                }
                // ローン保証料の按分計算
                if (property.loanGuaranteePaidAmount &&
                    property.loanGuaranteePeriodYears &&
                    property.loanGuaranteeStartDate) {
                    annualLoanGuaranteeExpense = (0, multiYearExpenseHelpers_1.calculateAnnualExpenseFromMultiYearPayment)(property.loanGuaranteePaidAmount, property.loanGuaranteePeriodYears, property.loanGuaranteeStartDate, expenses.year);
                }
                // リフォーム費用の集計
                renovationExpense = (0, multiYearExpenseHelpers_1.calculateRenovationExpenseForYear)(property.renovationExpenses, expenses.year);
                // ローン手数料（取得年度のみ）
                const acquisitionYear = property.acquisitionDate.getFullYear();
                if (property.loanProcessingFee && acquisitionYear === expenses.year) {
                    loanProcessingFeeExpense = property.loanProcessingFee;
                }
            }
        }
        catch (error) {
            console.warn(`Property lookup failed for TX-32 calculation:`, error);
        }
    }
    // 総経費（TX-29: 不動産取得税を追加、TX-32: 複数年払い経費を追加）
    const totalExpenses = operatingExpenses +
        propertyTaxExpense +
        loanInterestExpense +
        depreciationExpense +
        acquisitionTaxAmount +
        annualInsuranceExpense +
        annualLoanGuaranteeExpense +
        renovationExpense +
        loanProcessingFeeExpense;
    // 不動産所得
    const realEstateIncome = totalIncome - totalExpenses;
    return {
        propertyId: income.propertyId,
        year: income.year,
        totalRentalIncome,
        otherIncome: income.otherIncome,
        totalIncome,
        operatingExpenses,
        propertyTax: propertyTaxExpense,
        loanInterest: loanInterestExpense,
        depreciationExpense,
        acquisitionTaxExpense: acquisitionTaxAmount, // TX-29: 追加
        totalExpenses,
        realEstateIncome,
        expenseBreakdown: {
            managementFee: expenses.managementFee,
            repairCost: expenses.repairCost,
            insurance: expenses.insurance,
            utilities: expenses.utilities,
            otherExpenses: expenses.otherExpenses,
            depreciationExpense,
            propertyTax: propertyTaxExpense,
            loanInterest: loanInterestExpense,
            acquisitionTax: acquisitionTaxAmount, // TX-29: 追加
            annualInsuranceExpense, // TX-32: 追加
            annualLoanGuaranteeExpense, // TX-32: 追加
            renovationExpense, // TX-32: 追加
            loanProcessingFee: loanProcessingFeeExpense, // TX-32: 追加
        },
    };
};
exports.calculateRealEstateIncome = calculateRealEstateIncome;
/**
 * 複数物件の不動産所得を計算
 */
const calculateRealEstateIncomePortfolio = (year, calculations) => {
    const totalIncome = calculations.reduce((sum, c) => sum + c.totalIncome, 0);
    const totalExpenses = calculations.reduce((sum, c) => sum + c.totalExpenses, 0);
    const totalRealEstateIncome = calculations.reduce((sum, c) => sum + c.realEstateIncome, 0);
    const positiveIncomeCount = calculations.filter(c => c.realEstateIncome > 0).length;
    const negativeIncomeCount = calculations.filter(c => c.realEstateIncome < 0).length;
    return {
        year,
        properties: calculations,
        totalIncome,
        totalExpenses,
        totalRealEstateIncome,
        propertyCount: calculations.length,
        positiveIncomeCount,
        negativeIncomeCount,
    };
};
exports.calculateRealEstateIncomePortfolio = calculateRealEstateIncomePortfolio;
