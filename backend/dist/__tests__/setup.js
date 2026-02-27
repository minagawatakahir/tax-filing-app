"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
let mongoServer;
// テスト開始前に実行
beforeAll(async () => {
    // MongoDB Memory Server を起動
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    // Mongoose 接続
    await mongoose_1.default.connect(mongoUri);
});
// 各テスト後にデータをクリア
afterEach(async () => {
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});
// すべてのテスト終了後にクリーンアップ
afterAll(async () => {
    await mongoose_1.default.disconnect();
    await mongoServer.stop();
});
// タイムアウトの延長
jest.setTimeout(30000);
