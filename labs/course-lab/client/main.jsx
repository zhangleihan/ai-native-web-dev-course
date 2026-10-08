import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {api,post} from './api.js';
import './style.css';
const names={RUNNING:'执行中',WAITING_APPROVAL:'等待审批',COMPLETED:'已完成',CANCELLED:'已拒绝',FAILED:'失败'};
function RunView({run,user,onDecision}) {
  const [events,setEvents]=useState([]),[connection,setConnection]=useState('连接中');
  useEffect(()=>{
    setEvents([]);setConnection('连接中');
    const source=new EventSource(`/api/runs/${run.id}/events`);
    source.addEventListener('trace',e=>{const row={id:e.lastEventId,...JSON.parse(e.data)};setEvents(old=>old.some(x=>x.id===row.id)?old:[...old,row]);setConnection('正在接收');});
    source.addEventListener('snapshot',()=>setConnection('已同步'));
    source.addEventListener('done',()=>{source.close();setConnection('本次订阅结束，可刷新运行列表');});
    source.addEventListener('failure',()=>{source.close();setConnection('订阅失败，请刷新');});
    source.onerror=()=>{source.close();setConnection('连接中断，请刷新');};
    return ()=>source.close();
  },[run.id,run.status]);
  return <article className="run"><h3>运行 {run.id.slice(0,8)} · {names[run.status]}</h3>
    <p>拟建单：{run.proposal?.title??'无提案'} · 来源案例 {run.caseId.slice(-4)}</p>
    {run.status==='WAITING_APPROVAL'&&user?.role==='admin'&&<div className="actions"><button onClick={()=>onDecision(run.id,'approve')}>批准练习建单</button><button className="secondary" onClick={()=>onDecision(run.id,'reject')}>拒绝</button></div>}
    <details><summary>执行轨迹 · {connection}</summary><ol>{events.map(e=><li key={e.id}><strong>{e.type}</strong>：{e.detail}</li>)}</ol>{run.error&&<p role="alert">{run.error}</p>}</details>
  </article>;
}
function App() {
  const [user,setUser]=useState(null),[health,setHealth]=useState(null),[ready,setReady]=useState(false);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  const [kw,setKw]=useState(''),[industry,setIndustry]=useState(''),[difficulty,setDifficulty]=useState(''),[version,setVersion]=useState(0);
  const [list,setList]=useState({status:'loading',items:[]});
  const [answer,setAnswer]=useState(null),[runs,setRuns]=useState([]),[orders,setOrders]=useState([]);
  const [selected,setSelected]=useState('');
  useEffect(()=>{let active=true;Promise.all([api('/session'),api('/health')]).then(([s,h])=>{if(active){setUser(s.user);setHealth(h);setReady(true);}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
  useEffect(()=>{
    const controller=new AbortController();let active=true;
    setList({status:'loading',items:[]});
    api(`/cases?${new URLSearchParams({kw,industry,difficulty})}`,{signal:controller.signal}).then(body=>{if(active)setList({status:'success',items:body.items});}).catch(e=>{if(active&&e.name!=='AbortError')setList({status:'error',items:[],message:e.message});});
    return()=>{active=false;controller.abort();};
  },[kw,industry,difficulty,version]);
  async function refreshPrivate() {const [r,o]=await Promise.all([api('/runs'),api('/work-orders')]);setRuns(r.items);setOrders(o.items);}
  useEffect(()=>{let active=true;setRuns([]);setOrders([]);setAnswer(null);if(user)Promise.all([api('/runs'),api('/work-orders')]).then(([r,o])=>{if(active){setRuns(r.items);setOrders(o.items);}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[user?.id]);
  async function act(action) {setBusy(true);setError('');setNotice('');try{await action();}catch(e){setError(e.message);}finally{setBusy(false);}}
  const inputCase=()=>{if(!selected)throw new Error('请先选择一个案例');return selected;};
  return <><header><span className="eyebrow">AI NATIVE WEB · COURSE LAB</span><h1>从案例到受控行动</h1><p>同一个请求，穿过页面、API、数据库与权限边界。</p>
    <div className="mode">模型：固定模拟适配器 · 数据：{health?.storage==='postgres'?'PostgreSQL 持久化':health?.storage==='memory'?'内存（重启清空）':'连接中'}</div></header>
    <main><div className="notice" role="status">{notice||'所有账号与工单仅用于教学。本示例没有调用真实模型。'}</div>{error&&<p role="alert" className="error">{error}</p>}
    <section><h2>01 / 身份与权限</h2>{!ready?<p>正在初始化；若失败请重启服务后刷新页面。</p>:user?<div className="actions"><p>当前：<strong>{user.username}</strong> · {user.role}</p><button disabled={busy} onClick={()=>act(async()=>{await post('/logout',{});setUser(null);await api('/session');setNotice('已退出，原会话失效');})}>退出登录</button></div>:<form onSubmit={e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.currentTarget));act(async()=>{const data=await post('/login',values);setUser(data.user);setNotice('登录成功：身份由服务器确认');});}}>
      <label>练习账号<select name="username"><option>alice</option><option>bob</option><option>admin</option></select></label><label>练习口令<input name="password" type="password" required autoComplete="current-password" /></label><button disabled={busy}>登录</button><small>口令取自本机 .env 的 LAB_PASSWORD；管理员用于审批。</small></form>}</section>
    <section><div className="section-head"><h2>02 / 查询与持久化</h2><button className="secondary" onClick={()=>setVersion(v=>v+1)}>刷新案例</button></div>
      <div className="filters"><label>关键词<input type="search" value={kw} onChange={e=>setKw(e.target.value)} /></label><label>行业<select value={industry} onChange={e=>setIndustry(e.target.value)}><option value="">全部</option><option value="telecom">通信运营</option><option value="retail">零售</option></select></label><label>难度<select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="">全部</option><option value="beginner">入门</option><option value="intermediate">中级</option><option value="advanced">高级</option></select></label></div>
      {list.status==='loading'?<p role="status">正在加载…</p>:list.status==='error'?<p role="alert">加载失败：{list.message}</p>:!list.items.length?<p role="status">没有匹配的案例</p>:<div className="cards">{list.items.map(item=><article key={item.id} className={selected===item.id?'card selected':'card'}><p className="eyebrow">{item.industry} / {item.difficulty}</p><h3>{item.title}</h3><p className="muted">ID …{item.id.slice(-8)}</p><button aria-pressed={selected===item.id} onClick={()=>{setSelected(item.id);setAnswer(null);}}>{selected===item.id?'已选中':'选择案例'}</button></article>)}</div>}
      {user&&<details><summary>新建一条自己的案例</summary><form onSubmit={e=>{e.preventDefault();const form=e.currentTarget,values=Object.fromEntries(new FormData(form));act(async()=>{await post('/cases',values);form.reset();setVersion(v=>v+1);setNotice('创建成功；内存模式重启会丢失，数据库模式可重查');});}}><label>标题<input name="title" required maxLength={100}/></label><label>行业<select name="industry"><option value="telecom">通信运营</option><option value="retail">零售</option></select></label><label>难度<select name="difficulty"><option value="beginner">入门</option><option value="intermediate">中级</option><option value="advanced">高级</option></select></label><button disabled={busy}>保存案例</button></form></details>}</section>
    <section><h2>03 / 带证据的模拟建议</h2><p>先选择案例。场景注入用于观察校验与超时；不会发往外部服务。</p><form onSubmit={e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.currentTarget));act(async()=>{setAnswer(null);setAnswer(await post('/diagnoses',{...values,caseId:inputCase()}));});}}><label>问题<input name="question" defaultValue="应先检查哪些信息？" required maxLength={1000}/></label><label>模拟场景<select name="scenario"><option value="normal">正常证据</option><option value="no-evidence">证据不足</option><option value="bad-evidence">伪造证据</option><option value="bad-schema">错误结构</option><option value="timeout">超时</option></select></label><button disabled={!user||busy}>生成模拟建议</button></form>{!user&&<p>登录后可调用建议与工具。</p>}{answer&&<aside className="answer"><strong>MOCK · 固定教学响应</strong><p>{answer.answer}</p><p>证据编号：{answer.evidenceIds.join('、')||'无；需补充材料'}</p><p>需要人工复核：{answer.needHumanReview?'是':'否'}</p></aside>}</section>
    <section><div className="section-head"><h2>04 / 工具、审批与结果</h2><button className="secondary" disabled={!user||busy} onClick={()=>act(refreshPrivate)}>刷新运行列表</button></div><p>学生发起提案后退出，以 admin 登录审批。审批参数取自服务器保存的提案；拒绝不会创建工单。</p><button disabled={!user||busy} onClick={()=>act(async()=>{await post('/runs',{caseId:inputCase()});await refreshPrivate();setNotice('运行已到审批边界；尚未创建工单');})}>为选中案例申请练习工单</button>
      <div aria-busy={busy}>{runs.map(run=><RunView key={run.id} run={run} user={user} onDecision={(id,decision)=>act(async()=>{await post(`/runs/${id}/decision`,{decision});await refreshPrivate();})}/>)}</div>
      <h3>已创建的练习工单（{orders.length}）</h3><ul>{orders.map(order=><li key={order.id}>{order.title} · 运行 {order.runId.slice(0,8)}</li>)}</ul>
    </section><footer>课堂重点：观察 Network 与状态变化，并用测试证明被拒绝的请求没有副作用。</footer></main></>;
}
createRoot(document.getElementById('root')).render(<App/>);
