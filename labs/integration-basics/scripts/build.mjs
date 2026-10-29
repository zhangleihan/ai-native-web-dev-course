import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await build({entryPoints:['client/main.jsx'],bundle:true,outfile:'dist/app.js',platform:'browser',target:['es2020'],define:{'process.env.NODE_ENV':'"production"'}});
await copyFile('client/index.html','dist/index.html');console.log('第7讲React页面已构建；npm start启动API与代理页面');
