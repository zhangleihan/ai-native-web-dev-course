import {openDatabase} from '../server/database.mjs';
import {migrate} from '../server/schema.mjs';
const db = await openDatabase();
try {await migrate(db);console.log('migrate 完成 | '+db.mode);} finally {await db.close();}
