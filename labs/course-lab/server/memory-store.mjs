import {randomUUID} from 'node:crypto';
import {fail, decisionFor, step} from './domain.mjs';
// Single-process teaching adapter. Synchronous decision mutation is atomic here only.
export class MemoryStore {
  mode = 'memory'; users = []; cases = []; runs = []; orders = []; approvals = [];
  async findUser(name) {return this.users.find(u=>u.username===name);}
  async user(id) {return this.users.find(u=>u.id===id);}
  async addUser(u) {if (!(await this.findUser(u.username))) this.users.push(structuredClone(u));}
  async listCases({industry='',difficulty='',kw=''}={}) {return this.cases.filter(c=>(!industry||c.industry===industry)&&(!difficulty||c.difficulty===difficulty)&&c.title.includes(kw)).map(c=>({...c}));}
  async getCase(id) {return this.cases.find(c=>c.id===id);}
  async createCase(c) {const row={id:randomUUID(),...c};this.cases.push(row);return {...row};}
  async insertSeedCase(c) {if(!this.cases.some(x=>x.id===c.id)) this.cases.push({...c});}
  async updateCase(id, patch, actor) {
    const c=this.cases.find(c=>c.id===id);
    if(!c) fail(404,'NOT_FOUND','案例不存在');
    if(c.ownerId!==actor.id&&actor.role!=='admin') fail(403,'FORBIDDEN','不可修改其他用户的案例');
    Object.assign(c,patch); return {...c};
  }
  async saveRun(run) {this.runs.push(structuredClone(run));return structuredClone(run);}
  async getRun(id) {const r=this.runs.find(r=>r.id===id);return r ? structuredClone(r) : undefined;}
  async listRuns(user) {return this.runs.filter(r=>r.ownerId===user.id||user.role==='admin').map(r=>structuredClone(r));}
  async decide(id,decision,actor) {
    if(actor.role!=='admin') fail(403,'FORBIDDEN','仅管理员可审批');
    const run=this.runs.find(r=>r.id===id);
    if(!run) fail(404,'NOT_FOUND','运行不存在');
    if(decisionFor(run,decision)==='replay') return structuredClone(run);
    this.approvals.push({runId:id,actorId:actor.id,decision});
    if(decision==='reject') {run.status='CANCELLED';run.trace.push(step('rejected','审批拒绝，未建单'));}
    else {
      run.status='RUNNING';run.trace.push(step('approved','允许继续执行'));
      this.orders.push({id:randomUUID(),runId:id,caseId:run.caseId,title:run.proposal.title});
      run.trace.push(step('tool_result','练习工单创建成功'));run.status='COMPLETED';
    }
    return structuredClone(run);
  }
  async listOrders(user) {return this.orders.filter(o=>user.role==='admin'||this.runs.find(r=>r.id===o.runId)?.ownerId===user.id).map(o=>({...o}));}
  async close() {}
}
