import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createApp} from '../../express-basics/server/app.mjs';
const require=createRequire(import.meta.url);
const dist=require('swagger-ui-dist').getAbsoluteFSPath();
const spec=readFileSync(new URL('../openapi.json',import.meta.url));
const assets=new Map([
 ['/vendor/swagger-ui.css',{body:readFileSync(dist+'/swagger-ui.css'),type:'text/css'}],
 ['/vendor/swagger-ui-bundle.js',{body:readFileSync(dist+'/swagger-ui-bundle.js'),type:'text/javascript'}]
]);
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OpenAPI · 案例库接口设计</title><link rel="stylesheet" href="/vendor/swagger-ui.css"><style>body{margin:0;background:white}.intro{max-width:1460px;margin:auto;padding:24px 20px;font:16px/1.7 system-ui;color:#243342}.swagger-ui .topbar{display:none}</style><header class="intro"><h1>案例库接口设计实验</h1><p>OpenAPI描述 → 交互文档 → 真实Express请求。这里的Try it out会修改本次独立内存样本，重启清空。</p><a href="/openapi.json">查看规范JSON</a><p>默认无账号，无数据库；不连接已经运行的3002服务。Swagger UI资源保存在本机，不使用CDN或远程规范校验器。</p></header><div id="swagger-ui"></div><script src="/vendor/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui',deepLinking:true,validatorUrl:null,presets:[SwaggerUIBundle.presets.apis]});</script></html>`;
export function createDocsServer({logger=()=>{}}={}) {
 const api=createApp({logger});
 return createServer((req,res)=>{
  const path=new URL(req.url,'http://127.0.0.1').pathname;
  const send=(type,body)=>{res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);};
  if(req.method==='GET'&&['/','/docs','/docs/'].includes(path))return send('text/html; charset=utf-8',html);
  if(req.method==='GET'&&path==='/openapi.json')return send('application/json; charset=utf-8',spec);
  if(req.method==='GET'&&assets.has(path)){const asset=assets.get(path);return send(asset.type,asset.body);}
  api(req,res);
 });
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 const port=Number(process.env.PORT??3020);
 if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT应在1–65535之间');
 const server=createDocsServer({logger:console.log});
 server.on('error',e=>{console.error(e.message);process.exitCode=1;});
 server.listen(port,'127.0.0.1',()=>console.log(`OpenAPI交互文档：http://127.0.0.1:${port}/docs · 本次独立内存API`));
 for(const sig of ['SIGINT','SIGTERM'])process.once(sig,()=>{server.closeAllConnections();server.close();});
}
