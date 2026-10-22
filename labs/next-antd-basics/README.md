# Next.js + Ant Design 案例管理入门

第4讲拓展实验：App Router 页面、客户端交互、Table、Form 和只读 Route Handler。课程网页入口为 `#/part/4/e` 与 `#/part/4/f`。

## 启动

从课程仓库根目录执行，使用 Node.js 20.18 或更高版本：

```bash
cd labs/next-antd-basics
node --version
npm ci
npm run dev
```

访问 http://127.0.0.1:3002 。首次安装需要网络；镜像不可用时运行 `npm ci --registry=https://registry.npmjs.org`。Ctrl+C 停止服务。页面不加载外部字体或远程 API。

```bash
# 在实验目录中；先停止 dev 再 start，避免端口冲突
npm test
npm run build
npm start
```

构建显式使用 webpack。不要把本项目当纯静态站点用 Python 服务直接打开，Route Handler 需要 Next.js 服务。不要同时运行两个占用3002端口的服务。

## 源码阅读顺序

- `lib/cases.js`：初始数据、过滤、输入规范化。
- `app/layout.jsx`、`app/page.jsx`：根布局与首页。
- `app/cases/page.jsx`：服务端页面传入初始数据。
- `components/CaseWorkbench.jsx`：客户端状态、Ant Design 表格与表单。
- `app/api/cases/route.js`：只读 GET 接口；页面当前没有调用此接口。

页面新增只保存在客户端 state，刷新会恢复初始3条。GET 接口永远读取初始数组；本例没有 POST、数据库、认证、模型调用。新增后主动清空筛选，使新记录立即可见，并显示通知。

## 验收

1. `/` 和 `/cases` 均可直接访问，导航链接正常。
2. 搜索 ` DNS ` 并选通信得到1条，选零售得到0条。
3. 空白标题提交失败；有效标题成功后4条，草稿重置。
4. 刷新恢复3条，界面明确说明数据边界。
5. `/api/cases?industry=telecom&q=DNS` 返回 total=1；非法行业返回400。

`npm test`检查过滤、输入校验和 GET 契约，不替代真实浏览器中的表单操作、键盘可访问性与样式验收。详细课程任务见网页第4讲新增小节。

## 版本与来源

2026-10-14 查询公开 npm 元数据后固定 Next.js 16.4.0、React/React DOM 19.3.0、Ant Design 6.6.6、nextjs-registry 1.3.0；传递依赖以 package-lock.json 为准。未来升级需重新核对文档与测试，不使用浮动 latest 作为课堂安装入口。

参考 React Learn、Next.js Learn/App Router 文档、Ant Design 中文 Form/Table/Next.js 集成文档，具体链接在课程正文与 SOURCES.md。案例代码按课程编写，第三方依赖许可证独立适用。


## 进阶实验（新增）

原 `/cases` 保持三条记录的入门练习。新增页面使用六条初始数据：

| 页面 | 学习内容 | 数据来源 |
|---|---|---|
| `/catalog` | URL 查询、分页、服务端组件 | lib/catalog.js 固定数据 |
| `/catalog/case-003` | 动态路径参数、详情与未找到提示 | 同一固定数据 |
| `/remote` | 真实 HTTP 请求、加载、无结果、错误、重试 | GET /api/catalog |
| `/workbench` | 筛选、排序、分页、抽屉表单、编辑和删除确认 | 浏览器内存副本 |

工作台刷新恢复6条；编辑不会改变只读目录和接口。接口的 `demoError=1` 专用于课堂演示503；关闭模拟失败后再重试可恢复。`page=-1` 返回400；不存在的关键词返回200和空数组。每页3条，越界正整数页码归一到末页。

建议依次完成目录筛选与详情、接口失败恢复、工作台新增编辑删除。完整逐步教程与验收表见课程 React 拓展、Next.js 和 Ant Design 小节。使用 `npm test` 验证数据函数与接口契约，再 `npm run build` 检查生产构建。

## 氛围编程系统 UI 案例

系统 UI 设计案例改用独立的 FDE-Workspace 原型，阅读教材第4讲“FDE 工作台整体 UI 设计”。本目录继续用于 React、Next.js 与 Ant Design 基础实验，不承担完整 FDE 原型的运行。
