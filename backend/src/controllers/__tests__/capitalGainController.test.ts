import request from 'supertest';
import express, { Express } from 'express';
import capitalGainRoutes from '../../routes/capitalGainRoutes';
import mongoose from 'mongoose';

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/capital-gain', capitalGainRoutes);
});

describe('Capital Gain Controller', () => {
  describe('GET /api/capital-gain/sold-properties', () => {
    it('should retrieve sold properties list', async () => {
      const response = await request(app)
        .get('/api/capital-gain/sold-properties')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.properties)).toBe(true);
    });
  });

  describe('POST /api/capital-gain/calculate', () => {
    it('should calculate capital gain with valid input', async () => {
      const input = {
        propertyId: 'prop-1',
        saleDate: '2025-06-15',
        salePrice: 50000000,
        acquisitionDate: '2010-01-15',
        acquisitionCost: 30000000,
        brokerageFee: 1500000,
        surveyCost: 100000,
        registrationCost: 200000,
        otherExpenses: 50000,
        specialDeduction: 3000000,
      };

      const response = await request(app)
        .post('/api/capital-gain/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.capitalGain).toBeGreaterThan(0);
      expect(response.body.result.taxableCapitalGain).toBeGreaterThan(0);
    });

    it('should return 400 when propertyId is missing', async () => {
      const input = {
        saleDate: '2025-06-15',
        salePrice: 50000000,
        acquisitionDate: '2010-01-15',
        acquisitionCost: 30000000,
      };

      const response = await request(app)
        .post('/api/capital-gain/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('必須');
    });

    it('should return 400 when saleDate is missing', async () => {
      const input = {
        propertyId: 'prop-1',
        salePrice: 50000000,
        acquisitionDate: '2010-01-15',
        acquisitionCost: 30000000,
      };

      const response = await request(app)
        .post('/api/capital-gain/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when salePrice is missing', async () => {
      const input = {
        propertyId: 'prop-1',
        saleDate: '2025-06-15',
        acquisitionDate: '2010-01-15',
        acquisitionCost: 30000000,
      };

      const response = await request(app)
        .post('/api/capital-gain/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should calculate capital gain for short-term property', async () => {
      const input = {
        propertyId: 'prop-2',
        saleDate: '2025-06-15',
        salePrice: 50000000,
        acquisitionDate: '2023-06-15',
        acquisitionCost: 40000000,
        brokerageFee: 1500000,
        surveyCost: 100000,
        registrationCost: 200000,
        otherExpenses: 50000,
      };

      const response = await request(app)
        .post('/api/capital-gain/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.result.transferType).toBe('short-term');
    });

    it('should handle optional fields', async () => {
      const input = {
        propertyId: 'prop-3',
        saleDate: '2025-06-15',
        salePrice: 30000000,
        acquisitionDate: '2010-01-15',
        acquisitionCost: 20000000,
      };

      const response = await request(app)
        .post('/api/capital-gain/calculate')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.result).toBeDefined();
    });
  });

});
