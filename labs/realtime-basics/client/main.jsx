import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {request,useTaskStream} from './stream.js';
import './style.css';
const names={RUNNING:'执行中',COMPLETED:'已完成',CANCELLED:'已取消',FAILED:'执行失败'};
function Task({initial}) {
  const {task,rows,connection,notice,refresh,cancel,disconnect,reconnect,fromStart}=useTaskStream(initial);
  return <section className="task"><div className="heading"><h2>当前任务</h2><span className="badge">{names[task.status]}</span></div>
    <p className="muted id">{task.id}</p><label htmlFor="task-progress">模拟进度：{task.step} / {task.total}</label><progress id="task-progress" value={task.step} max={task.total}/>
    <dl><div><dt>业务状态</dt><dd>{names[task.status]}</dd></div><div><dt>连接状态</dt><dd>{connection}</dd></div><div><dt>快照序号</dt><dd>{task.seq}</dd></div></dl>
    <div className="actions"><button onClick={disconnect}>停止订阅</button><button onClick={reconnect}>重新订阅</button><button onClick={fromStart}>从头订阅</button><button onClick={refresh}>查询快照</button><button className="danger" disabled={task.status!=='RUNNING'} onClick={cancel}>取消任务</button></div>
    <p role="status">{notice||'先停止订阅，再查询快照：观察任务是否仍在前进。'}</p>
    <h3>本页面已收到的事件</h3><ol className="events">{rows.map(row=><li key={row.seq}><span className="seq">#{row.seq}</span><code>{row.type}</code><span>{row.message}</span></li>)}</ol>
    {!rows.length&&<p className="muted">尚无事件；恢复快照不等于找回全部历史日志。</p>}
  </section>;
}
function App() {
  const [initial,setInitial]=useState(null),[scenario,setScenario]=useState('normal'),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function create() {
    setBusy(true);setError('');
    try {setInitial(await request('/tasks',{method:'POST',body:JSON.stringify({scenario})}));}
    catch(e){setError(e.message);}finally{setBusy(false);}
  }
  return <><header><p className="eyebrow">第9讲 · 实时Web应用</p><h1>让任务过程看得见</h1><p>同一个任务，分别观察执行状态、连接状态和事件位置。</p><p className="muted">固定模拟步骤 · 内存数据 · 重启清空 · 未接入真实模型或账号系统</p></header><main>
    <aside><h2>创建一次，独立订阅</h2><label>模拟场景<select value={scenario} onChange={e=>setScenario(e.target.value)}><option value="normal">正常完成 · 6步</option><option value="fail">第3步失败</option></select></label><button className="primary" disabled={busy} onClick={create}>{busy?'正在创建…':'创建新任务'}</button>
    <p>创建另一个任务会切换当前观察对象，原任务继续运行。</p><h3>试一试</h3><ol><li>正常接收至完成，观察done后关闭。</li><li>停止订阅，等片刻再查询快照。</li><li>重新订阅，观察缺失事件补发。</li><li>明确取消，比较任务与连接的变化。</li><li>任务完成后“从头订阅”，观察历史过期后的快照恢复。</li></ol><a href="/api/health" target="_blank" rel="noreferrer">查看服务诊断</a><p className="muted">最多保留20个任务，每个任务最近6条事件；达到上限请重启实验。</p></aside>
    {initial?<Task key={initial.id} initial={initial}/>:<section className="empty"><h2>从一个模拟任务开始</h2><p>点击“创建新任务”。页面将先POST创建，再GET订阅事件；刷新页面不会自动创建任务。</p></section>}
    {error&&<p role="alert" className="error">{error}</p>}</main></>;
}
createRoot(document.getElementById('root')).render(<App/>);
