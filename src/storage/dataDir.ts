import { join } from 'path';

function resolveBaseDir(): string {
  const isServerlessEnvironment =
    process.env.VERCEL === '1' ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    process.env.NODE_ENV === 'production';

  if (isServerlessEnvironment) {
    // Vercel / serverless functions: можна писати тільки в /tmp
    return '/tmp/contractor-salary-ledger';
  }

  // Локальний запуск через `npm run dev` / `npm start`
  return process.cwd();
}

const BASE_DIR = resolveBaseDir();

export function getDataDir(): string {
  return join(BASE_DIR, 'data');
}

