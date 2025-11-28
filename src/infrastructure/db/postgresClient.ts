import { Pool, QueryResult, QueryResultRow } from 'pg';
import { config } from '@infrastructure/config/env';

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false,
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function getClient() {
  return pool.connect();
}

export default pool;

