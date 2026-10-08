# React 基础实验：组件、状态与单向数据流

第4讲的独立前端实验。学习步骤可在页面顶部切换：静态卡片 → 受控搜索 → 共享筛选与收藏。业务数据只在内存中；刷新或离开对应步骤后重新进入会重置该步骤状态。

## 运行

需要 Node.js 20.18 或更高版本。首次安装需要网络，依赖版本由 package-lock.json 固定。

```bash
# 从 ai-native-web-dev-course 仓库根目录执行
cd labs/react-basics
npm ci
npm run dev
```

打开 http://127.0.0.1:5174 。保存代码后手动刷新；终端 Ctrl+C 停止。只在127.0.0.1监听，不依赖远程CDN、后端、数据库或模型。端口冲突时先停止自己之前启动的进程，或修改 scripts/build.mjs 的 port。

如果 npm 镜像不可用：`npm ci --registry=https://registry.npmjs.org`。离线使用前应先安装好依赖；“资料已离线”不代表 npm 依赖也已缓存。

```bash
npm test
npm run build
python3 -m http.server 5175 --bind 127.0.0.1 --directory dist
```

最后一条是独立构建预览的可选方式，访问 http://127.0.0.1:5175 。不要双击 JSX，也不要直接打开尚未构建的根 index.html。

## 阅读顺序

1. `src/model.js`：三条案例，过滤条件和不可变收藏更新。
2. `src/StaticPage.jsx`：函数组件、props、map、key。
3. `src/SearchPage.jsx`：一个最小 state、受控输入、派生结果。
4. `src/App.jsx`：FilterBar、CaseList、CaseCard 与共享状态拥有者 CasesPage。
5. `src/main.jsx`：挂载、StrictMode 与阶段切换；当前无需修改。

课件入口为课程网页 `#/part/4`，课堂任务是新增难度筛选并拆出受控子组件，作业增加排序。参考实现已给出行业筛选和收藏，不应把原样运行参考实现作为完成独立任务的证据。

## 手动验收清单

| 步骤 | 操作 | 预期 |
|---|---|---|
| 一 | 查看静态页面 | 3张不同卡片 |
| 二 | 搜索“链路”，再输入“不存在”，最后清空 | 1、0、3条，与计数一致 |
| 三 | 行业选通信 | 2条 |
| 三 | 搜索“ dns ”，行业通信 | 1条，忽略两侧空格与英文大小写 |
| 三 | 清空筛选、收藏链路中断、勾只看收藏 | 1条、已收藏1条 |
| 三 | 切换零售 | 0条，但全局收藏数仍1 |
| 三 | 清空筛选 | 恢复3条，收藏保留 |
| 三 | 只看收藏、取消最后一项 | 空态，已收藏0条 |
| 三 | 刷新 | 筛选和收藏重置；顶部回到步骤一 |
| 任一步 | Tab、Enter、Space 操作控件 | 标签明确、焦点可见、原生控件可操作 |

自动测试覆盖筛选组合、收藏更新不修改输入、组件静态渲染的空态及受控属性，不替代真实浏览器交互与视觉检查。测试中把 JSX 临时编译到系统临时目录，结束后清理。

## 来源与边界

本示例为课程案例编写；教学顺序参考 University of Helsinki Full Stack Open Part1a/1c/1d/2a/2b，以及 React 官方 Learn。完整阅读定位及版权备注见课程第4讲与 SOURCES.md。没有复制外部完整教程或重新许可整套课程。

使用 React、React DOM 与 esbuild；其许可证独立适用。这里开启开发模式以保留提示，不将其当作生产优化构建模板。网络访问、持久化、认证、Effect 与复杂状态库留待后续课程。
