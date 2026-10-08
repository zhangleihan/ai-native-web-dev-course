import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {Problem,fail,validCase,filters,uuid,text,visibleUser,canReadRun} from './domain.mjs';
import {diagnose,prepareRun} from './ai.mjs';
const token = () => randomBytes(32).toString('hex');
const equal = (a,b) => typeof a==='string'&&typeof b==='string'&&/^[a-f0-9]{64}$/.test(a)&&/^[a-f0-9]{64}$/.test(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
export function createApp({store,sessionStore,secret=token(),publicOrigin='http://127.0.0.1:3001',secureCookie=false,diagnoseTimeoutMs=500}) {
  const app=express();app.disable('x-powered-by');
  app.use((req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('Referrer-Policy','same-origin');next();});
  app.use(express.json({limit:'32kb'}));
  app.use('/api',session({name:'case.sid',secret,store:sessionStore,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:secureCookie,maxAge:60*60*1000}}));
  app.use('/api',(req,res,next)=>{res.set('Cache-Control','no-store');next();});
  app.get('/api/health',(req,res)=>res.json({status:'ok',storage:store.mode,model:'mock'}));
  app.get('/api/session',async(req,res)=>{
    req.session.csrf??=token();
    const user=req.session.userId?await store.user(req.session.userId):null;
    res.json({user:visibleUser(user),csrf:req.session.csrf});
  });
  app.use('/api',(req,res,next)=>{
    if(['GET','HEAD','OPTIONS'].includes(req.method)) return next();
    if(req.headers.origin&&req.headers.origin!==publicOrigin) fail(403,'ORIGIN','请求来源不允许');
    if(!equal(req.headers['x-csrf-token'],req.session.csrf)) fail(403,'CSRF','请刷新登录状态后重试');
    next();
  });
  app.post('/api/login',async(req,res)=>{
    const {username,password}=req.body??{};
    if(!text(username,50)||!text(password,200)) fail(400,'VALIDATION_ERROR','请输入用户名与口令');
    const user=await store.findUser(username);
    if(!user||!await bcrypt.compare(password,user.passwordHash)) fail(401,'LOGIN_FAILED','用户名或口令不正确');
    await new Promise((resolve,reject)=>req.session.regenerate(err=>err?reject(err):resolve()));
    req.session.userId=user.id;req.session.csrf=token();
    await new Promise((resolve,reject)=>req.session.save(err=>err?reject(err):resolve()));
    res.json({user:visibleUser(user),csrf:req.session.csrf});
  });
  app.post('/api/logout',async(req,res)=>{
    await new Promise((resolve,reject)=>req.session.destroy(err=>err?reject(err):resolve()));
    res.clearCookie('case.sid',{path:'/',httpOnly:true,sameSite:'lax',secure:secureCookie}).status(204).end();
  });
  const login=async(req,res,next)=>{
    req.user=req.session.userId?await store.user(req.session.userId):null;
    if(!req.user) fail(401,'UNAUTHENTICATED','请先登录');next();
  };
  app.get('/api/cases',async(req,res)=>{const items=await store.listCases(filters(req.query));res.json({items,total:items.length});});
  app.get('/api/cases/:id',async(req,res)=>{const item=await store.getCase(uuid(req.params.id));if(!item) fail(404,'NOT_FOUND','案例不存在');res.json(item);});
  app.post('/api/cases',login,async(req,res)=>{
    const c=await store.createCase({...validCase(req.body),ownerId:req.user.id});
    res.location(`/api/cases/${c.id}`).status(201).json(c);
  });
  app.patch('/api/cases/:id',login,async(req,res)=>res.json(await store.updateCase(uuid(req.params.id),validCase(req.body),req.user)));
  app.post('/api/diagnoses',login,async(req,res)=>{
    const {caseId,question,scenario='normal'}=req.body??{};
    if(!text(question,1000)||!['normal','no-evidence','bad-schema','bad-evidence','timeout'].includes(scenario)) fail(400,'VALIDATION_ERROR','问题或模拟场景不合法');
    const item=await store.getCase(uuid(caseId));if(!item) fail(404,'NOT_FOUND','案例不存在');
    res.json(await diagnose(item,question,scenario,diagnoseTimeoutMs));
  });
  app.post('/api/runs',login,async(req,res)=>{
    const item=await store.getCase(uuid(req.body?.caseId));if(!item) fail(404,'NOT_FOUND','案例不存在');
    res.status(201).json(await prepareRun({store,user:req.user,item}));
  });
  app.get('/api/runs',login,async(req,res)=>res.json({items:await store.listRuns(req.user)}));
  app.get('/api/runs/:id',login,async(req,res)=>{
    const run=await store.getRun(uuid(req.params.id));if(!run) fail(404,'NOT_FOUND','运行不存在');canReadRun(req.user,run);res.json(run);
  });
  app.post('/api/runs/:id/decision',login,async(req,res)=>{
    if(Object.keys(req.body??{}).some(key=>key!=='decision')) fail(400,'VALIDATION_ERROR','审批仅接收决定，不接收替换参数');
    res.json(await store.decide(uuid(req.params.id),req.body?.decision,req.user));
  });
  app.get('/api/work-orders',login,async(req,res)=>res.json({items:await store.listOrders(req.user)}));
  app.get('/api/runs/:id/events',login,async(req,res)=>{
    const id=uuid(req.params.id), first=await store.getRun(id);
    if(!first) fail(404,'NOT_FOUND','运行不存在');canReadRun(req.user,first);
    let cursor=Number(req.headers['last-event-id']??0);
    if(!Number.isSafeInteger(cursor)||cursor<0||cursor>first.trace.length) fail(400,'CURSOR','事件位置不合法');
    res.set({'Content-Type':'text/event-stream','Cache-Control':'no-cache','X-Accel-Buffering':'no'});res.flushHeaders();
    let closed=false,timer;
    const stop=()=>{closed=true;clearTimeout(timer);};res.on('close',stop);
    const deadline=Date.now()+30000;
    async function send() {
      if(closed) return;
      try {
        const user=await store.user(req.user.id),run=await store.getRun(id);
        if(!user||!run) throw new Error('unavailable');canReadRun(user,run);
        if(closed) return;
        while(cursor<run.trace.length) {res.write(`id: ${cursor+1}\nevent: trace\ndata: ${JSON.stringify(run.trace[cursor])}\n\n`);cursor++;}
        res.write(`event: snapshot\ndata: ${JSON.stringify({status:run.status})}\n\n`);
        if(['COMPLETED','CANCELLED','FAILED'].includes(run.status)||Date.now()>deadline) {res.write('event: done\ndata: {}\n\n');stop();res.end();return;}
        timer=setTimeout(send,1000);
      } catch {if(!closed){res.write('event: failure\ndata: {"message":"订阅已停止"}\n\n');stop();res.end();}}
    }
    await send();
  });
  app.use('/api',(req,res)=>fail(404,'NOT_FOUND','接口不存在'));
  app.use(express.static(fileURLToPath(new URL('../dist/',import.meta.url))));
  app.use((err,req,res,next)=>{
    if(res.headersSent) return next(err);
    const status=err instanceof Problem?err.status:err.type==='entity.too.large'?413:err.status===400?400:500;
    res.status(status).json({error:{code:err.code&&err instanceof Problem?err.code:'REQUEST_ERROR',message:status===500?'服务暂不可用':err instanceof Problem?err.message:'请求体不合法或过大'}});
  });
  return app;
}
