import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

// テスト開始前に実行
beforeAll(async () => {
  // MongoDB Memory Server を起動
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Mongoose 接続
  await mongoose.connect(mongoUri);
});

// 各テスト後にデータをクリア
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// すべてのテスト終了後にクリーンアップ
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// タイムアウトの延長
jest.setTimeout(30000);
