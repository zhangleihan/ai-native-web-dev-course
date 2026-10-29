import {openDatabase} from '../server/database.mjs';
import {seed} from '../server/schema.mjs';
const db = await openDatabase();
try {await seed(db);console.log('seed 完成 | '+db.mode);} finally {await db.close();}
