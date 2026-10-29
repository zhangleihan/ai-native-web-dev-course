import {readFile} from 'node:fs/promises';
import {openDatabase} from '../server/database.mjs';
const path = process.argv[2];
if (!path) throw new Error('用法：npm run sql -- sql/queries.sql');
const db = await openDatabase();
try {
  const result = await db.exec(await readFile(path,'utf8'));
  for (const group of Array.isArray(result) ? result : [result]) if (group.rows?.length) console.table(group.rows);
} finally {await db.close();}
