import { SalaryIncomeRecord, ISalaryIncomeRecord } from '../SalaryIncomeRecord';

describe('SalaryIncomeRecord Model', () => {
  describe('Record Creation', () => {
    it('should create a salary income record with valid data', async () => {
      const recordData = {
        userId: 'user123',
        year: 2025,
        input: {
          annualSalary: 5000000,
          withheldTax: 500000,
          socialInsurance: 600000,
          lifeInsurance: 80000,
          dependents: 1,
          spouseDeduction: true,
        },
        result: {
          annualSalary: 5000000,
          salaryIncomeDeduction: 1440000,
          salaryIncome: 3560000,
          socialInsurance: 600000,
          lifeInsurance: 80000,
          basicDeduction: 480000,
          dependentDeduction: 380000,
          spouseDeduction: 380000,
          totalDeduction: 1920000,
          taxableIncome: 1640000,
          estimatedTax: 82000,
        },
      };

      const record = new SalaryIncomeRecord(recordData);
      const savedRecord = await record.save();

      expect(savedRecord._id).toBeDefined();
      expect(savedRecord.userId).toBe('user123');
      expect(savedRecord.year).toBe(2025);
      expect(savedRecord.input.annualSalary).toBe(5000000);
      expect(savedRecord.result.taxableIncome).toBe(1640000);
    });

    it('should use default userId if not provided', async () => {
      const recordData = {
        year: 2025,
        input: {
          annualSalary: 5000000,
          withheldTax: 500000,
          socialInsurance: 600000,
        },
        result: {
          annualSalary: 5000000,
          salaryIncomeDeduction: 1440000,
          salaryIncome: 3560000,
          socialInsurance: 600000,
          lifeInsurance: 0,
          basicDeduction: 480000,
          dependentDeduction: 0,
          spouseDeduction: 0,
          totalDeduction: 1080000,
          taxableIncome: 2480000,
          estimatedTax: 124000,
        },
      };

      const record = new SalaryIncomeRecord(recordData);
      const savedRecord = await record.save();

      expect(savedRecord.userId).toBe('demo-user');
    });

    it('should require year', async () => {
      const recordData = {
        userId: 'user123',
        input: {
          annualSalary: 5000000,
          withheldTax: 500000,
          socialInsurance: 600000,
        },
        result: {
          annualSalary: 5000000,
          salaryIncomeDeduction: 1440000,
          salaryIncome: 3560000,
          socialInsurance: 600000,
          lifeInsurance: 0,
          basicDeduction: 480000,
          dependentDeduction: 0,
          spouseDeduction: 0,
          totalDeduction: 1080000,
          taxableIncome: 2480000,
          estimatedTax: 124000,
        },
      };

      const record = new SalaryIncomeRecord(recordData);

      try {
        await record.save();
        fail('Should have thrown a validation error');
      } catch (error: any) {
        expect(error.message).toContain('year');
      }
    });

    it('should require input fields', async () => {
      const recordData = {
        userId: 'user123',
        year: 2025,
        result: {
          annualSalary: 5000000,
          salaryIncomeDeduction: 1440000,
          salaryIncome: 3560000,
          socialInsurance: 600000,
          lifeInsurance: 0,
          basicDeduction: 480000,
          dependentDeduction: 0,
          spouseDeduction: 0,
          totalDeduction: 1080000,
          taxableIncome: 2480000,
          estimatedTax: 124000,
        },
      };

      const record = new SalaryIncomeRecord(recordData);

      try {
        await record.save();
        fail('Should have thrown a validation error');
      } catch (error: any) {
        expect(error.message).toContain('input');
      }
    });

    it('should handle optional input fields', async () => {
      const recordData = {
        userId: 'user123',
        year: 2025,
        input: {
          annualSalary: 3000000,
          withheldTax: 300000,
          socialInsurance: 400000,
          // lifeInsurance, dependents, spouseDeduction are optional
        },
        result: {
          annualSalary: 3000000,
          salaryIncomeDeduction: 980000,
          salaryIncome: 2020000,
          socialInsurance: 400000,
          lifeInsurance: 0,
          basicDeduction: 480000,
          dependentDeduction: 0,
          spouseDeduction: 0,
          totalDeduction: 880000,
          taxableIncome: 1140000,
          estimatedTax: 57000,
        },
      };

      const record = new SalaryIncomeRecord(recordData);
      const savedRecord = await record.save();

      expect(savedRecord.input.lifeInsurance).toBeUndefined();
      expect(savedRecord.input.dependents).toBeUndefined();
      expect(savedRecord.input.spouseDeduction).toBeUndefined();
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt timestamp', async () => {
      const recordData = {
        userId: 'user123',
        year: 2025,
        input: {
          annualSalary: 5000000,
          withheldTax: 500000,
          socialInsurance: 600000,
        },
        result: {
          annualSalary: 5000000,
          salaryIncomeDeduction: 1440000,
          salaryIncome: 3560000,
          socialInsurance: 600000,
          lifeInsurance: 0,
          basicDeduction: 480000,
          dependentDeduction: 0,
          spouseDeduction: 0,
          totalDeduction: 1080000,
          taxableIncome: 2480000,
          estimatedTax: 124000,
        },
      };

      const record = new SalaryIncomeRecord(recordData);
      const savedRecord = await record.save();

      expect(savedRecord.createdAt).toBeDefined();
      expect(savedRecord.createdAt instanceof Date).toBe(true);
    });
  });

  describe('Record Queries', () => {
    it('should find records by userId', async () => {
      const userId = 'queryuser123';

      const record1 = new SalaryIncomeRecord({
        userId,
        year: 2024,
        input: { annualSalary: 4000000, withheldTax: 400000, socialInsurance: 500000 },
        result: {
          annualSalary: 4000000, salaryIncomeDeduction: 1240000, salaryIncome: 2760000,
          socialInsurance: 500000, lifeInsurance: 0, basicDeduction: 480000,
          dependentDeduction: 0, spouseDeduction: 0, totalDeduction: 980000,
          taxableIncome: 1780000, estimatedTax: 89000,
        },
      });

      const record2 = new SalaryIncomeRecord({
        userId,
        year: 2025,
        input: { annualSalary: 4500000, withheldTax: 450000, socialInsurance: 550000 },
        result: {
          annualSalary: 4500000, salaryIncomeDeduction: 1340000, salaryIncome: 3160000,
          socialInsurance: 550000, lifeInsurance: 0, basicDeduction: 480000,
          dependentDeduction: 0, spouseDeduction: 0, totalDeduction: 1030000,
          taxableIncome: 2130000, estimatedTax: 106500,
        },
      });

      await record1.save();
      await record2.save();

      const foundRecords = await SalaryIncomeRecord.find({ userId });

      expect(foundRecords).toHaveLength(2);
      expect(foundRecords[0].userId).toBe(userId);
      expect(foundRecords[1].userId).toBe(userId);
    });

    it('should find record by userId and year', async () => {
      const userId = 'yearuser123';
      const year = 2025;

      const recordData = {
        userId,
        year,
        input: { annualSalary: 5000000, withheldTax: 500000, socialInsurance: 600000 },
        result: {
          annualSalary: 5000000, salaryIncomeDeduction: 1440000, salaryIncome: 3560000,
          socialInsurance: 600000, lifeInsurance: 0, basicDeduction: 480000,
          dependentDeduction: 0, spouseDeduction: 0, totalDeduction: 1080000,
          taxableIncome: 2480000, estimatedTax: 124000,
        },
      };

      const record = new SalaryIncomeRecord(recordData);
      await record.save();

      const foundRecord = await SalaryIncomeRecord.findOne({ userId, year });

      expect(foundRecord).toBeDefined();
      expect(foundRecord?.userId).toBe(userId);
      expect(foundRecord?.year).toBe(year);
    });
  });
});
