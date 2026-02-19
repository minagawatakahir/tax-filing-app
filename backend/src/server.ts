import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ヘルスチェックエンドポイント
app.get('/api/health', (req: Request, res: Response): void => {
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
import taxRoutes from './routes/taxRoutes';
import rsuRoutes from './routes/rsuRoutes';
import realEstateRoutes from './routes/realEstateRoutes';
import realEstateIncomeRoutes from './routes/realEstateIncomeRoutes';
import depreciationRoutes from './routes/depreciationRoutes';
import taxExemptionRoutes from './routes/taxExemptionRoutes';
import documentRoutes from './routes/documentRoutes';
import propertyRoutes from './routes/propertyRoutes';
import salaryIncomeRoutes from './routes/salaryIncomeRoutes';
import salaryIncomeStorageRoutes from './routes/salaryIncomeStorageRoutes';
import rsuIncomeRoutes from './routes/rsuIncomeRoutes';
import capitalGainRoutes from './routes/capitalGainRoutes';
import capitalGainStorageRoutes from './routes/capitalGainStorageRoutes';

// ルートの登録
app.use('/api/tax', taxRoutes);
app.use('/api/salary-income', salaryIncomeRoutes);
app.use('/api/salary-income', salaryIncomeStorageRoutes);
app.use('/api/rsu-income', rsuIncomeRoutes);
app.use('/api/capital-gain', capitalGainRoutes);
app.use('/api/capital-gain', capitalGainStorageRoutes);
app.use('/api/rsu', rsuRoutes);
app.use('/api/real-estate', realEstateRoutes);
app.use('/api/real-estate-income', realEstateIncomeRoutes);
app.use('/api/depreciation', depreciationRoutes);
app.use('/api/tax-exemption', taxExemptionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/properties', propertyRoutes);

// エラーハンドリング
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
      await connectDatabase();
    } else {
      console.log('⚠️  MongoDB URI not configured. Running without database.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
