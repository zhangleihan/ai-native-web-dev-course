import {createServer} from 'node:http';
import {createApp} from './app.mjs';
const port=Number(process.env.PORT??3009);
if(!Number.isInteger(port)||port<1||port>65535) throw new Error('PORT应在1–65535之间');
const {app,tasks}=createApp();const server=createServer(app);
server.on('error',err=>{console.error(err.message);tasks.close();process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`第9讲模拟任务：http://127.0.0.1:${port} · 内存重启清空 · 无真实模型`));
for(const signal of ['SIGINT','SIGTERM']) process.once(signal,()=>{
  tasks.close();server.closeAllConnections();server.close();
});
