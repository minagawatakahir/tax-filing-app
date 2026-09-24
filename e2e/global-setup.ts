import { execSync } from 'child_process';
import path from 'path';
import { E2E_MONGODB_URI } from './e2e-env';

/**
 * E2E 用データベースを毎回初期化してシードする（実データの開発用DBには触れない）
 */
export default async function globalSetup() {
  execSync('npm run -s db:seed-e2e', {
    cwd: path.resolve(__dirname, '../backend'),
    env: { ...process.env, MONGODB_URI: E2E_MONGODB_URI },
    stdio: 'inherit',
  });
}
