"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ミドルウェア
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Advanced Tax Filing App API is running',
        modules: [
            'RSU為替自動連携',
            '不動産LTV・利子判定',
            '減価償却ライフサイクル',
            '特例併用シミュレーター',
            '調書自動生成'
        ]
    });
});
// ルートのインポート
const taxRoutes_1 = __importDefault(require("./routes/taxRoutes"));
const rsuRoutes_1 = __importDefault(require("./routes/rsuRoutes"));
const realEstateRoutes_1 = __importDefault(require("./routes/realEstateRoutes"));
const realEstateIncomeRoutes_1 = __importDefault(require("./routes/realEstateIncomeRoutes"));
const depreciationRoutes_1 = __importDefault(require("./routes/depreciationRoutes"));
const taxExemptionRoutes_1 = __importDefault(require("./routes/taxExemptionRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
const salaryIncomeRoutes_1 = __importDefault(require("./routes/salaryIncomeRoutes"));
const salaryIncomeStorageRoutes_1 = __importDefault(require("./routes/salaryIncomeStorageRoutes"));
const capitalGainRoutes_1 = __importDefault(require("./routes/capitalGainRoutes"));
const capitalGainStorageRoutes_1 = __importDefault(require("./routes/capitalGainStorageRoutes"));
// ルートの登録
app.use('/api/tax', taxRoutes_1.default);
app.use('/api/salary-income', salaryIncomeRoutes_1.default);
app.use('/api/salary-income', salaryIncomeStorageRoutes_1.default);
app.use('/api/capital-gain', capitalGainRoutes_1.default);
app.use('/api/capital-gain', capitalGainStorageRoutes_1.default);
app.use('/api/rsu', rsuRoutes_1.default);
app.use('/api/real-estate', realEstateRoutes_1.default);
app.use('/api/real-estate-income', realEstateIncomeRoutes_1.default);
app.use('/api/depreciation', depreciationRoutes_1.default);
app.use('/api/tax-exemption', taxExemptionRoutes_1.default);
app.use('/api/documents', documentRoutes_1.default);
app.use('/api/properties', propertyRoutes_1.default);
// エラーハンドリング
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
// データベース接続とサーバー起動
const startServer = async () => {
    try {
        // MongoDBに接続（オプション：環境変数でMONGODB_URIが設定されている場合のみ）
        if (process.env.MONGODB_URI) {
            await (0, database_1.connectDatabase)();
        }
        else {
            console.log('⚠️  MongoDB URI not configured. Running without database.');
        }
        app.listen(PORT, () => {
            console.log(`🚀 Server is running at http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
