import {existsSync} from 'node:fs';
import {loadEnvFile} from 'node:process';
if(existsSync('.env')) loadEnvFile('.env');
export function settings() {
  const storage=process.env.LAB_STORAGE??'memory';
  if(!['memory','postgres'].includes(storage)) throw new Error('LAB_STORAGE 必须为 memory 或 postgres');
  if(storage==='postgres'&&!process.env.DATABASE_URL) throw new Error('PostgreSQL 模式需要 DATABASE_URL');
  if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32) throw new Error('SESSION_SECRET 至少32字符，请按 README 生成');
  const port=Number(process.env.PORT??3001);
  if(!Number.isInteger(port)||port<1||port>65535) throw new Error('PORT 不合法');
  const publicOrigin=process.env.PUBLIC_ORIGIN??`http://127.0.0.1:${port}`;
  if(new URL(publicOrigin).origin!==publicOrigin) throw new Error('PUBLIC_ORIGIN 应为不含路径的完整源');
  return {storage,port,publicOrigin,host:process.env.HOST??'127.0.0.1',secret:process.env.SESSION_SECRET};
}
