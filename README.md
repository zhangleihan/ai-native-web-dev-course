# AI 原生网络应用开发 · 32 学时教材

16 讲 × 2 学时，课前导读不另占学时。以案例库与 AI-FDE 最小业务切片连接 Web 原理、全栈实现与受控 AI 功能。

## 打开与编辑

```bash
# 从仓库的上级目录进入；若已在仓库根目录，可跳过此行
cd ai-native-web-dev-course
./start.sh
# 浏览器访问 http://127.0.0.1:8766
```

教材是静态站点，不需要启动 FDE 或购买模型服务。应用实验另行启动，见 [服务启动说明.md](服务启动说明.md)。浏览器打印可导出当前小节；正文自检答案可展开，打印时包含答案。

编辑 `markdown/NN-*.md` 后执行 `python3 scripts/build_course.py`，生成 `data/course.js`。修改生成文件不能持久保留，请修改 Markdown 源。构建时会自动更新数据文件的缓存版本；已打开的浏览器标签仍需重新加载一次，切换章节不会重新读取数据。运行 `python3 scripts/check_course.py` 检查学时、章节、资源与生成一致性。

## 配套实验

已新增 [案例库全栈实验](labs/course-lab/README.md)：React、Express、PostgreSQL适配器、登录授权、模拟模型、工具审批、SSE与自动化测试。默认内存模式无需数据库和模型账号；持久化路线、分讲任务单和评估模板均在实验目录。

## 如何学习

每讲包括学习目标、先修知识、解释与示例、自检答案、实践练习、课后任务和参考定位。正文为必读，拓展不要求全部完成。第 3 讲主练习是案例筛选，旧课花艺瓶和打字游戏保留为选修。

核心路径：交互页面 → API → 持久化 → 授权 → 异步反馈/测试/部署 → 带证据的 AI 建议 → 工具审批 → 综合评估。五项目标、32学时与10%/40%/50%考核结构保持一致。

- [学习与实验指南](TEACHING_GUIDE.md)：实验骨架、环境与阶段检查。
- [来源与版权说明](SOURCES.md)：本地参考目录、官方阅读及使用边界。
- [本次修订说明](REVISION_NOTES.md)：删减、补充、修正与验证范围。

教材不是完整生产系统；明确标注的代码片段与伪代码需要放入实验骨架，真实模型与云部署按条件选做。

## React / Next.js / Ant Design 拓展

第4讲新增三个网页小节：React 官方教程与状态设计、Next.js App Router、Ant Design 表格与表单。独立实验见 [Next.js + Ant Design 案例管理](labs/next-antd-basics/README.md)。保留原基础实验，拓展内容不增加32学时；从课程网页第4讲目录访问。

第4讲末新增[AI 氛围编程：系统 UI 原型设计](markdown/04-ai-ui.md)（网页路由 `#/part/4/g`），包含情境包、分轮提示词、原型验收与第二次平时作业。

第4讲提供[FDE 工作台氛围编程案例](markdown/04-vibe-case.md)（`#/part/4/h`），结合 FDE-Workspace 的功能设计、实际源码与已有截图，重建整体 UI 的设计和迭代过程。

## FDE 原型案例

案例源项目为 `FDE-Workspace`，完整可运行前端已复制到课程中。从本课程根目录执行 `cd labs/fde-ui-case`、`npm ci`、`npm run dev`，打开 http://127.0.0.1:3100。课程配套的需求、提示词与检查表见 [FDE UI 案例资料](labs/fde-ui-case/README.md)。

## 后端与 REST API

第五讲按“概念与契约—Express分步教程—接口设计与调试—FastAPI对照”展开，参考Full Stack Open与CS50 Web公开课程。入门实验见 [Express案例API](labs/express-basics/README.md) 和 [FastAPI基础实验](labs/fastapi-basics/README.md)；完整 [资料导读](labs/backend-resources/READING_GUIDE.md) 指定必读章节、用途与版本差异。

## 数据库与数据建模

第六讲增加SQL分步教程、应用接入、事务/迁移/索引三个网页小节，主节补充关系建模、规范化、类型、NULL和约束。配套 [数据库实验](labs/database-basics/README.md) 默认使用文件型PGlite，无需Docker；支持PostgreSQL服务配置，验证范围分别记录。

## 身份认证与Web安全

第8讲扩充登录会话、Cookie/JWT、资源授权与浏览器安全三个小节，结合现有course-lab追踪真实身份流。配套 [安全实验](labs/security-basics/README.md) 提供权限矩阵、探测脚本、9项新增边界测试和官方阅读定位；浏览器策略与服务端请求验证分别记录。

第8讲新增[九幕课堂演示](markdown/08-demo.md)（网页路由 `#/part/8/g`）：从匿名请求到退出后的旧凭据重放，逐幕预测并观察真实状态与数据变化。在labs/course-lab执行 `npm run security:demo`；自动生成网页报告用 `npm run security:demo:auto`。无需.env或数据库，每次独立重置。可直接查看[实际示例报告](labs/security-basics/demo-example/report.html)。

## 实时Web应用

第9讲按通信方式选择、SSE报文与接口、React订阅、恢复与取消展开，新增网页小节9/d、9/e、9/f。配套[实时任务实验](labs/realtime-basics/README.md)提供白底React页面、Express事件流、有限历史、快照与取消，以及6组自动演示。默认本机3009，无需账号、数据库或模型服务；运行后可区分任务状态、连接状态和事件位置。

第5讲新增[OpenAPI与接口自动化](markdown/05-openapi.md)（网页路由 `#/part/5/g`），介绍设计先行、代码先行、Swagger、Redocly、Prism、类型/SDK生成及协作工具。配套[API设计工具实验](labs/api-design-tools/README.md)复用Express实现，提供本机3020交互文档、规范检查、TypeScript类型生成和真实响应契约检查。

## 前后端集成

第7讲重写查询与提交主线，新增7/d请求封装、7/e React联调、7/f代理与CORS专题。配套[联调实验](labs/integration-basics/README.md)提供筛选/分页、创建确认、竞态保护与固定故障注入。默认3031页面代理到3030独立API，无账号或数据库；`npm run demo`验证6组对照，不修改其他运行中实验的数据。
