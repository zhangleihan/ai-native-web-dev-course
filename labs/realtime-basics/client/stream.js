import {useCallback,useEffect,useRef,useState} from 'react';
const statuses=['RUNNING','COMPLETED','CANCELLED','FAILED'];
export async function request(path,options={}) {
  const response=await fetch('/api'+path,{...options,headers:{'Content-Type':'application/json',...options.headers}});
  const data=await response.json();
  if(!response.ok) throw new Error(`${response.status} ${data.error?.message??'请求失败'}`);
  return data;
}
export function useTaskStream(initial) {
  const [task,setTask]=useState(initial),[rows,setRows]=useState([]),[connection,setConnection]=useState('连接中');
  const [notice,setNotice]=useState(''),[enabled,setEnabled]=useState(true),[retry,setRetry]=useState(0);
  const cursor=useRef(0),latest=useRef(initial),controller=useRef(null);
  const id=initial.id;
  useEffect(()=>()=>controller.current?.abort(),[]);
  const accept=useCallback(data=>{
    if(data.id!==id||!statuses.includes(data.status)||!Number.isSafeInteger(data.seq)||data.seq<0||
       !Number.isInteger(data.step)||!Number.isInteger(data.total)||data.total<=0||data.step<0||data.step>data.total)
      throw new Error('事件数据不符合任务契约');
    if(data.seq>=latest.current.seq) {latest.current=data;setTask(data);}
  },[id]);
  useEffect(()=>{
    if(!enabled){setConnection('已停止订阅，任务仍由服务端管理');return;}
    let active=true,errors=0;
    const source=new EventSource(`/api/tasks/${id}/events?after=${cursor.current}`);
    setConnection('连接中');
    function consume(event,kind) {
      if(!active)return;
      try {
        const data=JSON.parse(event.data);accept(data);
        if(kind==='reset') {cursor.current=data.seq;setRows([]);setNotice('历史已超出保留范围，已恢复当前快照；较早日志不可回放。');}
        if(kind==='state'||kind==='progress') {
          const seq=Number(event.lastEventId);
          if(!Number.isSafeInteger(seq)||seq<1||seq!==data.seq)throw new Error('事件编号不一致');
          if(seq>cursor.current) {cursor.current=seq;setRows(old=>[...old,{seq,type:kind,message:data.message}].slice(-30));}
        }
        if(kind==='done') {source.close();setConnection('本次订阅已结束');}
      } catch(error) {source.close();setConnection('订阅已停止');setNotice(error.message);}
    }
    for(const kind of ['state','progress','snapshot','reset','done']) source.addEventListener(kind,event=>consume(event,kind));
    source.onopen=()=>{if(active){errors=0;setConnection('已连接，接收中');}};
    source.onerror=()=>{
      if(!active)return;
      errors++;
      if(source.readyState===EventSource.CLOSED||errors>=3){source.close();setConnection('连接失败，请查询快照或重新订阅');}
      else setConnection('连接中断，浏览器正在尝试重连');
    };
    return()=>{active=false;source.close();};
  },[id,accept,enabled,retry]);
  async function refresh() {
    controller.current?.abort();const next=new AbortController();controller.current=next;
    try {const data=await request(`/tasks/${id}`,{signal:next.signal});if(!next.signal.aborted){accept(data);setNotice(`已查询快照：序号${data.seq}。查询不会创建或取消任务。`);}}
    catch(error){if(error.name!=='AbortError')setNotice(error.message);}
  }
  async function cancel() {
    controller.current?.abort();const next=new AbortController();controller.current=next;
    try {const data=await request(`/tasks/${id}/cancel`,{method:'POST',body:'{}',signal:next.signal});if(!next.signal.aborted){accept(data);setNotice('已提交明确的取消操作；以返回状态为准。');}}
    catch(error){if(error.name!=='AbortError')setNotice(error.message);}
  }
  return {task,rows,connection,notice,refresh,cancel,fromStart:()=>{cursor.current=0;setRows([]);setEnabled(true);setRetry(x=>x+1);},disconnect:()=>setEnabled(false),reconnect:()=>{setEnabled(true);setRetry(x=>x+1);}};
}
