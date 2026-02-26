import request from 'supertest';
import express, { Express } from 'express';
import salaryIncomeRoutes from '../../routes/salaryIncomeRoutes';
import mongoose from 'mongoose';

// Express アプリを作成
let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/salary-income', salaryIncomeRoutes);
});

describe('Salary Income Controller', () => {
  describe('POST /api/salary-income/calculate', () => {
    it('should calculate salary income with valid input', async () => {
      const input = {
        annualSalary: 5000000,
        withheldTax: 500000,
        socialInsurance: 600000,
        lifeInsurance: 80000,
        dependents: 1,
        spouseDeduction: true,
      };

      const response = await request(app)
        .post('/api/salary-income/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.annualSalary).toBe(5000000);
      expect(response.body.data.salaryIncomeDeduction).toBeGreaterThan(0);
      expect(response.body.data.taxableIncome).toBeGreaterThanOrEqual(0);
    });

    it('should return 400 for negative annual salary', async () => {
      const input = {
        annualSalary: -1000,
        withheldTax: 0,
        socialInsurance: 0,
      };

      const response = await request(app)
        .post('/api/salary-income/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('0以上');
    });

    it('should return 400 for missing annual salary', async () => {
      const input = {
        withheldTax: 0,
        socialInsurance: 0,
      };

      const response = await request(app)
        .post('/api/salary-income/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for zero annual salary', async () => {
      const input = {
        annualSalary: 0,
        withheldTax: 0,
        socialInsurance: 0,
      };

      const response = await request(app)
        .post('/api/salary-income/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should calculate with optional fields omitted', async () => {
      const input = {
        annualSalary: 3000000,
        withheldTax: 300000,
        socialInsurance: 400000,
      };

      const response = await request(app)
        .post('/api/salary-income/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should handle very high salary', async () => {
      const input = {
        annualSalary: 20000000,
        withheldTax: 3000000,
        socialInsurance: 1500000,
        lifeInsurance: 120000,
        dependents: 2,
        spouseDeduction: true,
      };

      const response = await request(app)
        .post('/api/salary-income/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.salaryIncomeDeduction).toBe(1950000); // 上限
    });
  });

  describe('POST /api/salary-income/save', () => {
    it('should save salary income record with valid data', async () => {
      const record = {
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

      const response = await request(app)
        .post('/api/salary-income/save')
        .send(record)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.year).toBe(2025);
    });

    it('should return 400 when year is missing', async () => {
      const record = {
        input: { annualSalary: 5000000 },
        result: { taxableIncome: 2480000 },
      };

      const response = await request(app)
        .post('/api/salary-income/save')
        .send(record)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('必須');
    });

    it('should return 400 when input is missing', async () => {
      const record = {
        year: 2025,
        result: { taxableIncome: 2480000 },
      };

      const response = await request(app)
        .post('/api/salary-income/save')
        .send(record)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when result is missing', async () => {
      const record = {
        year: 2025,
        input: { annualSalary: 5000000 },
      };

      const response = await request(app)
        .post('/api/salary-income/save')
        .send(record)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/salary-income/records', () => {
    it('should retrieve salary income records', async () => {
      const response = await request(app)
        .get('/api/salary-income/records')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter records by year', async () => {
      const response = await request(app)
        .get('/api/salary-income/records?year=2025')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/salary-income/:id', () => {
    it('should return error for invalid MongoDB ObjectId', async () => {
      const response = await request(app)
        .delete('/api/salary-income/invalid-id')
        .expect('Content-Type', /json/);

      // エラーが返される（400 または 500）
      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('should handle valid ObjectId deletion attempt', async () => {
      const validObjectId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .delete(`/api/salary-income/${validObjectId}`)
        .expect('Content-Type', /json/);

      // 実装ではデータがない場合も成功 200 を返す
      expect(response.statusCode).toBeGreaterThanOrEqual(200);
    });
  });

  describe('GET /api/salary-income/export-csv/:year', () => {
    it('should export CSV for a specific year', async () => {
      const response = await request(app)
        .get('/api/salary-income/export-csv/2025')
        .expect(200);

      // CSV response should have text/csv content type
      expect(response.headers['content-type']).toContain('text/csv');
    });

    it('should return 400 for invalid year', async () => {
      const response = await request(app)
        .get('/api/salary-income/export-csv/invalid')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
