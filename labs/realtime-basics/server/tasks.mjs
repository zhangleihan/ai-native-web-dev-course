import {randomUUID} from 'node:crypto';
export const terminal = status => ['COMPLETED','CANCELLED','FAILED'].includes(status);
export class Tasks {
  constructor({intervalMs=800,total=6,historyLimit=6,maxTasks=20}={}) {
    Object.assign(this,{intervalMs,total,historyLimit,maxTasks});this.items=new Map();
  }
  create(scenario='normal') {
    if(this.items.size>=this.maxTasks) return null;
    const task={id:randomUUID(),scenario,status:'RUNNING',step:0,total:this.total,seq:0,events:[],timer:null};
    this.items.set(task.id,task);this.append(task,'state','任务已创建，模拟执行开始');
    task.timer=setInterval(()=>{
      task.step++;
      if(scenario==='fail'&&task.step===3) return this.finish(task,'FAILED','模拟执行在第3步失败');
      this.append(task,'progress',`已完成第${task.step}步`);
      if(task.step===task.total) this.finish(task,'COMPLETED','模拟任务已完成');
    },this.intervalMs);
    return task;
  }
  snapshot(task) {
    const {id,scenario,status,step,total,seq,updatedAt}=task;
    return {id,scenario,status,step,total,seq,updatedAt,mode:'mock-memory'};
  }
  append(task,type,message) {
    task.seq++;task.updatedAt=new Date().toISOString();
    task.events.push({id:task.seq,type,data:{...this.snapshot(task),message}});
    if(task.events.length>this.historyLimit) task.events.shift();
  }
  finish(task,status,message) {
    if(terminal(task.status)) return;
    clearInterval(task.timer);task.timer=null;task.status=status;this.append(task,'state',message);
  }
  cancel(task) {this.finish(task,'CANCELLED','用户明确取消了任务');return this.snapshot(task);}
  close() {for(const task of this.items.values()) clearInterval(task.timer);}
}
