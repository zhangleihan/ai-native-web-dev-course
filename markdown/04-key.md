# React：组件、状态与单向数据流入门教程

## 学习目标与课前准备

本讲把第3讲的“读取输入—计算结果—更新页面”改写为 React 应用。学完后，应能独立完成以下任务：把页面拆成组件，用 props 传入数据，用事件回调表达用户意图，用 state 保存交互记忆，并解释一次输入如何改变屏幕。最终作品是一个支持标题搜索、行业筛选与收藏的案例库。

先修：HTML 表单、JavaScript 函数和事件、数组 `map/filter/includes`、对象、模块导入导出。不会 React 没有关系；若这些 JavaScript 语法仍不熟悉，先读本讲第2节与 Full Stack Open（下文简称 FSO）Part 1b。

**2学时按90分钟组织**：10分钟运行与对比原生DOM；20分钟组件、JSX、props；20分钟事件、state、受控输入；30分钟共享状态与案例库练习；10分钟解释与验收。第10节的复杂更新、第11节的调试以及扩展阅读用于课后巩固，不要求90分钟内逐字讲完。首次依赖安装放在课前完成。

| 学习阶段 | 可见结果 | 要能解释的问题 |
|---|---|---|
| 一：静态组件 | 三张案例卡片 | 为什么一个组件能展示不同数据？ |
| 二：状态与搜索 | 输入关键词，列表和数量同步变化 | 普通变量为什么不能代替 state？ |
| 三：共享状态 | 多条件筛选、收藏与总数联动 | 收藏按钮如何让上层统计变化？ |

## 1. 先运行三个阶段，再阅读实现

本讲配套独立示例位于 [labs/react-basics 使用说明](labs/react-basics/README.md)。它只需要前端依赖，不需要数据库、账号、API 密钥或后端实验。

在终端执行：

```bash
# 从 ai-native-web-dev-course 仓库根目录执行
cd labs/react-basics
npm ci
npm run dev
```

浏览器访问 `http://127.0.0.1:5174`，依次选择三个学习步骤。依赖首次安装需要联网；安装后示例不请求 CDN 或远程接口。文件保存后手动刷新浏览器查看变化；本示例不配置热更新。结束时在终端按 Ctrl+C。若当前 npm 镜像不能访问，可使用 `npm ci --registry=https://registry.npmjs.org`。

```text
react-basics/
  index.html             HTML 容器：只有 root 挂载点
  src/main.jsx           React 入口与学习步骤切换
  src/StaticPage.jsx     阶段一：组件、props、列表
  src/SearchPage.jsx     阶段二：useState 与搜索
  src/App.jsx            阶段三：筛选、收藏、状态提升
  src/model.js           案例数据与纯计算函数
  src/style.css          普通 CSS
  scripts/build.mjs      JSX 编译、打包、本地静态服务
```

React 是用于描述界面的库；React DOM 把描述呈现在浏览器里；JSX 是嵌入 JavaScript 的界面语法；本例的 esbuild 负责把 JSX 与模块编译成浏览器能执行的文件。浏览器不能直接把磁盘上的 `.jsx` 当普通 HTML 打开。React 本身也不会自动提供路由、数据库或服务端 API。

入口的关键代码是：

```jsx
import { createRoot } from 'react-dom/client';
import CasesPage from './App.jsx';

createRoot(document.getElementById('root')).render(<CasesPage />);
```

这里仅展示入口原理；配套 `main.jsx` 还包含步骤选择和开发用 `StrictMode`。先保留完整入口，不必改动它。

**和打字游戏对照**：原生版本通常在事件中逐个修改 `textContent`、`className`。React 版本先更新数据，再由组件描述当前数据对应的界面。组件再次执行叫“渲染”；React 随后把需要的变化提交给 DOM。重新渲染不等于整页刷新，也不保证每个 DOM 节点都被重建。不要在 React 管理的列表内再用 `innerHTML` 手动替换子节点。

检查点：选择步骤三，收藏第一条后显示“已收藏1条”；刷新后归零。这是内存状态，不是已经保存进数据库。

## 2. 读懂 React 所需的 JavaScript

下面都是 JavaScript，不是 React 专有语法。可以先在浏览器控制台试算。

```js
const item = { id: 'case-001', title: '链路中断', industry: 'telecom' };
const { title, industry } = item; // 对象解构：从同名属性取值
const titles = ['链路中断', '订单延迟'];
const labels = titles.map(title => `案例：${title}`); // 返回新数组
const matches = titles.filter(title => title.includes('链路')); // 保留符合条件的项
const renamed = { ...item, title: '链路恢复' }; // 浅复制后覆盖 title
const added = [...titles, 'DNS 解析失败']; // 新数组，原 titles 不变
```

箭头函数 `item => item.title` 隐式返回表达式；写成块体时要显式 `return`：`item => { return item.title; }`。忘记返回值会让 `map` 得到一组 `undefined`，导致列表看似“没有渲染”。

`import { useState } from 'react'` 是命名导入，名字必须对应导出；`import CasesPage from './App.jsx'` 是默认导入，对应 `export default`。一个文件可有多个命名导出，但至多一个默认导出。先把“普通 JavaScript 语法”与“React 的约定”分清楚，报错时更容易定位。

## 3. 组件：把页面切成可理解的单元

函数组件是返回界面描述的 JavaScript 函数。先在一个文件中观察最小例子：

```jsx
function CaseCard() {
  return (
    <article>
      <h2>链路中断</h2>
      <p>行业：通信</p>
    </article>
  );
}

export default function CasesPage() {
  return <main><h1>案例库</h1><CaseCard /><CaseCard /></main>;
}
```

`<article>` 是浏览器元素；`<CaseCard />` 是我们定义的组件，名称以大写字母开头。两个 `<CaseCard />` 是两个使用位置，以后即使使用相同函数，也可以各自拥有状态。不要写 `CaseCard()` 手动调用组件来拼页面，应通过 JSX 让 React 管理它。

组件不是“每个标签都拆一个函数”。遇到可以独立命名的界面职责、重复结构或需要单独理解的交互时再拆。案例库可以分为筛选区、列表、卡片；一段只出现一次的短提示可以留在父组件。

组件定义放在模块顶层，不要把 `function CaseCard()` 放进 `CasesPage()` 内部；后者会在父组件每次执行时产生新组件类型，可能使子组件状态重置。组件内部定义事件处理函数则很常见，两者要区分。

阅读对照：[React：Your First Component](https://react.dev/learn/your-first-component)；本地 FSO Part 1a 的“组件”“多个组件”。

## 4. JSX：看起来像 HTML，但写在 JavaScript 中

```jsx
function Intro({ title, count }) {
  return (
    <>
      <h2 className="heading">{title}</h2>
      <label htmlFor="keyword">关键词</label>
      <input id="keyword" />
      <p style={{ color: '#184e77' }}>共 {count} 条</p>
    </>
  );
}
```

| 写法 | 含义与原因 |
|---|---|
| 单个根节点或 `<>...</>` | 一次返回一个表达式；Fragment 不增加多余 DOM 包装 |
| `<input />` | JSX 标签必须闭合，包括没有子内容的标签 |
| `className`、`htmlFor` | 对应 HTML 的 class、for；`aria-*` 与 `data-*` 保留连字符 |
| `{title}`、`{count + 1}` | 花括号内是 JavaScript 表达式，不是字符串插值模板 |
| `style={{ color: 'red' }}` | 外层括号进入 JS，内层是对象；本课布局优先普通 CSS |
| `{condition ? <A /> : <B />}` | 条件渲染；不能直接在括号中写 `if` 语句 |

普通对象不能直接当文本节点渲染：`<p>{item}</p>` 错，应取 `<p>{item.title}</p>`；调试时可写 `<pre>{JSON.stringify(item, null, 2)}</pre>`。`false`、`null`、`undefined` 通常不显示，但数字 `0` 会显示，所以避免用 `{items.length && <List />}`，改成 `{items.length > 0 && <List />}`。

JSX 中的文本插值会作为文本处理，不会把案例标题中的 HTML 字符串执行成标签。不要为了显示标题引入 `dangerouslySetInnerHTML`。

练习：将上面的 `Intro` 加到阶段一页面中，传入标题与案例数量；故意去掉一个闭合标签，观察终端与浏览器报错的文件名和行号，然后修复。阅读：[Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx)。

## 5. props：父组件向子组件提供输入

静态卡片重复了结构，也重复了文字。把会变化的部分提取成 props：

```jsx
function CaseCard({ item, compact = false }) {
  return (
    <article>
      <h2>{item.title}</h2>
      {!compact && <p>行业代码：{item.industry}</p>}
    </article>
  );
}

function CasesPage() {
  const item = { id: 'case-001', title: '链路中断', industry: 'telecom' };
  return <CaseCard item={item} compact={false} />;
}
```

父组件通过 JSX 属性传值；子组件收到一个 props 对象。参数里的 `{ item, compact = false }` 只是对象解构。默认值在未传或传入 `undefined` 时生效，不会覆盖明确传入的 `false` 或 `null`。

props 可以传字符串、数字、对象、数组、布尔值、函数乃至 JSX。`compact="false"` 传的是非空字符串，会被当作真值；传布尔值应用 `compact={false}`。标签包裹的内容通过 `children` 进入组件，例如 `function Panel({ children }) { return <section>{children}</section>; }` 可用于 `<Panel><p>说明</p></Panel>`。

**props 是只读输入**。子组件不能通过 `item.title = '新标题'` 改父组件的数据，也不应修改传入数组。需要变化时由拥有这份状态的组件提供更新方式。只读并不意味着数据永远不变：父组件下一次可以传来不同 props。

检查点：同一个卡片组件展示“链路中断”和“订单延迟”，应修改传入数据，不应复制两套卡片组件。阅读：[Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)。

## 6. 列表与条件渲染：从一张卡片到案例库

阶段一 `StaticPage.jsx` 把案例数组映射成元素：

```jsx
<ul>
  {initialCases.map(item => <StaticCard key={item.id} item={item} />)}
</ul>
```

`map` 对每条数据返回一个元素，花括号把元素数组嵌入界面；它并不修改原数组。用于过滤的 `filter` 同样返回新数组。注意 `key` 写在 `map` 直接返回的元素上，而不是藏在 `StaticCard` 内部的 `<li>` 上。

`key` 帮 React 区分相邻项的身份，尤其在插入、删除、排序时。案例的稳定 `id` 合适；随机数会让身份每次都变化；数组索引在可增删或重排列表中容易把输入值等局部状态关联到错误项目。完全静态且顺序不变的列表风险不同，但本课程统一使用业务 id。key 只需在同级列表内唯一，也不会自动作为 `props.key` 传入；组件需要 id 时应读取 `item.id` 或另传属性。

空列表应明确显示：

```jsx
function CaseList({ items }) {
  if (items.length === 0) return <p>没有匹配的案例</p>;
  return <ul>{items.map(item => <li key={item.id}>{item.title}</li>)}</ul>;
}
```

检查点：先预测空数组、一个元素、顺序交换后的输出，再实际修改阶段一的数据观察。稳定 key 的主要收益是保留正确身份，不只是消除控制台警告。阅读：[Rendering Lists](https://react.dev/learn/rendering-lists) 与 FSO Part 2a“渲染集合”“key属性”。

## 7. 事件与 state：让组件记住用户操作

### 7.1 把函数交给事件，而不是立即执行

```jsx
function ExplainButton() {
  function handleClick() { console.log('现在才处理点击'); }
  return <button type="button" onClick={handleClick}>查看说明</button>;
}
```

`onClick={handleClick}` 传入函数；`onClick={handleClick()}` 会在渲染时调用函数。需要传参数时使用包装函数：`onClick={() => onToggleFavorite(item.id)}`。组件自定义的回调可以命名为 `onToggleFavorite`，最终绑定到浏览器按钮时仍用 `onClick`。

表单提交用 `onSubmit`，处理函数中按需要调用 `event.preventDefault()` 阻止默认页面导航；这与 `stopPropagation()` 阻止事件继续传播是不同事情。普通操作按钮写 `type="button"`，避免放进表单后意外变为提交按钮。[Responding to Events](https://react.dev/learn/responding-to-events) 有对应练习。

### 7.2 为什么 `let count = 0` 不够

普通局部变量在组件再次调用时会重新初始化；改变它也不会通知 React 更新屏幕。state 同时提供跨渲染的记忆与请求渲染的更新函数：

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button type="button" onClick={() => setCount(count + 1)}>
    已点击 {count} 次
  </button>;
}
```

`useState(0)` 中的0是初始值，不是每次渲染都重置为0。返回数组中的第一项是本次渲染读取的值，第二项是 setter。调用 setter 安排更新；React 再次执行组件并给它新的值。同一组件类型在页面不同位置的实例通常各有自己的 state；移除组件再重新挂载会重新初始化。

| 比较 | props | state |
|---|---|---|
| 谁提供 | 父组件 | 当前组件通过 Hook 管理 |
| 如何使用 | 读取当前输入 | 读取当前交互记忆 |
| 如何改变 | 父组件传入新值 | 调用 setter 请求更新 |
| 能否直接赋值修改 | 不应修改 | 不应直接修改对象/数组；使用 setter |

阅读 FSO Part 1c“带状态的组件”“状态的改变会导致重新渲染”与 [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)。

### 7.3 状态快照与函数式更新

```jsx
// 在一次点击的同一个处理函数内，count 都是本次渲染的快照。
function addThreeWrong() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}
function addThree() {
  setCount(previous => previous + 1);
  setCount(previous => previous + 1);
  setCount(previous => previous + 1);
}
```

把它们放入上面的 `Counter` 内并分别绑定两个按钮。若当前 count 是0，第一种提交三次“设为1”，最终为1；第二种提交三个基于前值的计算，依次得到1、2、3。不要把 setter 理解为立即改写当前局部变量，也不要用 `await setCount(...)` 等待渲染，它不返回这种 Promise。

同一个处理函数里 `setCount(count + 1); console.log(count);` 仍打印旧快照。这不是 setter 失效。计时器等回调也可能捕获建立回调时的值；需要基于最新待处理值累加时使用函数式更新。更新函数应只计算并返回值，不在里面发请求、写日志作为业务动作或修改外部数据。

阅读：[State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)、[Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)。

## 8. 受控输入与最小状态：完成标题搜索

阶段二的核心文件可完整写成：

```jsx
import { useState } from 'react';
import { initialCases } from './model.js';

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const visible = initialCases.filter(item => item.title.includes(keyword.trim()));
  return (
    <section>
      <h2>案例搜索</h2>
      <label>标题关键词
        <input value={keyword} onChange={event => setKeyword(event.target.value)} />
      </label>
      <p role="status">找到 {visible.length} 条案例</p>
      {visible.length === 0 ? <p>没有匹配的案例</p> :
        <ul>{visible.map(item => <li key={item.id}>{item.title}</li>)}</ul>}
    </section>
  );
}
```

输入框的显示值由 `value={keyword}` 决定，变化通过 `onChange` 写回状态，所以叫“受控输入”。完整链路是：用户输入 → 浏览器产生事件 → 读取 `event.target.value` → setter 请求更新 → 新 keyword 参与过滤 → 输入框、列表、数量一起显示新结果。

只写 `value` 而没有有效的更新处理，输入框就会看起来“不能打字”。文本状态从 `''` 开始，避免开始是 `undefined`、后来才有字符串导致受控模式切换。`defaultValue` 只提供非受控输入的初始值，不等同于持续受 state 控制的 `value`。

| 控件 | 显示所用属性 | 事件中读取 |
|---|---|---|
| 文本 input | `value={keyword}` | `event.target.value`，字符串 |
| select | `value={industry}` | `event.target.value`，选项的值 |
| checkbox | `checked={onlyFavorites}` | `event.target.checked`，布尔值 |

输入数字时 `event.target.value` 仍通常是字符串，需要根据空值和业务规则显式转换。不要对复选框用 `value` 判断是否勾选。详见 [React input 参考：受控输入](https://react.dev/reference/react-dom/components/input)。

**只存不能由现有输入推导的最小状态。** `keyword` 是用户选择，需要记住；`visible` 可以由数据与 keyword 算出，不另设 state；结果数量直接用 `visible.length`。否则每次修改条件都要同步维护关键词、结果数组和数量，容易出现三者不一致。

这里不需要 `useEffect(() => setVisible(...))`。筛选是当前渲染的普通计算，不是与外部系统同步。第7讲再讨论网络请求和 Effect 的生命周期。阅读 [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)。

检查点：输入“链路”得到1条，输入“不存在”得到0条，删除关键词恢复3条。此阶段匹配区分英文字母大小写；阶段三将统一转成小写。

## 9. 状态提升与单向数据流：筛选区如何控制列表

### 9.1 先确定状态的拥有者

现在增加行业与收藏。筛选区需要输入值，列表需要筛选结果，统计区需要总数；如果各自保存一份，会难以同步。把它们共同使用的状态放到最近的共同祖先 `CasesPage` 中。

```text
CasesPage：拥有 keyword、industry、onlyFavorites、favoriteIds
  ├─ FilterBar：收到当前筛选值与更新回调
  ├─ 统计段落：读取 visible.length、favoriteIds.length
  └─ CaseList：收到 visible、favoriteIds、收藏回调
       └─ CaseCard：收到 item、isFavorite、收藏回调

数据 / 回调函数作为 props：父 → 子
用户操作：子调用收到的回调 → 状态拥有者决定更新 → 新 props 向下传
```

“事件向上通知”是描述调用关系，不是子组件直接写父组件内存，也不是把 React 变成双向数据绑定。回调函数本身仍是父向子传递的 props。`onToggleFavorite(id)` 是本例自定义函数调用，和浏览器事件冒泡不是同一个机制。

### 9.2 从一个输入框理解受控子组件

```jsx
function KeywordInput({ value, onValueChange }) {
  return <label>关键词
    <input value={value} onChange={event => onValueChange(event.target.value)} />
  </label>;
}
function CasesPage() {
  const [keyword, setKeyword] = useState('');
  return <KeywordInput value={keyword} onValueChange={setKeyword} />;
}
```

子组件只把字符串传给回调，不必让父组件知道输入事件对象的结构。不要在子组件再写 `const [localKeyword, setLocalKeyword] = useState(value)` 来镜像父值：这个初始值不会随着后来的 props 自动重新初始化，而且产生了两个数据来源。只有确实需要独立编辑草稿等业务语义时才另行设计局部状态。

### 9.3 收藏：两个兄弟区域共享一个事实

父组件保存收藏 id，列表根据它决定按钮文字，上方统计用它计算数量：

```jsx
const [favoriteIds, setFavoriteIds] = useState([]);
function handleToggleFavorite(id) {
  setFavoriteIds(previous =>
    previous.includes(id)
      ? previous.filter(value => value !== id)
      : [...previous, id]
  );
}
// 父组件 JSX 中传递：
<CaseList items={visible} favoriteIds={favoriteIds}
  onToggleFavorite={handleToggleFavorite} />
```

卡片只接收事实与意图接口：

```jsx
function CaseCard({ item, isFavorite, onToggleFavorite }) {
  return <li>
    <h3>{item.title}</h3>
    <button type="button" aria-pressed={isFavorite}
      onClick={() => onToggleFavorite(item.id)}>
      {isFavorite ? '取消收藏' : '收藏'}
    </button>
  </li>;
}
```

按顺序口述一次点击：初始 `favoriteIds=[]` → 卡片收到 `isFavorite=false` → 点击把 `case-001` 交给回调 → 父组件 setter 根据前值产生新数组 → 重新计算 props → 同一张卡片显示取消收藏、统计显示1。无须操作 DOM，也无须卡片另存一份 `isFavorite`。

为什么不把收藏放在每张卡片的局部 state？局部状态适合只有卡片关心的展开细节，但本例还有跨卡片统计与“只看收藏”筛选，所以共同祖先需要这份数据。也不必把所有输入都提升到整个网站根组件，状态离真正使用它的组件尽可能近即可。[Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) 与 [Thinking in React](https://react.dev/learn/thinking-in-react) 可用于复盘这一设计过程。

### 9.4 三个条件组合与清空行为

完整示例在 `model.js` 中集中计算：

```js
export function filterCases(items, keyword, industry, onlyFavorites, favoriteIds) {
  const query = keyword.trim().toLowerCase();
  return items.filter(item =>
    item.title.toLowerCase().includes(query) &&
    (industry === 'all' || item.industry === industry) &&
    (!onlyFavorites || favoriteIds.includes(item.id))
  );
}
```

三组条件用 `&&` 连接，表示同时满足；行业内部的 `||` 表示“全部行业”或“恰好匹配”。`!onlyFavorites` 为真时，不要求出现在收藏数组中。先用纸笔算一遍，再运行：仅收藏“链路中断”，关键词为空，行业为通信，只看收藏开启，结果应为1。

“清空筛选”重置 keyword、industry、onlyFavorites，**保留收藏**。它没有叫“清空收藏”，不能顺便删除用户收藏。勾选“只看收藏”后取消最后一条收藏，卡片会消失并显示空态，这是筛选规则的结果。完整组件及标签、按钮无障碍属性见 [App.jsx](labs/react-basics/src/App.jsx)，纯计算见 [model.js](labs/react-basics/src/model.js)。

## 10. 不可变更新：增加、删除、编辑（课后巩固）

若以后允许修改案例数据，将它放入 state：`const [items, setItems] = useState(initialCases)`。此时应把筛选函数输入也改为 items。以下是独立更新范式，不是当前静态数据示例已经实现的功能。

```jsx
// newItem 在新增事件中创建；id 只创建一次，不在渲染时随机生成。
setItems(previous => [...previous, newItem]);
// 删除指定 id。
setItems(previous => previous.filter(item => item.id !== targetId));
// 更新一条记录：新数组 + 被修改记录的新对象。
setItems(previous => previous.map(item =>
  item.id === targetId ? { ...item, title: newTitle } : item
));
```

不要用 `items.push(...)`、直接 `items[0].title = ...` 后把同一个数组传回 setter。`sort()` 和 `reverse()` 会修改原数组，排序可写 `[...items].sort(...)`。展开语法是浅复制：`const next = [...items]` 只复制数组，不会复制里面每个对象；修改某条对象仍要创建那条对象的新副本。

嵌套结构要复制发生变化路径上的各层：

```jsx
setProfile(previous => ({
  ...previous,
  preferences: { ...previous.preferences, theme: 'dark' }
}));
```

无需为了“不变”而把所有数据都 JSON 深拷贝。理解引用与更新路径更重要。阅读 FSO Part 1d“复杂状态”“处理数组”和 [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)。

## 11. Hook、渲染与调试边界

`useState` 是 Hook。基础规则：在函数组件或自定义 Hook 顶层调用，不放进条件、循环、事件处理函数或可能跳过它的提前 return 后面。React 依赖稳定调用顺序关联状态；条件可以决定显示什么，但不要决定这次是否调用 Hook。

渲染阶段应根据 props/state 计算界面，不无条件调用 setter、不发起请求、不修改外部数组。事件处理函数可响应明确的用户操作。配套入口开启 `StrictMode`，开发环境可能额外调用组件与更新计算来检查不纯逻辑；这不表示用户真的点击了两次，也不代表生产环境必然重复执行同样次数。不要靠关闭检查来掩盖数据被修改的问题。

| 现象 | 先检查 | 修改方向 |
|---|---|---|
| JSX 编译失败 | 标签闭合、根节点、箭头块体是否 return | 先看报错的文件与行号 |
| 点击前动作就执行 | `onClick={handle()}` | 传函数，带参数时包装箭头函数 |
| 输入框打不了字 | value 是否绑定；onChange 是否调用 setter | 建立读取和写回的完整链路 |
| Too many re-renders | 是否在渲染中无条件 setState | 移到事件或重新设计派生计算 |
| 收藏统计不跟着变 | 是否在子组件另存一份状态 | 找到共同祖先，统一状态来源 |
| 删除后输入串到别条记录 | 是否用索引或随机 key | 使用稳定业务 id |
| setter 后日志仍旧值 | 是否期待当前快照立即改变 | 理解下一次渲染与函数式更新 |
| map 有数据却没输出 | 花括号函数是否缺 return | 修正返回值，不急着改 CSS |

调试顺序：确认事件触发 → 查看事件读出的值 → 确认状态拥有者与 setter → 检查过滤计算 → 检查 props 与渲染条件。先定位链路上哪一步错误，再求助 AI。要求 AI 给出最小修改和可复现验收步骤，自己仍要能解释数据流。

## 自检与参考答案

先自己回答，再展开；能运行并不等于理解。

<details>
<summary>1. props 和 state 有什么不同？父组件传来对象后，子组件能改它吗？</summary>
<p>props 是父组件提供的只读输入，state 是当前组件管理的交互记忆。子组件不能直接修改传入对象；通过回调表达修改意图，由拥有者创建新值并更新。</p>
</details>

<details>
<summary>2. 为什么搜索词要存 state，过滤结果和结果数量通常不用？</summary>
<p>搜索词无法由现有数据推出；结果可由案例数组和条件计算，数量可由结果数组计算。重复存储会增加同步错误，本例无需 Effect 来维护它们。</p>
</details>

<details>
<summary>3. 当前 count=2，一次事件中三次 setCount(count+1) 和三次函数式加1分别得到多少？</summary>
<p>前者为3，因为都读取同一快照2；后者为5，因为每个更新函数接收队列前一步的结果。</p>
</details>

<details>
<summary>4. 复选框应读取 value 还是 checked？为什么不能在 JSX 写 onClick={toggle(id)}？</summary>
<p>读取 checked 得到布尔值。后者会在渲染时调用 toggle；应传入 () => toggle(id)，等点击时执行。</p>
</details>

<details>
<summary>5. 收藏状态为什么放在 CasesPage？回调向上通知是否破坏单向数据流？</summary>
<p>筛选区、列表和统计共同依赖它，CasesPage 是最近共同祖先。父组件向下传值和回调，子组件调用回调，拥有者更新后再向下传新值；子组件没有直接写父状态。</p>
</details>

<details>
<summary>6. const next=[...items]; next[0].title='新标题' 是否安全？</summary>
<p>不安全。新旧数组的第一个对象仍是同一引用。应使用 map 并为目标对象创建 {...item, title:'新标题'}。</p>
</details>

<details>
<summary>7. 随机 key 和在父组件内部定义子组件可能带来什么问题？</summary>
<p>前者不断改变列表项身份，后者产生新的组件类型，都可能造成卸载重建与局部状态丢失。组件定义放模块顶层，key 使用稳定 id。</p>
</details>

<details>
<summary>8. 只看收藏时取消最后一条，空列表是否是 bug？清空筛选是否应清空收藏？</summary>
<p>前者符合规则，应显示清晰空态；后者不应清空收藏，因为筛选条件与收藏数据是不同事实。</p>
</details>

## 阅读定位

本讲采用 FSO 的渐进练习思路，并用课程案例库重新编写示例。不要按链接数量平均分配时间：先完成必读，再按错误类型查阅官方文档。中文离线全文已存在于同级目录，无须重新下载。

| 优先级与建议时间 | 教程与准确定位 | 与本讲对应 | 阅读后产出 |
|---|---|---|---|
| ★★★★★ 必读，15分钟 | [FSO Part 1a：React简介](https://fullstackopen.com/zh/part1/react%E7%AE%80%E4%BB%8B)，本地 `markdown/part1a.md`：“组件”“JSX”“props：向组件传递数据” | 第3–5节 | 用自己的话解释一张卡片如何复用 |
| ★★★★★ 必读，20分钟 | [FSO Part 1c：组件状态、事件处理](https://fullstackopen.com/zh/part1/%E7%BB%84%E4%BB%B6%E7%8A%B6%E6%80%81%EF%BC%8C%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86)，本地 `markdown/part1c.md`：“带状态的组件”“事件处理函数是一个函数”“向子组件传递状态” | 第7、9节 | 画出收藏按钮到统计数量的调用链 |
| ★★★★★ 必读，15分钟 | [FSO Part 2b：表单](https://fullstackopen.com/zh/part2/%E8%A1%A8%E5%8D%95)，本地 `markdown/part2b.md`：“受控组件”“筛选展示的元素” | 第8节 | 写出受控输入的显示值与更新入口 |
| ★★★★☆ 巩固，15分钟 | FSO Part 2a，本地 `markdown/part2a.md`：“渲染集合”“key属性”“重构模块” | 第6节 | 说明删除/排序时稳定身份的重要性 |
| ★★★★☆ 巩固，20分钟 | FSO Part 1d，本地 `markdown/part1d.md`：“复杂状态”“处理数组”“Hook的规则”“不要在组件中定义组件” | 第10–11节 | 修复一个直接修改数组的错误 |
| 按需补基础，20分钟 | FSO Part 1b，本地 `markdown/part1b.md`：“数组”“对象”“函数” | 第2节 | 独立写 map、filter 和对象复制 |
| ★★★★★ 设计复盘，15分钟 | [React：Thinking in React](https://react.dev/learn/thinking-in-react) | 第8–9节 | 列出最小状态及其拥有者 |

阅读旧材料时注意区分“用于解释过程的中间版本”与“推荐实现”：FSO Part 1c 曾用渲染期间设置定时器演示状态变化，本课程不采用这种写法；入口只创建一次 root，交互更新使用 setter，计时器与外部同步的清理留到第7讲。

上表时间是课前或课后阅读建议，不额外计入32学时。FSO 的原始练习还涵盖课程信息、反馈统计、轶事等，可选择其中一组迁移本讲知识；不要求本课同时完成整个 FSO Part 1–2。遇到 class 组件旧写法、深入 this 或更复杂工具链，可暂缓，不影响本讲函数组件主线。

本机离线阅读：另开终端，启动已有资料目录。

```bash
# 在新终端中，从 ai-native-web-dev-course 仓库根目录执行
cd ../fullstackopen-zh-offline
python3 -m http.server 8765 --bind 127.0.0.1
```

随后打开 [离线 Part 1a](http://127.0.0.1:8765/#/part/1/a)、[离线 Part 1c](http://127.0.0.1:8765/#/part/1/c)、[离线 Part 1d](http://127.0.0.1:8765/#/part/1/d)、[离线 Part 2a](http://127.0.0.1:8765/#/part/2/a)、[离线 Part 2b](http://127.0.0.1:8765/#/part/2/b)。这些 localhost 链接只在本机资料服务启动后有效；端口被占用时更换端口并同步调整访问地址。也可直接用编辑器阅读上表 Markdown 文件。

来源与版权：Full Stack Open / University of Helsinki，沿用离线材料注明的 CC BY-NC-SA 3.0 及原署名；React 官方文档用于概念核对与延伸阅读，本讲不镜像其全文。案例代码为本课程编写，依赖许可证分别适用。详见仓库 SOURCES.md。下一步进入[课堂练习](#/part/4/b)，用验收表证明自己能够修改应用。
