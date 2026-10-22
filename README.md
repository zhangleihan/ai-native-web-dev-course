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

编辑 `markdown/NN-*.md` 后执行 `python3 scripts/build_course.py`，生成 `data/course.js`。修改生成文件不能持久保留，请修改 Markdown 源。运行 `python3 scripts/check_course.py` 检查学时、章节、资源与生成一致性。

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
