import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient,createCasesAPI} from './api.mjs';
import {LatestRequest} from './latest.mjs';
import './style.css';
const initialFilters={kw:'',industry:'',difficulty:'',offset:0,limit:2};
function ErrorMessage({error}) {
  return <div className="error" role="alert"><strong>{error.message}</strong><p>分类：{error.kind}{error.status?` · HTTP ${error.status}`:''}{error.code?` · ${error.code}`:''}</p>{error.requestId&&<small>请求编号：{error.requestId}</small>}</div>;
}
function CaseList({api,filters,scenario,version,onPage}) {
  const [result,setResult]=useState({status:'loading'});
  const latest=useMemo(()=>new LatestRequest(setResult),[]);
  useEffect(()=>{
    latest.run(signal=>api.list(filters,{signal,scenario}));
    return()=>latest.cancel();
  },[api,filters,scenario,version,latest]);
  if(result.status==='loading')return <section aria-busy="true"><h2>服务端列表</h2><p role="status">正在读取当前筛选结果…</p></section>;
  if(result.status==='error')return <section><h2>服务端列表</h2><ErrorMessage error={result.error}/><p>修正读取场景或网络后，点击上方“重试读取”。失败没有被当成空数组。</p></section>;
  const page=result.data;
  return <section><div className="heading"><h2>服务端列表</h2><span>共{page.total}条 · offset={page.offset}</span></div>
    {!page.items.length?<p role="status">没有匹配案例。这是成功查询的空结果。</p>:<ul className="cards">{page.items.map(item=><li key={item.id}><p className="muted">{item.industry} · {item.difficulty}</p><h3>{item.title}</h3><small className="id">{item.id}</small></li>)}</ul>}
    <div className="actions"><button disabled={page.offset===0} onClick={()=>onPage(Math.max(0,page.offset-page.limit))}>上一页</button><button disabled={page.offset+page.limit>=page.total} onClick={()=>onPage(page.offset+page.limit)}>下一页</button></div>
  </section>;
}
function CreateForm({api,onSaved,onBusy}) {
  const empty={title:'',industry:'通信',difficulty:'beginner'};
  const [draft,setDraft]=useState(empty),[state,setState]=useState({status:'idle'}),[writeMode,setWriteMode]=useState('normal');
  const busy=useRef(false),alive=useRef(false),controller=useRef(null);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;controller.current?.abort();};},[]);
  async function submit(event) {
    event.preventDefault();if(busy.current)return;
    if(!draft.title.trim()){setState({status:'invalid',message:'请填写非空白标题；草稿已保留。'});return;}
    busy.current=true;onBusy(true);setState({status:'saving'});controller.current=new AbortController();
    try {
      const saved=await api.create(draft,{signal:controller.current.signal,scenario:writeMode});
      if(alive.current){setState({status:'saved',saved});setDraft(empty);onSaved();}
    } catch(error) {
      if(alive.current&&error.name!=='AbortError') {
        const uncertain=error.kind!=='http'||error.status>=500;
        setState({status:uncertain?'uncertain':'failed',error});
      }
    } finally {busy.current=false;if(alive.current)onBusy(false);}
  }
  return <section><h2>提交一个新案例</h2><p className="muted">成功后采用服务器返回对象，再独立刷新列表。失败保留草稿；不自动重试POST。</p>
    <form onSubmit={submit}><fieldset disabled={state.status==='saving'}><label>标题<input required maxLength={100} value={draft.title} onChange={e=>setDraft(v=>({...v,title:e.target.value}))}/></label>
    <label>行业<select value={draft.industry} onChange={e=>setDraft(v=>({...v,industry:e.target.value}))}><option>通信</option><option>零售</option></select></label>
    <label>难度<select value={draft.difficulty} onChange={e=>setDraft(v=>({...v,difficulty:e.target.value}))}><option value="beginner">入门</option><option value="intermediate">中级</option><option value="advanced">高级</option></select></label>
    <label>写入响应模式<select disabled={state.status==='saving'} value={writeMode} onChange={e=>setWriteMode(e.target.value)}><option value="normal">正常返回201</option><option value="response-lost">已写入，但响应被实验服务中断</option></select></label>
    <button className="primary" disabled={state.status==='saving'}>{state.status==='saving'?'正在提交…':'提交到API'}</button></fieldset></form>
    {state.status==='invalid'&&<p role="alert">{state.message}</p>}
    {state.status==='saved'&&<div className="success" role="status"><strong>已创建：{state.saved.title}</strong><p className="id">服务器编号：{state.saved.id}</p><p>列表按当前筛选重新读取；若刷新失败或不匹配筛选，不改变此次创建成功的事实。</p></div>}
    {(state.status==='failed'||state.status==='uncertain')&&<><ErrorMessage error={state.error}/><p>{state.status==='uncertain'?'写入结果未确认。先把筛选清空并重新读取列表，核对是否已经保存；不要直接重复提交。':'请求被拒绝，草稿仍在；修正后再提交。'}</p></>}
  </section>;
}
function App({apiOrigin}) {
  const [filters,setFilters]=useState(initialFilters),[version,setVersion]=useState(0),[scenario,setScenario]=useState('normal'),[mode,setMode]=useState('proxy'),[busy,setBusy]=useState(false);
  const base=mode==='proxy'?'/api':mode==='direct'?apiOrigin+'/api':apiOrigin+'/no-cors/api';
  const api=useMemo(()=>createCasesAPI(createClient(base)),[base]);
  const filter=(key,value)=>setFilters(v=>({...v,[key]:value,offset:0}));
  return <><header><p className="eyebrow">第7讲 · 前后端集成</p><h1>从界面动作到可靠请求</h1><p>读列表、提交表单、解释失败，并让旧响应失去覆盖新结果的机会。</p><p className="muted">真实Express API · 固定样本与故障注入 · 独立内存，重启清空 · 无账号或模型</p></header><main>
    <section className="controls"><h2>查询与联调条件</h2><div className="grid"><label>关键词<input type="search" value={filters.kw} onChange={e=>filter('kw',e.target.value)}/></label>
    <label>行业<select value={filters.industry} onChange={e=>filter('industry',e.target.value)}><option value="">全部</option><option>通信</option><option>零售</option></select></label>
    <label>难度<select value={filters.difficulty} onChange={e=>filter('difficulty',e.target.value)}><option value="">全部</option><option value="beginner">入门</option><option value="intermediate">中级</option><option value="advanced">高级</option></select></label>
    <label>读取场景<select value={scenario} onChange={e=>setScenario(e.target.value)}><option value="normal">正常</option><option value="delay">延迟：链路900ms，订单60ms</option><option value="http-error">HTTP503</option><option value="bad-json">200但JSON损坏</option><option value="bad-shape">200但列表结构错误</option></select></label>
    <label>请求路径<select disabled={busy} value={mode} onChange={e=>setMode(e.target.value)}><option value="proxy">同源/api，经开发代理</option><option value="direct">跨源直连，开放给本页面</option><option value="blocked">跨源直连，未开放读取</option></select></label></div>
    <div className="actions"><button onClick={()=>setVersion(x=>x+1)}>重试读取</button><button onClick={()=>{setFilters(initialFilters);setScenario('normal');setVersion(x=>x+1);}}>恢复正常查询</button><button onClick={()=>{setScenario('delay');setFilters({...initialFilters,kw:'链路'});}}>慢查链路</button><button onClick={()=>{setScenario('delay');setFilters({...initialFilters,kw:'订单'});}}>快查订单</button></div><p className="muted">当前API地址：<code>{base}</code>。延迟按钮用于对照，自动演示不依赖手速。跨源未开放时，浏览器可能只报告网络读取失败；用Network定位。</p></section>
    <CaseList api={api} filters={filters} scenario={scenario} version={version} onPage={offset=>setFilters(v=>({...v,offset}))}/>
    <CreateForm api={api} onBusy={setBusy} onSaved={()=>{setFilters(v=>({...v,offset:0}));setVersion(x=>x+1);}}/>
  </main></>;
}
fetch('/lab-config.json').then(r=>{if(!r.ok)throw new Error('实验配置读取失败');return r.json();})
  .then(config=>createRoot(document.getElementById('root')).render(<App apiOrigin={config.apiOrigin}/>))
  .catch(()=>{document.getElementById('root').textContent='页面配置加载失败，请确认实验代理服务已启动。';});
