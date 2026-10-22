import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,queryCatalog,saveRecord} from '../lib/catalog.js';
import {GET} from '../app/api/catalog/route.js';
test('查询组合条件、空结果、分页与越界归一化',()=>{
 assert.equal(queryCatalog(new URLSearchParams()).total,6);
 assert.equal(queryCatalog(new URLSearchParams('page=2')).items[0].id,'case-004');
 assert.equal(queryCatalog(new URLSearchParams('q=DNS&industry=telecom')).total,1);
 assert.equal(queryCatalog(new URLSearchParams('q=DNS&industry=retail&page=99')).page,1);
 for(const query of ['page=0','page=1.5','industry=unknown']) assert.throws(()=>queryCatalog(new URLSearchParams(query)));
});
test('新增和编辑不修改原数组，拒绝非法状态及空说明',()=>{
 const snapshot=JSON.stringify(catalog),values={...catalog[0],title:'新的标题'};
 const edited=saveRecord(catalog,values,catalog[0].id);
 assert.equal(edited.length,6);assert.equal(edited[0].title,'新的标题');
 assert.equal(saveRecord(catalog,values,'new').length,7);
 assert.equal(JSON.stringify(catalog),snapshot);
 assert.throws(()=>saveRecord(catalog,{...values,status:'bad'},'new'));
 assert.throws(()=>saveRecord(catalog,{...values,summary:'  '},'new'));
});
test('接口正确区分200、400、503',async()=>{
 for(const [query,status] of [['page=2',200],['page=-1',400],['demoError=1',503]]){
 const response=GET(new Request(`http://localhost/api/catalog?${query}`));
 assert.equal(response.status,status);assert.equal(response.headers.get('Cache-Control'),'no-store');
 const body=await response.json();if(status===200){assert.equal(body.items.length,3);assert.equal(body.total,6);}else assert.ok(body.error);
 }
});
