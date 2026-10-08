import {randomBytes} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
const values=`LAB_STORAGE=memory\nPORT=3001\nHOST=127.0.0.1\nPUBLIC_ORIGIN=http://127.0.0.1:3001\nSESSION_SECRET=${randomBytes(32).toString('hex')}\nLAB_PASSWORD=${randomBytes(12).toString('hex')}\nPOSTGRES_PASSWORD=${randomBytes(16).toString('hex')}\n`;
try {await writeFile('.env',values,{flag:'wx',mode:0o600});console.log('.env 已生成；查看其中 LAB_PASSWORD 作为 alice/bob/admin 的练习口令。已有 .env 不会覆盖。');}
catch(error) {if(error.code==='EEXIST'){console.log('.env 已存在，保持不变。');}else throw error;}
