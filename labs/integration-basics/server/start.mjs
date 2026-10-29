import {startLab} from './lab.mjs';
const apiPort=Number(process.env.API_PORT??3030),webPort=Number(process.env.WEB_PORT??3031);
for(const p of [apiPort,webPort])if(!Number.isInteger(p)||p<1||p>65535)throw new Error('端口应在1–65535之间');
const lab=await startLab({apiPort,webPort,logger:console.log});
console.log(`第7讲联调页面：${lab.webOrigin} · API：${lab.apiOrigin} · 独立内存，重启清空`);
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>lab.close());
