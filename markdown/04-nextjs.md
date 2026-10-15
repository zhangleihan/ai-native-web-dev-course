# Next.js：路由与服务端/客户端边界

## 学习目标与范围

完成本节后，应能根据文件路径找到页面，说明 layout 的作用，将需要事件与 state 的交互放在客户端边界，并区分页面组件与 HTTP 接口。前提是完成 React 主讲义；建议课后60–90分钟，或由教师在第7讲选用15分钟对比演示，不额外增加32学时。

本课程使用 **App Router**。网上使用 `pages/_app`、`getServerSideProps` 的材料属于另一套路由体系，不能直接粘贴进本节的 app 目录。Next.js 是一种实现路线，原课程的 React + Express 路线仍然有效，不要求把已经完成的后端重写。

## 入门：从 React 组件走到一个网站

### 框架解决哪些组织问题

React 能描述界面，但完整网站还需要知道：访问不同 URL 时显示哪个页面，多个页面如何共享导航，哪些代码在服务器执行，开发时如何编译 JSX。Next.js 为 React 应用提供这些约定和工具。它不是替换 React 的另一门语言，页面仍然由 React 组件组成。

本节先把一个“页面”理解为一个 URL 下的内容，把“路由”理解为 URL 与页面或处理函数之间的映射。`/cases` 是页面地址；`/api/cases` 是返回 JSON 的接口地址。名字类似，职责不同。

### 先分清三个运行位置

| 位置 | 做什么 | 观察方法 |
|---|---|---|
| 开发终端中的 Node.js 进程 | 运行开发服务、编译代码、处理服务端逻辑 | 看终端输出和构建错误 |
| Next.js 的服务端执行环境 | 准备页面数据、执行 Route Handler 等 | 查看请求响应、服务端日志 |
| 浏览器 | 展示页面，执行客户端交互 | 查看页面、开发者工具和 Network |

本地开发时前两项通常由同一个启动命令组织，部署后服务端也可能运行在其他托管环境。Node.js 是 JavaScript 运行环境；npm 是安装依赖和运行项目脚本的工具。`npm run dev` 中的 dev 是 package.json 里定义的脚本名，不是 JavaScript 关键字。

### 工程里的文件怎么看

| 文件或目录 | 用途 | 初学时是否手工修改 |
|---|---|---|
| package.json | 项目依赖和 dev/build/start 等命令 | 按教程修改，不随意删除依赖 |
| package-lock.json | 固定依赖解析结果，便于复现 | 由 npm 维护并随源码保存 |
| node_modules | 实际安装的第三方包 | 不直接改，不提交到作业 |
| app | App Router 的页面、布局与接口入口 | 主要学习位置 |
| components | 自己拆出的组件 | 名字是组织约定，不自动产生路由 |
| public | 公开静态文件，例如图片 | 不存密钥或私有数据 |
| .next | 编译产物与缓存 | 不手改，不作为源码提交 |

`npm ci` 按已有锁文件安装依赖；开发运行用 dev，交付前用 build 检查构建，成功后用 start 启动生产服务。三个命令用途不同，不能只因 dev 能打开就认为生产构建一定成功。

### 用两个最小页面理解路由

在配套实验的个人副本中创建 `app/welcome/page.jsx`：

```jsx
import Link from 'next/link';

export default function WelcomePage() {
  return <main>
    <h1>欢迎学习案例库</h1>
    <p>这个页面对应 /welcome。</p>
    <Link href="/cases">进入案例管理</Link>
  </main>;
}
```

保存后访问 `http://127.0.0.1:3002/welcome`。文件名 page.jsx 表示页面入口，外层目录 welcome 成为路径的一段；组件函数不必也叫 Welcome，但需要默认导出。点击链接进入 cases，再直接刷新这个地址，确认两种访问方式都能显示正确页面。

根 layout.jsx 接收 children，可以把它理解为“当前下级页面要放入的位置”。布局放站点共有的导航，页面放本页内容，不必在每个 page 中复制导航。普通 React 项目可能手动 createRoot，Next.js 项目不要求每个页面再创建 root。官方对照：[Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)。

### 渲染术语先认识，不急于优化

- 客户端渲染：浏览器执行 JavaScript 来形成或更新界面。
- 服务端渲染：服务器生成页面 HTML，让浏览器先拿到可显示的内容。
- 预渲染：在用户交互前生成初始内容；生成时机可能是构建时或请求时，取决于页面配置和数据需求。
- 水合 hydration：浏览器中的 React 接续初始 HTML，让交互生效。

这些术语与“服务端组件／客户端组件”有关，但不能画等号：带 use client 的组件也可能参与初始 HTML 预渲染。先在后文掌握代码边界，再学习缓存和性能策略。

入门检查：能从 `/welcome` 找到文件，能指出共享导航所在布局，能说明“改 JSX 后由哪个工具处理”，再继续第2节的完整实验。暂不要求动态参数、缓存刷新、Server Actions 或部署平台配置。

## 1. React、Next.js、Ant Design 各负责什么

| 技术 | 在案例库里承担的任务 | 不应误认为 |
|---|---|---|
| React | 用组件、props、state 描述列表和交互 | 自带页面路由或数据库 |
| Next.js | 用目录组织路由、共享布局和服务端/客户端代码 | 自动完成鉴权或持久化 |
| Ant Design | 提供表格、表单、输入框等组件 | 自动实现接口契约或业务正确性 |

先读 [React Foundations](https://nextjs.org/learn/react-foundations) 中的 Building UI with Components、Displaying Data with Props、Adding Interactivity with State，再读 Server and Client Components。已有 React 基础者可直接进入本节示例。[Next.js Learn](https://nextjs.org/learn) 的完整应用教程作为后续综合项目参考，不要求本节一口气完成。

## 2. 启动随教材提供的实验

[实验使用说明](labs/next-antd-basics/README.md)包含源码与锁文件，命令从课程仓库根目录执行：

```bash
cd labs/next-antd-basics
node --version
npm ci
npm run dev
```

打开 `http://127.0.0.1:3002`，先看学习说明，再进入案例管理。请使用 Node.js 20.18 或更高版本；这套实验的依赖要求与旧工具链可能不同。首次安装需要网络，页面运行不依赖远程字体、CDN 或模型服务。出现镜像访问失败时可对本次安装加 `--registry=https://registry.npmjs.org`，不用改全局配置。

这是已经准备好的工程，使用 `npm ci`，无需再运行 create-next-app。独立创建新项目时可按[官方安装教程](https://nextjs.org/docs/app/getting-started/installation)使用脚手架，选择 JavaScript 与 App Router，并以生成的目录为准。本节故意不同时引入 TypeScript、Tailwind 和复杂状态库。

```text
app/
  layout.jsx            根布局，保留 html/body 与主导航
  page.jsx              / 学习说明
  cases/page.jsx        /cases 页面入口
  api/cases/route.js    /api/cases 的 GET 接口
  globals.css           普通样式
components/
  CaseWorkbench.jsx    可交互案例管理区，声明 use client
lib/
  cases.js              教学数据、过滤与校验函数
```

## 3. 文件系统路由与共享布局

在 App Router 中，`app/cases/page.jsx` 对应 `/cases`。页面文件导出一个 React 组件即可；目录名称形成 URL 的层级。根 `layout.jsx` 包裹页面，适合放导航与共享外壳。根布局必须包含 html 和 body。

```jsx
// app/cases/page.jsx
import CaseWorkbench from '../../components/CaseWorkbench.jsx';
import { initialCases } from '../../lib/cases.js';

export default function CasesPage() {
  return <main>
    <h1>案例管理</h1>
    <p>页面负责初始数据，交互区负责筛选与新增。</p>
    <CaseWorkbench initialItems={initialCases} />
  </main>;
}
```

这是完整页面入口；CaseWorkbench 在下一节解释。站内导航使用 `next/link`：`<Link href="/cases">案例管理</Link>`。它仍表达链接语义，框架可在合适条件下优化站内导航。不要为了切换页面手动清空 document.body。

练习：新增 `app/about/page.jsx`，显示课程名称；在根导航中增加 Link。验收直接访问 `/about`、通过链接进入和刷新都能找到页面。官方定位：[Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)。

## 4. 服务端组件与客户端组件

App Router 的页面和布局默认是服务端组件。需要 useState、事件处理或浏览器 API 的模块，通常在文件顶部声明 `"use client"`。这个声明建立客户端模块边界，不必在它导入的每个子文件重复写。

```jsx
"use client";
import { useState } from 'react';

export default function SmallFilter({ initialItems }) {
  const [keyword, setKeyword] = useState('');
  const visible = initialItems.filter(item => item.title.includes(keyword));
  return <section>
    <label>关键词<input value={keyword} onChange={event => setKeyword(event.target.value)} /></label>
    <p>找到 {visible.length} 条</p>
  </section>;
}
```

若将这段单独保存到 `components/SmallFilter.jsx`，可临时在页面中替换 CaseWorkbench 来观察更小的例子。服务端页面传入的是可以序列化的案例数组；普通回调函数不能作为常规 props 从这个边界随意传到客户端。筛选 setter 与事件函数留在客户端组件内部。

客户端组件并不意味着“首屏完全不经过服务器”。Next.js 可以为初始访问生成 HTML，客户端再接管交互，这个过程称为 hydration（水合）。因此不要在组件渲染时直接读取 window/localStorage，也不要在初始渲染生成随机文本，使服务器与浏览器首次输出不一致。本例的随机 id 只在用户提交事件中生成。

服务端组件里也不要使用 useState 或 onClick。需要交互时提取一个小客户端区域，而不是把整个根布局都改成客户端。详见[Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)。

## 5. 从一次新增操作追踪状态边界

```text
服务端页面：准备初始案例数组
    ↓ initialItems（跨边界的数据）
客户端 CaseWorkbench：items / keyword / industry
    ↓ 当前数据与回调
Ant Design 输入、表单、表格
    ↓ 表单校验通过，调用 onFinish(values)
handleAdd：创建记录 → setItems → 计算 visible → Table 更新
```

本例 `useState(initialItems)` 表示首次挂载时取得初始列表，后续新增只修改浏览器组件的 state。刷新会恢复初始记录。它不是服务端数据库，也没有向 API 写入。这一点必须在界面、演示和作业说明中一致表达。

如果未来服务器持续推送新的 initialItems，不要以为 useState 会自动重新初始化；应重新设计服务器数据与本地编辑的同步规则。第7讲处理请求状态，第8讲处理身份和权限，第6讲处理持久化。

## 6. Route Handler：同一个工程也能提供 HTTP 接口

`app/api/cases/route.js` 处理 HTTP 请求，返回 Response；它不返回 JSX。实验中提供只读 GET，可在浏览器访问 `/api/cases?industry=telecom&q=DNS`，预期 total 为1。

```js
import { filterCases, initialCases } from '../../../lib/cases.js';

export function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('q') ?? '';
  const industry = searchParams.get('industry') ?? 'all';
  if (!['all', 'telecom', 'retail'].includes(industry)) {
    return Response.json({ error: '无效的 industry' }, { status: 400 });
  }
  const items = filterCases(initialCases, keyword, industry);
  return Response.json({ items, total: items.length },
    { headers: { 'Cache-Control': 'no-store' } });
}
```

这里的 JSON 来自固定初始数组，和客户端新增记录互不共享。此接口用于说明文件位置与 HTTP 契约；当前页面**没有调用它**。验收时应分别验证页面交互与接口结果，不要把两者误认为已接通。

服务端页面若能直接调用本工程的数据访问函数，一般不必为了“统一API”再通过 HTTP 请求自己。本课程的 Route Handler 留给浏览器或外部调用者观察。进一步学习：[Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)。将来增加 POST 时，需要服务端校验、授权与持久化，不能仅靠 Form 的前端规则。

## 7. 构建与常见问题

开发服务器用于改代码观察结果；生产构建用于检查交付文件，两者不是同一验收。实验选择 webpack 构建以保持课堂环境一致，不讨论不同打包器的性能比较。

```bash
# 在 labs/next-antd-basics 内执行
npm test
npm run build
npm start
```

先停止同端口的 dev 服务，再 start。含 Route Handler 的本实验需要 Node.js 服务；不要把源码目录交给 `python -m http.server` 当作完整 Next 应用，也不要声称直接拷贝静态文件就获得服务端能力。

| 现象 | 先检查 |
|---|---|
| useState / onClick 报错 | 交互模块是否正确建立客户端边界 |
| 找不到页面 | 是否为 app 下的 page.jsx；是否混用 Pages Router |
| 首屏水合警告 | 首次渲染是否读取浏览器独有信息、时间或随机值 |
| JSON 接口总看不到新增项 | 本实验的接口与本地 state 本来就未连接 |
| 首次样式闪动 | 根布局是否配置下一节的 AntdRegistry |
| Node 版本报错 | 当前终端 node --version，不只看安装过什么版本 |

## 自检与阅读任务

<details><summary>use client 表示组件只会在浏览器执行吗？</summary><p>不应这样概括。它建立客户端模块边界，初始访问仍可能有服务端预渲染；浏览器接管后运行交互。渲染阶段仍需避免直接依赖 window。</p></details>

<details><summary>页面表单新增成功，GET 接口是否必然返回新记录？</summary><p>不必然。本例只更新客户端 state，接口读固定初始数组。接通需要明确写入接口、存储和刷新策略。</p></details>

阅读顺序：★★★★★ React Foundations → ★★★★★ Layouts and Pages → ★★★★★ Server and Client Components → ★★★★☆ Route Handlers。每读一节，指出本实验中对应文件，并完成一次可见操作。下一步：[Ant Design 表格与表单](#/part/4/f)。
