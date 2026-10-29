import {PGlite} from '@electric-sql/pglite';
import {Pool} from 'pg';
import {fileURLToPath} from 'node:url';
export async function openDatabase({url = process.env.LAB_STORAGE === 'postgres' ? process.env.DATABASE_URL : undefined,
  dataDir = process.env.LAB_DATA_DIR ?? fileURLToPath(new URL('../.data/', import.meta.url))} = {}) {
  if (process.env.LAB_STORAGE === 'postgres' && url === undefined) throw new Error('PostgreSQL模式需要DATABASE_URL');
  if (!url) {
    const engine = new PGlite(dataDir);
    await engine.waitReady;
    return {mode: 'pglite', query: (...args) => engine.query(...args), exec: sql => engine.exec(sql),
      transaction: work => engine.transaction(work), close: () => engine.close()};
  }
  const pool = new Pool({connectionString: url, max: 5, connectionTimeoutMillis: 5000});
  pool.on('error', () => console.error('空闲数据库连接异常'));
  try {await pool.query('SELECT 1');} catch (error) {await pool.end();throw error;}
  return {mode: 'postgres', query: (...args) => pool.query(...args), exec: sql => pool.query(sql),
    async transaction(work) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await work({query: (...args) => client.query(...args), exec: sql => client.query(sql)});
        await client.query('COMMIT');
        return result;
      } catch (error) {await client.query('ROLLBACK'); throw error;}
      finally {client.release();}
    },
    close: () => pool.end()};
}
