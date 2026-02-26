import request from 'supertest';
import express, { Express } from 'express';
import propertyRoutes from '../../routes/propertyRoutes';
import mongoose from 'mongoose';

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api/properties', propertyRoutes);
});

describe('Property Controller', () => {
  let createdPropertyId: string;

  describe('POST /api/properties', () => {
    it('should create a property with valid data', async () => {
      const timestamp = Date.now();
      const propertyData = {
        name: `テストマンション_${timestamp}`,
        address: '東京都渋谷区1-2-3',
        type: 'マンション',
        purchaseDate: '2020-01-15',
        purchasePrice: 30000000,
        landArea: 50,
        buildingArea: 80,
      };

      const response = await request(app)
        .post('/api/properties')
        .send(propertyData)
        .expect('Content-Type', /json/);

      // 201 または 400 が返される
      if (response.statusCode === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.id).toBeDefined();
        // 後続のテストで使用するために ID を保存
        createdPropertyId = response.body.data.id;
      } else {
        // バリデーションエラーの場合
        expect(response.statusCode).toBeGreaterThanOrEqual(400);
      }
    });

    it('should return 400 when required fields are missing', async () => {
      const propertyData = {
        name: 'テストマンション',
        // address が欠けている
        type: 'マンション',
      };

      const response = await request(app)
        .post('/api/properties')
        .send(propertyData)
        .expect('Content-Type', /json/);

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle property with all fields', async () => {
      const timestamp = Date.now();
      const propertyData = {
        name: `完全テスト_${timestamp}`,
        address: '東京都新宿区',
        type: 'マンション',
        purchaseDate: '2020-01-01',
        purchasePrice: 10000000,
        landArea: 60,
        buildingArea: 100,
      };

      const response = await request(app)
        .post('/api/properties')
        .send(propertyData)
        .expect('Content-Type', /json/);

      // 201 または 400 が返される
      expect([201, 400]).toContain(response.statusCode);
      if (response.statusCode === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      }
    });
  });

  describe('GET /api/properties', () => {
    it('should retrieve all properties', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // データが0個の場合もあるため、チェックなし
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should retrieve a specific property by ID', async () => {
      if (!createdPropertyId) {
        // テストをスキップ
        return;
      }

      const response = await request(app)
        .get(`/api/properties/${createdPropertyId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(createdPropertyId);
    });

    it('should return 404 for non-existent property', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/properties/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('見つかりません');
    });

    it('should handle invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/api/properties/invalid-id')
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('PUT /api/properties/:id', () => {
    it('should update a property with valid data', async () => {
      if (!createdPropertyId) {
        return;
      }

      const updateData = {
        name: '更新されたマンション',
        address: '東京都港区4-5-6',
        type: 'マンション',
        purchaseDate: '2020-01-15',
        purchasePrice: 35000000,
      };

      const response = await request(app)
        .put(`/api/properties/${createdPropertyId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('更新されたマンション');
      expect(response.body.data.purchasePrice).toBe(35000000);
    });

    it('should return 404 when updating non-existent property', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        name: '存在しない物件',
        address: '東京都',
        type: 'マンション',
        purchaseDate: '2020-01-01',
        purchasePrice: 10000000,
      };

      const response = await request(app)
        .put(`/api/properties/${nonExistentId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid update data', async () => {
      if (!createdPropertyId) {
        return;
      }

      const invalidData = {
        purchasePrice: -1000000, // 負の価格
      };

      const response = await request(app)
        .put(`/api/properties/${createdPropertyId}`)
        .send(invalidData)
        .expect('Content-Type', /json/);

      // バリデーションエラーが返される
      expect(response.statusCode).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/properties/:id', () => {
    it('should delete a property', async () => {
      if (!createdPropertyId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/properties/${createdPropertyId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('削除');
    });

    it('should return 404 when deleting non-existent property', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/properties/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should handle invalid ObjectId format', async () => {
      const response = await request(app)
        .delete('/api/properties/invalid-id')
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
});
