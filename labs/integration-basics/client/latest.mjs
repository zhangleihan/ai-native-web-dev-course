// 同时使用传输取消和代次检查；即使某个任务忽略signal，旧结果也不能发布。
export class LatestRequest {
  constructor(publish) {this.publish=publish;this.version=0;this.controller=null;}
  cancel() {this.version++;this.controller?.abort();this.controller=null;}
  async run(work) {
    this.cancel();const version=this.version,controller=new AbortController();this.controller=controller;
    this.publish({status:'loading'});
    try {
      const data=await work(controller.signal);
      if(version===this.version&&!controller.signal.aborted)this.publish({status:'success',data});
    } catch(error) {
      if(version===this.version&&!controller.signal.aborted&&error.name!=='AbortError')this.publish({status:'error',error});
    }
  }
}
