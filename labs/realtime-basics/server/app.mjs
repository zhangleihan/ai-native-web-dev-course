import express from 'express';
import {fileURLToPath} from 'node:url';
import {Tasks,terminal} from './tasks.mjs';
export function createApp({tasks=new Tasks(),pumpMs=100,heartbeatMs=5000}={}) {
  const app=express();app.disable('x-powered-by');let subscribers=0;
  app.use(express.json({limit:'2kb'}));
  app.use('/api',(req,res,next)=>{
    res.set({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if(req.method==='POST'&&req.get('origin')&&req.get('origin')!==`http://${req.get('host')}`)
      return res.status(403).json({error:{code:'ORIGIN',message:'仅允许同源练习页面'}});
    next();
  });
  app.get('/api/health',(req,res)=>res.json({mode:'mock-memory',tasks:tasks.items.size,
    running:[...tasks.items.values()].filter(t=>!terminal(t.status)).length,subscribers,historyLimit:tasks.historyLimit}));
  app.post('/api/tasks',(req,res)=>{
    const body=req.body??{};
    if(typeof body!=='object'||Array.isArray(body)||!['normal','fail'].includes(body.scenario??'normal')||Object.keys(body).some(k=>k!=='scenario'))
      return res.status(400).json({error:{code:'INPUT',message:'只接收scenario: normal或fail'}});
    const task=tasks.create(body.scenario??'normal');
    if(!task) return res.status(429).json({error:{code:'LIMIT',message:'本次内存样本已达上限；重启恢复'}});
    res.location(`/api/tasks/${task.id}`).status(201).json(tasks.snapshot(task));
  });
  app.use('/api/tasks/:id',(req,res,next)=>{
    req.task=tasks.items.get(req.params.id);
    if(!req.task) return res.status(404).json({error:{code:'NOT_FOUND',message:'任务不存在；服务重启后内存样本已丢失'}});
    next();
  });
  app.get('/api/tasks/:id',(req,res)=>res.json(tasks.snapshot(req.task)));
  app.post('/api/tasks/:id/cancel',(req,res)=>res.json(tasks.cancel(req.task)));
  app.get('/api/tasks/:id/events',(req,res)=>{
    const task=req.task;
    // 原生重连请求头优先；after只用于新建EventSource时指定位置。
    const raw=req.get('last-event-id')??req.query.after??'0';let cursor=Number(raw);
    if(typeof raw!=='string'||!/^(0|[1-9]\d*)$/.test(raw)||!Number.isSafeInteger(cursor)||cursor>task.seq)
      return res.status(400).json({error:{code:'CURSOR',message:'事件位置应为不大于当前序号的非负整数'}});
    res.set({'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','X-Accel-Buffering':'no'});
    res.flushHeaders();res.write('retry: 1000\n\n');
    let closed=false,blocked=false,synced=false,timer,lastWrite=Date.now();subscribers++;
    const stop=()=>{if(closed)return;closed=true;clearInterval(timer);subscribers--;res.off('drain',drain);};
    res.on('close',stop);
    const write=frame=>{lastWrite=Date.now();blocked=!res.write(frame);return !blocked;};
    const frame=(type,data,id)=>`${id===undefined?'':`id: ${id}\n`}event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
    function pump() {
      if(closed||blocked) return;
      if(cursor<task.events[0].id-1) {
        cursor=task.seq;synced=true;
        if(!write(frame('reset',tasks.snapshot(task),cursor))) return;
      }
      for(const e of task.events) if(e.id>cursor) {
        cursor=e.id;if(!write(frame(e.type,e.data,e.id))) return;
      }
      if(!synced) {synced=true;if(!write(frame('snapshot',tasks.snapshot(task)))) return;}
      if(terminal(task.status)) {
        write(frame('done',tasks.snapshot(task)));stop();res.end();return;
      }
      if(Date.now()-lastWrite>=heartbeatMs) write(': heartbeat\n\n');
    }
    function drain() {blocked=false;pump();}
    res.on('drain',drain);pump();if(!closed) timer=setInterval(pump,pumpMs);
  });
  app.use('/api',(req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'接口不存在'}}));
  app.use(express.static(fileURLToPath(new URL('../dist/',import.meta.url))));
  app.use((err,req,res,next)=>{
    if(res.headersSent)return next(err);
    res.status(err.status===400?400:err.type==='entity.too.large'?413:500).json({error:{code:'REQUEST',message:'请求无法处理'}});
  });
  return {app,tasks};
}
