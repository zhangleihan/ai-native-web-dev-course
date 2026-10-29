# 第7讲：React与API联调实验

以真实Express案例API连接React查询与创建表单，观察请求封装、竞态保护、提交确认、代理和CORS。三个固定样本，每页2条；数据独立于已有实验，重启丢失。故障注入是教学场景，不调用外部服务。

## 准备与启动

Node20.18+，从课程根目录执行：

```bash
cd labs/express-basics
npm ci --ignore-scripts
cd ../integration-basics
npm ci --ignore-scripts
npm run dev
```

打开 http://127.0.0.1:3031 。同一进程启动3030 API和3031页面/代理；无需先启动3002、数据库、账号或模型服务。Ctrl+C关闭。端口冲突时在本实验目录运行 `API_PORT=3040 WEB_PORT=3041 npm run dev`，访问3041；API地址与CORS来源随实际端口配置。

构建使用esbuild，无自动热更新；改源码后重新build或dev。node_modules、dist不进入Git。原Express业务模块从相邻目录导入，本实验安装自己的React、esbuild和代理服务依赖。

## 页面操作

| 对照 | 观察 |
|---|---|
| 正常/无匹配筛选 | 总数与本页条目数不同；合法空结果不是错误 |
| HTTP503、坏JSON、坏结构 | 分别提示HTTP或协议问题，不吞成空列表 |
| 慢查链路→快查订单 | 旧请求被取消或失效，最终结果对应当前条件 |
| 创建唯一标题 | 采用服务器id与去空白结果，随后独立刷新列表 |
| 已写入但响应中断 | 当前代理502，草稿保留；查询确认记录，不自动重复POST |
| 代理/直连允许/直连未开放 | 从3031页面对照跨源读取；未开放入口的200不等于脚本可读 |

创建成功后仍按当前筛选查询，新条目可能不匹配；读取失败也不会改变已经收到的保存确认。故障头X-Lab-Scenario只用于本机学习，正式项目不应直接开放这类注入开关。

## 自动演示与检查

```bash
npm run demo
npm run check
```

demo使用随机本机端口和独立数据，运行6组实际HTTP对照，不连接当前3030/3031实例。check运行8项测试并构建React，覆盖代理、数据契约、错误分类、超时与取消、最新请求保护、响应丢失、CORS响应头。

其中“不响应abort的旧操作”用可控Promise验证代次保护；头部构造有少量独立模块断言，其他主要路径调用真实API。CORS测试核对响应头，不执行浏览器跨源限制。

## 文件定位

| 文件 | 内容 |
|---|---|
| client/api.mjs | JSON请求、ApiError、取消/超时、字段检查与案例服务 |
| client/latest.mjs | 最新请求代次、取消与结果发布 |
| client/main.jsx | 列表、筛选、分页、创建与独立反馈 |
| server/lab.mjs | 独立内存样本、开发代理、受限CORS和故障注入 |
| tests/integration.test.mjs | 八项行为测试 |
| scripts/demo.mjs | 六组对照与断言 |

API沿用express-basics：GET /api/cases，POST /api/cases，GET/PATCH/DELETE /api/cases/:id，GET /api/health。公开内存样本没有登录；不替代course-lab的Cookie/CSRF请求模块，也不等同于FastAPI的422/detail契约。

## 排错

- 找不到express：确认相邻express-basics已经安装依赖。
- 页面404或接口地址不对：3031为页面，3030为API，8766为教材。
- 看到代理502：查API进程与故障模式；写请求还需核对是否已经保存。
- 提交按钮没发送：检查HTML required/maxLength与前端非空白校验。
- 查询失败当成无数据：核对是否把catch结果写成空数组。
- 200但解析失败：看Content-Type与Response，可能收到HTML或损坏JSON。
- 直连未开放模式只显示network：在浏览器查看跨源控制台和Network；Node读取成功不代表浏览器可读。
- 修改后页面仍旧：重新build，刷新浏览器；实验没有热更新。

教材入口7主节及7/d、7/e、7/f。来源与验证范围见[READING_GUIDE.md](READING_GUIDE.md)，观察记录见[WORKSHEET.md](WORKSHEET.md)。
