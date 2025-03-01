export default {
  backendUrl: process.env.MINIMUMSOFT_BACKEND_URL || 'http://localhost:5001',

  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:password@localhost:5432/minimumsoft',

  env: process.env.NODE_ENV || 'development',
} as const;

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '';