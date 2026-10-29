import {createServer} from 'node:http';
import {once} from 'node:events';
import {createApp} from '../server/app.mjs';
import {Tasks} from '../server/tasks.mjs';
export async function fixture(options={}) {
  const tasks=new Tasks({intervalMs:25,historyLimit:30,...options});
  const {app}=createApp({tasks,pumpMs:5,heartbeatMs:15});
  const server=createServer(app);server.listen(0,'127.0.0.1');await once(server,'listening');
  const base=`http://127.0.0.1:${server.address().port}`;
  const json=async(path,options={})=>{
    const response=await fetch(base+'/api'+path,{...options,headers:{'Content-Type':'application/json',...options.headers}});
    return {status:response.status,data:await response.json(),headers:response.headers};
  };
  const create=async(scenario='normal')=>{const r=await json('/tasks',{method:'POST',body:JSON.stringify({scenario})});if(r.status!==201)throw new Error('创建失败');return r.data;};
  return {base,tasks,json,create,close:async()=>{tasks.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
}
// 仅解析本实验发出的LF+JSON帧，不是通用EventSource兼容实现。
// 流读取使用增量UTF-8解码和跨chunk缓冲；不能假定一次read就是一条事件。
export async function collect(response,{until=()=>false}={}) {
  if(!response.ok) throw new Error(`HTTP ${response.status}`);
  const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';const events=[];
  try {
    while(true) {
      const {done,value}=await reader.read();if(done)break;
      buffer+=decoder.decode(value,{stream:true});let at;
      while((at=buffer.indexOf('\n\n'))>=0) {
        const lines=buffer.slice(0,at).split('\n');buffer=buffer.slice(at+2);
        const data=lines.filter(l=>l.startsWith('data:')).map(l=>l.slice(5).replace(/^ /,'')).join('\n');
        if(!lines.some(l=>l.startsWith('data:')))continue;
        const event={type:lines.find(l=>l.startsWith('event:'))?.slice(6).trim()??'message',
          id:lines.find(l=>l.startsWith('id:'))?.slice(3).trim()??null,data:JSON.parse(data)};
        events.push(event);if(until(event))return events;
      }
    }
    if(buffer.trim())throw new Error('流在完整事件结束前中断');return events;
  } finally {await reader.cancel().catch(()=>{});reader.releaseLock();}
}
export async function waitFor(read,condition,timeout=3000) {
  const end=Date.now()+timeout;
  while(Date.now()<end) {const result=await read();if(condition(result))return result;await new Promise(r=>setTimeout(r,10));}
  throw new Error('等待条件超时');
}
