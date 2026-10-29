import express from 'express';
import {createServer,request as proxyRequest} from 'node:http';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createApp as createCasesApp} from '../../express-basics/server/app.mjs';
import {createMemoryStore} from '../../express-basics/server/memory-store.mjs';
export async function startLab({apiPort=0,webPort=0,logger=()=>{}}={}) {
  const store=createMemoryStore();
  for(const fields of [{title:'链路中断',industry:'通信',difficulty:'beginner'},
    {title:'订单延迟',industry:'零售',difficulty:'intermediate'},
    {title:'链路恢复记录',industry:'通信',difficulty:'advanced'}])store.create(fields);
  const app=express(),allowed=new Set();app.disable('x-powered-by');
  app.use('/api',(req,res,next)=>{
    const origin=req.get('origin');
    if(origin&&allowed.has(origin)) {
      res.set({'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Expose-Headers':'X-Request-Id'});
      if(req.method==='OPTIONS') {
        const requested=(req.get('access-control-request-headers')??'').toLowerCase().split(',').map(v=>v.trim()).filter(Boolean);
        if(!['GET','POST','PATCH','DELETE'].includes(req.get('access-control-request-method'))||requested.some(v=>!['content-type','x-lab-scenario'].includes(v)))return res.sendStatus(403);
        return res.set({'Access-Control-Allow-Methods':'GET, POST, PATCH, DELETE','Access-Control-Allow-Headers':'Content-Type, X-Lab-Scenario'}).status(204).end();
      }
    } else if(req.method==='OPTIONS') return res.sendStatus(403);
    next();
  });
  app.use((req,res,next)=>{
    if(['POST','PATCH','DELETE'].includes(req.method)&&req.get('origin')&&!allowed.has(req.get('origin')))
      return res.status(403).json({error:{code:'ORIGIN',message:'该来源不允许写入',requestId:randomUUID()}});
    next();
  });
  const api=createCasesApp({store,logger});
  function faults(req,res,next) {
    const scenario=req.get('x-lab-scenario')??'normal';
    if(req.path!=='/api/cases')return next();
    if(req.method==='POST'&&scenario==='response-lost') {
      const end=res.end;
      res.end=function(...args) {if(res.statusCode===201){res.destroy();return res;}return end.apply(this,args);};
      return next();
    }
    if(req.method!=='GET')return next();
    const fail=(status,body)=>{
      const requestId=randomUUID();logger({requestId,method:req.method,path:req.originalUrl,status,scenario});
      return res.set('X-Request-Id',requestId).status(status).json({...body,error:{...body.error,requestId}});
    };
    if(scenario==='http-error')return fail(503,{error:{code:'LAB_FAILURE',message:'模拟503：切回正常读取后重试'}});
    if(scenario==='bad-json')return res.type('application/json').send('{"items":');
    if(scenario==='bad-shape')return res.json({items:'这不是数组',total:3,offset:0,limit:2});
    if(scenario==='delay') {
      const ms=req.query.kw==='链路'?900:req.query.kw==='订单'?60:250;
      const timer=setTimeout(next,ms);res.once('close',()=>clearTimeout(timer));return;
    }
    next();
  }
  app.use('/no-cors',faults,api); // 同一公开读取服务，但不附加CORS读取许可。
  app.use(faults,api);
  const apiServer=createServer(app);apiServer.listen(apiPort,'127.0.0.1');await once(apiServer,'listening');
  const apiOrigin=`http://127.0.0.1:${apiServer.address().port}`;allowed.add(apiOrigin);
  const web=express();web.disable('x-powered-by');
  web.get('/lab-config.json',(req,res)=>res.json({apiOrigin}));
  web.use('/api',(req,res)=>{
    const target=new URL(req.originalUrl,apiOrigin);
    const upstream=proxyRequest(target,{method:req.method,headers:{...req.headers,host:target.host}},incoming=>{
      res.writeHead(incoming.statusCode,incoming.headers);incoming.pipe(res);
    });
    upstream.on('error',()=>{
      if(res.headersSent)return res.destroy();
      res.status(502).json({error:{code:'PROXY_ERROR',message:'代理未能取得API响应；写入结果需另行确认'}});
    });
    req.on('aborted',()=>upstream.destroy());
    res.on('close',()=>{if(!res.writableEnded)upstream.destroy();});req.pipe(upstream);
  });
  web.use(express.static(fileURLToPath(new URL('../dist/',import.meta.url))));
  const webServer=createServer(web);
  try {webServer.listen(webPort,'127.0.0.1');await once(webServer,'listening');}
  catch(error){apiServer.closeAllConnections();await new Promise(resolve=>apiServer.close(resolve));throw error;}
  const webOrigin=`http://127.0.0.1:${webServer.address().port}`;allowed.add(webOrigin);
  return {apiOrigin,webOrigin,store,close:async()=>{
    for(const server of [webServer,apiServer]){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
  }};
}
