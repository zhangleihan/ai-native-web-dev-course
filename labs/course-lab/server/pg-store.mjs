import {randomUUID} from 'node:crypto';
import {fail, decisionFor, step} from './domain.mjs';
const camel = row => row && Object.fromEntries(Object.entries(row).map(([k,v])=>[k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()),v]));
export class PgStore {
  mode = 'postgres';
  constructor(pool) {this.pool=pool;}
  async findUser(name) {return camel((await this.pool.query('SELECT * FROM users WHERE username=$1',[name])).rows[0]);}
  async user(id) {return camel((await this.pool.query('SELECT * FROM users WHERE id=$1',[id])).rows[0]);}
  async addUser(u) {await this.pool.query('INSERT INTO users(id,username,password_hash,role) VALUES($1,$2,$3,$4) ON CONFLICT(username) DO NOTHING',[u.id,u.username,u.passwordHash,u.role]);}
  async listCases({industry='',difficulty='',kw=''}={}) {
    return (await this.pool.query(`SELECT * FROM cases WHERE ($1='' OR industry=$1) AND ($2='' OR difficulty=$2) AND ($3='' OR strpos(title,$3)>0) ORDER BY created_at,id`,[industry,difficulty,kw])).rows.map(camel);
  }
  async getCase(id) {return camel((await this.pool.query('SELECT * FROM cases WHERE id=$1',[id])).rows[0]);}
  async createCase(c) {
    return camel((await this.pool.query('INSERT INTO cases(id,title,industry,difficulty,owner_id) VALUES($1,$2,$3,$4,$5) RETURNING *',[randomUUID(),c.title,c.industry,c.difficulty,c.ownerId])).rows[0]);
  }
  async insertSeedCase(c) {await this.pool.query('INSERT INTO cases(id,title,industry,difficulty,owner_id) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING',[c.id,c.title,c.industry,c.difficulty,c.ownerId]);}
  async updateCase(id,p,actor) {
    const result=await this.pool.query('UPDATE cases SET title=$1,industry=$2,difficulty=$3 WHERE id=$4 AND (owner_id=$5 OR $6) RETURNING *',[p.title,p.industry,p.difficulty,id,actor.id,actor.role==='admin']);
    if(!result.rows.length) {if(!await this.getCase(id)) fail(404,'NOT_FOUND','案例不存在');fail(403,'FORBIDDEN','不可修改其他用户的案例');}
    return camel(result.rows[0]);
  }
  async saveRun(r) {
    return camel((await this.pool.query('INSERT INTO runs(id,owner_id,case_id,status,proposal,trace,error) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[r.id,r.ownerId,r.caseId,r.status,JSON.stringify(r.proposal),JSON.stringify(r.trace),r.error??null])).rows[0]);
  }
  async getRun(id) {return camel((await this.pool.query('SELECT * FROM runs WHERE id=$1',[id])).rows[0]);}
  async listRuns(user) {return (await this.pool.query('SELECT * FROM runs WHERE owner_id=$1 OR $2 ORDER BY created_at,id',[user.id,user.role==='admin'])).rows.map(camel);}
  async decide(id,decision,actor) {
    if(actor.role!=='admin') fail(403,'FORBIDDEN','仅管理员可审批');
    const client=await this.pool.connect();
    try {
      await client.query('BEGIN');
      const r=camel((await client.query('SELECT * FROM runs WHERE id=$1 FOR UPDATE',[id])).rows[0]);
      if(!r) fail(404,'NOT_FOUND','运行不存在');
      if(decisionFor(r,decision)==='replay') {await client.query('COMMIT');return r;}
      await client.query('INSERT INTO approvals(run_id,actor_id,decision) VALUES($1,$2,$3)',[id,actor.id,decision]);
      if(decision==='approve') {
        r.trace.push(step('approved','允许继续执行，进入 RUNNING'));
        await client.query("UPDATE runs SET status='RUNNING' WHERE id=$1",[id]);
        // The sandbox side effect is inside this transaction. External APIs need a different design.
        await client.query('INSERT INTO work_orders(id,run_id,case_id,title) VALUES($1,$2,$3,$4)',[randomUUID(),id,r.caseId,r.proposal.title]);
        r.status='COMPLETED';r.trace.push(step('tool_result','练习工单创建成功'));
      } else {r.status='CANCELLED';r.trace.push(step('rejected','审批拒绝，未建单'));}
      const result=await client.query('UPDATE runs SET status=$1,trace=$2 WHERE id=$3 RETURNING *',[r.status,JSON.stringify(r.trace),id]);
      await client.query('COMMIT');return camel(result.rows[0]);
    } catch(error) {await client.query('ROLLBACK');throw error;}
    finally {client.release();}
  }
  async listOrders(user) {return (await this.pool.query('SELECT w.* FROM work_orders w JOIN runs r ON r.id=w.run_id WHERE r.owner_id=$1 OR $2 ORDER BY w.created_at',[user.id,user.role==='admin'])).rows.map(camel);}
  async close() {await this.pool.end();}
}
