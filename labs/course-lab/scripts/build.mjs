import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await build({entryPoints:['client/main.jsx'],bundle:true,outfile:'dist/app.js',platform:'browser',target:['es2020'],minify:false,define:{'process.env.NODE_ENV':'"production"'},loader:{'.jsx':'jsx'}});
await copyFile('client/index.html','dist/index.html');
console.log('React页面已构建到dist；npm start 同源提供页面与API');
