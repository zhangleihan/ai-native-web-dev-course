import * as esbuild from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await copyFile('index.html', 'dist/index.html');
const options = { entryPoints: ['src/main.jsx'], bundle: true, outdir: 'dist',
  entryNames: 'app', jsx: 'automatic', sourcemap: true,
  define: { 'process.env.NODE_ENV': '"development"' } };
if (process.argv.includes('--serve')) {
  const context = await esbuild.context(options);
  await context.watch();
  await context.serve({ servedir: 'dist', host: '127.0.0.1', port: 5174 });
  console.log('React 基础示例：http://127.0.0.1:5174（Ctrl+C 停止）');
} else {
  await esbuild.build(options);
  console.log('已生成 dist/；可使用任意静态 HTTP 服务器预览。');
}
