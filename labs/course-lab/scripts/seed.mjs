import '../server/config.mjs';
import {Pool} from 'pg';
import {PgStore} from '../server/pg-store.mjs';
import {seed} from '../server/fixtures.mjs';
if(!process.env.DATABASE_URL) throw new Error('请设置隔离练习库 DATABASE_URL');
const store=new PgStore(new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000}));
try {await seed(store,process.env.LAB_PASSWORD);console.log('练习用户/案例已准备；已有账号密码未覆盖');}
finally {await store.close();}
