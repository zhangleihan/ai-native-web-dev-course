"use client";
import {useEffect,useState} from 'react';
import {Alert,Button,Input,Checkbox,Table,Space} from 'antd';
export default function RemoteCases(){
  const [draft,setDraft]=useState(''),[query,setQuery]=useState('');
  const [page,setPage]=useState(1),[fail,setFail]=useState(false),[retry,setRetry]=useState(0);
  const [result,setResult]=useState({status:'loading',items:[],total:0});
  useEffect(()=>{
    const controller=new AbortController();let active=true;
    setResult({status:'loading',items:[],total:0});
    async function load(){
      try{
        const params=new URLSearchParams({q:query,page:String(page),demoError:fail?'1':'0'});
        const response=await fetch(`/api/catalog?${params}`,{signal:controller.signal});
        const data=await response.json();
        if(!response.ok) throw new Error(data.error??'请求失败');
        if(!Array.isArray(data.items)||!Number.isInteger(data.total)) throw new Error('接口响应格式有误');
        if(active)setResult({status:'success',items:data.items,total:data.total});
      }catch(error){if(active)setResult({status:'error',items:[],total:0,error:error.message});}
    }
    load();return ()=>{active=false;controller.abort();};
  },[query,page,fail,retry]);
  return <section><form onSubmit={event=>{event.preventDefault();setQuery(draft);setPage(1);setRetry(value=>value+1);}}>
    <Space wrap><label htmlFor="remote-query">标题关键词</label><Input id="remote-query" value={draft} onChange={event=>setDraft(event.target.value)}/><Button htmlType="submit">查询接口</Button><Checkbox checked={fail} onChange={event=>{setFail(event.target.checked);setPage(1);}}>模拟服务失败</Checkbox></Space>
  </form>
  {result.status==='error'?<Alert type="error" title={result.error} action={<Button onClick={()=>setRetry(value=>value+1)}>重试</Button>}/>:<><p role="status">{result.status==='loading'?'正在请求案例……':`共找到${result.total}条案例`}</p><Table rowKey="id" loading={result.status==='loading'} dataSource={result.items} columns={[{title:'案例标题',dataIndex:'title'}]} locale={{emptyText:'没有匹配的案例'}} pagination={{current:page,pageSize:3,total:result.total,showSizeChanger:false,onChange:setPage}}/></>}
  </section>;
}
