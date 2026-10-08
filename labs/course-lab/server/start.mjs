import {Pool} from 'pg';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import {settings} from './config.mjs';
import {MemoryStore} from './memory-store.mjs';
import {PgStore} from './pg-store.mjs';
import {seed} from './fixtures.mjs';
import {createApp} from './app.mjs';
const config=settings();
let store,sessionStore;
if(config.storage==='postgres') {
  const pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000});
  await pool.query('SELECT version FROM schema_migrations LIMIT 1');
  store=new PgStore(pool);
  sessionStore=new (connectPg(session))({pool,tableName:'sessions',createTableIfMissing:false});
} else {store=new MemoryStore();await seed(store,process.env.LAB_PASSWORD);}
const app=createApp({store,sessionStore,secret:config.secret,publicOrigin:config.publicOrigin,secureCookie:process.env.COOKIE_SECURE==='true'});
const server=app.listen(config.port,config.host,()=>console.log(`Case Lab: ${config.publicOrigin} | storage=${store.mode} | model=mock`));
server.on('error',error=>{console.error(error.message);process.exitCode=1;store.close();});
async function stop() {server.closeAllConnections();server.close();if(sessionStore) sessionStore.close();await store.close();}
process.once('SIGINT',()=>stop().then(()=>process.exit()));
process.once('SIGTERM',()=>stop().then(()=>process.exit()));
