import {createApp} from './app.mjs';
const port = Number(process.env.PORT ?? 3002);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT 必须是1至65535的整数');
const server = createApp().listen(port, '127.0.0.1', () => console.log(`Case API: http://127.0.0.1:${port} | memory`));
server.on('error', error => {console.error(error.message); process.exitCode = 1;});
