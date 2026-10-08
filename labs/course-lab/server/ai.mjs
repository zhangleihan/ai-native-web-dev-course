import {randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {fail, step, text} from './domain.mjs';
// Deterministic model adapter: validates the application boundary, not model quality.
export async function diagnose(item, question, scenario='normal', timeoutMs=500) {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try {
    await delay(scenario==='timeout' ? timeoutMs+100 : 10,undefined,{signal:controller.signal});
    const output=scenario==='bad-schema' ? {answer:123} : {
      answer:scenario==='no-evidence' ? '现有材料不足，需要补充监控记录。' : `先核对「${item.title}」的日志和影响范围；本建议为固定教学样本，不是实时诊断。`,
      evidenceIds:scenario==='no-evidence'?[]:[scenario==='bad-evidence'?'invented-id':item.id],
      needHumanReview:true
    };
    if(!text(output.answer,2000)||!Array.isArray(output.evidenceIds)||output.evidenceIds.some(id=>typeof id!=='string')||typeof output.needHumanReview!=='boolean') fail(502,'MODEL_SCHEMA','模型输出结构不合法');
    if(output.evidenceIds.some(id=>id!==item.id)) fail(502,'MODEL_EVIDENCE','模型引用了未提供的证据');
    return {mode:'mock',...output};
  } catch(error) {
    if(error.name==='AbortError') fail(504,'MODEL_TIMEOUT','模拟调用超时，可重试');
    throw error;
  } finally {clearTimeout(timer);}
}
export function mockPlanner({turn,item}) {
  return turn===0 ? {tool:'search_cases',args:{caseId:item.id}} : {tool:'create_work_order',args:{caseId:item.id,title:`排查：${item.title}`}};
}
export async function prepareRun({store,user,item,planner=mockPlanner,maxSteps=5}) {
  const run={id:randomUUID(),ownerId:user.id,caseId:item.id,status:'RUNNING',proposal:null,trace:[],error:null};
  // This mock planner is synchronous and bounded. A live adapter must also enforce a time/token budget.
  try {
    for(let turn=0;turn<maxSteps;turn++) {
      const call=planner({turn,item});
      if(!call||!['search_cases','create_work_order'].includes(call.tool)) fail(403,'TOOL_DENIED','工具不在允许列表');
      if(!call.args||call.args.caseId!==item.id) fail(403,'TOOL_SCOPE','工具超出本次案例范围');
      run.trace.push(step('tool_call',call.tool));
      if(call.tool==='search_cases') {
        const found=await store.getCase(item.id);
        if(!found) fail(404,'NOT_FOUND','案例已不存在');
        run.trace.push(step('tool_result',`检索命中授权案例 ${found.id}`));
      } else {
        if(!text(call.args.title,200)) fail(400,'TOOL_ARGUMENTS','工单标题不合法');
        run.proposal={tool:call.tool,caseId:item.id,title:call.args.title};
        run.status='WAITING_APPROVAL';run.trace.push(step('approval_required','提案已保存，尚未执行写操作'));
        return store.saveRun(run);
      }
    }
    fail(422,'STEP_LIMIT','达到最大执行步数');
  } catch(error) {run.status='FAILED';run.error=error.code??'TOOL_ERROR';run.trace.push(step('failed',run.error));}
  return store.saveRun(run);
}
