import '../server/config.mjs';
import {Pool} from 'pg';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL) throw new Error('请设置隔离练习库 DATABASE_URL');
const pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000});
const client=await pool.connect();
try {
 await client.query('BEGIN');
 await client.query(await readFile(new URL('../sql/001_initial.sql',import.meta.url),'utf8'));
 await client.query('COMMIT');console.log('迁移001完成（可重复执行）');
} catch(error) {await client.query('ROLLBACK');throw error;}
finally {client.release();await pool.end();}
