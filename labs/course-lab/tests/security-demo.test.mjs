import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const execute=promisify(execFile);
test('课堂九幕演示可重跑，报告包含预期拒绝和转义证据且不含凭据',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'security-demo-'));
 try {
  const args=[new URL('../scripts/security-demo.mjs',import.meta.url).pathname,'--auto','--report','--report-dir',dir];
  for(let i=0;i<2;i++) {
   const {stdout}=await execute(process.execPath,args,{timeout:20000});assert.match(stdout,/9幕全部符合预期/);
   const raw=await readFile(join(dir,'report.json'),'utf8'),report=JSON.parse(raw);
   assert.equal(report.sceneCount,9);assert.ok(report.scenes.every(scene=>scene.passed));
   assert.equal(report.scenes[0].evidence.countBefore,2);
   assert.equal(report.scenes[3].evidence.unchanged,true);
   assert.equal(report.scenes[4].evidence.actualRole,'student');
   assert.equal(report.scenes[8].requests[1].status,401);
   for(const key of ['password','passwordHash','cookie','csrf','set-cookie','authorization']) assert.ok(!raw.toLowerCase().includes('"'+key.toLowerCase()+'":'));
   assert.doesNotMatch(raw,/[a-f0-9]{64}/);
   const html=await readFile(join(dir,'report.html'),'utf8');assert.ok(html.includes('&lt;strong&gt;课堂标记&lt;/strong&gt;'));
   assert.ok(!html.includes('<strong>课堂标记</strong>'));
  }
 } finally {await rm(dir,{recursive:true,force:true});}
});
