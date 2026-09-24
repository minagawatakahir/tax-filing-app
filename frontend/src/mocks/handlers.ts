import { http, HttpResponse } from 'msw';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const handlers = [
  // Salary Income API
  http.post(`${API_URL}/salary-income/calculate`, async ({ request }) => {
    const body = await request.json() as any;
    
    // Mock calculation logic
    const { annualSalary, withheldTax, socialInsurance, lifeInsurance, dependents, spouseDeduction } = body;
    
    // Simplified mock calculation
    const salaryIncomeDeduction = Math.min(annualSalary * 0.3, 1950000);
    const salaryIncome = annualSalary - salaryIncomeDeduction;
    const basicDeduction = 480000;
    const dependentDeduction = (dependents || 0) * 380000;
    const spouseDeductionAmount = spouseDeduction ? 380000 : 0;
    const lifeInsuranceDeduction = Math.min(lifeInsurance || 0, 120000);
    
    const totalDeduction = 
      (socialInsurance || 0) + 
      lifeInsuranceDeduction + 
      basicDeduction + 
      dependentDeduction + 
      spouseDeductionAmount;
    
    const taxableIncome = Math.max(0, salaryIncome - totalDeduction);
    const estimatedTax = Math.round(taxableIncome * 0.05);

    return HttpResponse.json({
      success: true,
      data: {
        annualSalary,
        salaryIncomeDeduction,
        salaryIncome,
        socialInsurance: socialInsurance || 0,
        lifeInsurance: lifeInsuranceDeduction,
        basicDeduction,
        dependentDeduction,
        spouseDeduction: spouseDeductionAmount,
        totalDeduction,
        taxableIncome,
        estimatedTax,
      },
    });
  }),

  // Real Estate Income API
  http.post(`${API_URL}/real-estate-income/calculate`, async ({ request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      success: true,
      data: {
        propertyId: body.propertyId,
        year: body.year,
        totalIncome: 1800000,
        totalExpenses: 800000,
        netIncome: 1000000,
        taxableIncome: 1000000,
      },
    });
  }),

  // Capital Gain API
  http.post(`${API_URL}/capital-gain/calculate`, async ({ request }) => {
    const body = await request.json() as any;
    
    const { salePrice, acquisitionCost, brokerageFee, surveyCost, registrationCost, otherExpenses, specialDeduction } = body;
    
    const transferExpenses = (brokerageFee || 0) + (surveyCost || 0) + (registrationCost || 0) + (otherExpenses || 0);
    const capitalGain = salePrice - (acquisitionCost || 0) - transferExpenses;
    const taxableCapitalGain = Math.max(0, capitalGain - (specialDeduction || 0));
    
    return HttpResponse.json({
      success: true,
      data: {
        propertyId: body.propertyId,
        salePrice,
        acquisitionCost: acquisitionCost || 0,
        transferExpenses,
        capitalGain,
        specialDeduction: specialDeduction || 0,
        taxableCapitalGain,
        transferType: 'long-term',
        incomeTax: Math.round(taxableCapitalGain * 0.15),
        residentTax: Math.round(taxableCapitalGain * 0.05),
        totalTax: Math.round(taxableCapitalGain * 0.20),
        ownershipPeriod: {
          years: 10,
          months: 0,
        },
      },
    });
  }),

  // Properties API
  http.get(`${API_URL}/properties`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'prop-1',
          name: 'テストマンション',
          type: 'マンション',
          address: '東京都渋谷区',
          purchaseDate: '2015-01-01',
          purchasePrice: 30000000,
        },
      ],
    });
  }),

  // User API
  http.get(`${API_URL}/user/profile`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'テストユーザー',
        taxpayerId: 'TAX123456',
      },
    });
  }),

  // Health Check
  http.get(`${API_URL}/health`, () => {
    return HttpResponse.json({
      success: true,
      message: 'API is healthy',
    });
  }),
];
