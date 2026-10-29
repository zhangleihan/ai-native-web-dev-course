import {openDatabase} from './database.mjs';
import {createApp} from './app.mjs';
const port = Number(process.env.PORT ?? 3003);
if (!Number.isInteger(port) || port<1 || port>65535) throw new Error('PORT不合法');
const db = await openDatabase();
try {
  const result=await db.query('SELECT version FROM schema_migrations WHERE version=$1',['001']);
  if (!result.rows.length) throw new Error('请先执行npm run migrate');
}
catch (error) {await db.close();throw error;}
const server = createApp(db).listen(port,'127.0.0.1',()=>console.log(`Case DB API: http://127.0.0.1:${port} | storage=${db.mode}`));
server.on('error',async error=>{console.error(error.message);process.exitCode=1;await db.close();});
async function stop() {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await db.close();}
process.once('SIGINT',()=>stop().then(()=>process.exit()));
process.once('SIGTERM',()=>stop().then(()=>process.exit()));
