# React 官方教程与状态设计练习

## 这节解决什么问题

完成主讲义的组件、props、state 和单向数据流后，再用官方教程检验自己的理解。本节不是新的必修学时：基础薄弱者课前选读入门路线，已经完成案例库者课后选做状态设计路线。所有练习沿用案例库，不额外要求完成多个大型项目。

React、Next.js 与 Ant Design 的关系先用一句话定位：React 描述组件和交互，Next.js 组织 React 应用的页面与服务端执行，Ant Design 提供可复用的 React 界面组件。使用后两者时，props 只读、状态拥有者和派生数据这些原则仍然适用。

## 入门：先认识 React 的几个基本概念

### React 是什么，为什么要学它

在花艺瓶和打字游戏中，我们直接查找 DOM 元素，再修改文字、样式和位置。页面变复杂后，一个动作可能需要同时修改列表、计数和按钮。React 让我们先描述“当前数据应该显示成什么界面”，再用状态更新驱动显示变化。它是 JavaScript 界面库，学习时仍然要使用 HTML 的结构知识、CSS 的样式知识和 JavaScript 的函数与数组知识。

“声明式”指描述结果：收藏为真时显示“取消收藏”，否则显示“收藏”。“命令式”则逐步指挥 DOM 如何改变。两种方式都能完成任务，本课学习 React 是为了在多个组件协作时清楚管理数据来源。

### 术语与代码对应表

| 术语 | 初学者可以怎样理解 | 本课程中的例子 |
|---|---|---|
| 组件 Component | 一段有名字、可复用的界面逻辑 | CaseCard 表示一张案例卡片 |
| JSX | 在 JavaScript 中描述界面的语法，需工具编译 | `<h2>{title}</h2>` |
| props | 父组件交给子组件的只读输入 | `title="链路中断"` |
| state | 组件需要记住、会影响显示的数据 | 是否收藏、当前关键词 |
| Hook | 组件中调用 React 功能的函数 | useState 用于保存状态 |
| 事件处理函数 | 用户操作发生后执行的函数 | handleToggle 响应点击 |
| 渲染 Render | 执行组件，计算本次界面描述 | 状态变化后再次执行组件 |
| 提交 Commit | 把需要的变化应用到 DOM | 按钮文字由收藏变为取消收藏 |

注意渲染与浏览器整页刷新不同；也不要把每次组件执行等同于每个 DOM 节点重新创建。React DOM 是 React 面向浏览器的渲染器；本课基础实验在入口用 createRoot 挂载组件，Next.js 工程则由框架组织入口。

### 第一个完整组件：收藏按钮

在自己的 `labs/react-basics` 实验副本中，新建 `src/FavoriteIntro.jsx`，写入下面的完整文件：

```jsx
import { useState } from 'react';

function FavoriteButton({ title }) {
  const [saved, setSaved] = useState(false);
  function handleToggle() {
    setSaved(previous => !previous);
  }
  return (
    <button type="button" aria-pressed={saved} onClick={handleToggle}>
      {saved ? '取消收藏' : '收藏'}：{title}
    </button>
  );
}

export default function FavoriteIntro() {
  return <section>
    <h2>两个独立的收藏按钮</h2>
    <FavoriteButton title="链路中断" />
    <FavoriteButton title="订单延迟" />
  </section>;
}
```

在副本的 `src/main.jsx` 中导入 `FavoriteIntro`，将底部根渲染里的 `<Tutorial />` 临时换为 `<FavoriteIntro />`，保留外层 StrictMode；按原实验说明运行。不要将这个文件直接拖入浏览器，浏览器需要的是编译后的 JavaScript。

逐行理解：import 引入 Hook；大写函数名表示组件；解构参数读取 title；useState 返回当前值和更新函数；回调根据前值计算新值；三元表达式根据 saved 选择文字。onClick 接收函数本身，不能写成 `onClick={handleToggle()}` 在渲染时提前执行。

点击第一项，第二项不会跟着变，因为这是同一组件的两个独立实例。若增加“总收藏数”，就需要把收藏数据提升到共同父组件，再向两个按钮传入当前值与回调。这就是从局部 state 过渡到共享状态的实际动机。

### 从能看懂到能自己写

1. 改传入的 title，确认复用的是组件结构，变化的是 props。
2. 预测连续点击两次后的状态，再操作验证。
3. 加一段文字显示 saved 的含义，确认它与按钮同步变化。
4. 思考刷新为什么丢失状态：目前只有内存，没有存储。

JSX 基本规则：标签闭合、返回一个根或 Fragment、表达式放在花括号里、CSS 类写 className。组件只负责描述界面，不能直接修改 props。调用 useState 要放在组件顶层，不能藏进点击处理函数。这些规则的系统展开与列表、表单练习见[React 主讲义](#/part/4)。

入门自检：能指出上例中的 props、state 和事件函数，并说明一次点击如何改变界面，再继续后面的状态设计练习。官方对照：[React Quick Start](https://react.dev/learn)。

## 1. 官方教程怎么读

| 级别 | 官方材料 | 目标与产出 | 建议用时 |
|---|---|---|---|
| ★★★★★ 基础 | [React Learn](https://react.dev/learn) / [中文入口](https://zh-hans.react.dev/learn) | 查漏补缺：组件、事件、列表、state；画出案例库组件树 | 20分钟 |
| ★★★★★ 基础 | [Thinking in React](https://react.dev/learn/thinking-in-react) | 对照静态界面→最小状态→状态拥有者的方法，给案例库列状态表 | 20分钟 |
| ★★★★★ 基础 | [Next.js React Foundations](https://nextjs.org/learn/react-foundations) | 从 DOM、JSX、组件、props、state 过渡到 Next.js；解释框架新增了什么 | 分两次，每次20分钟 |
| ★★★★★ 巩固 | 已下载的 FSO Part 1c、1d、2a、2b | 回看事件、复杂状态、列表和表单；准确定位见[主讲义](#/part/4) | 按难点选读 |
| ★★★★☆ 巩固 | [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) | 消除重复状态；用 id 表示选中的案例 | 15分钟 |
| ★★★★☆ 巩固 | [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) | 解释组件位置、类型和 key 与状态保留的关系 | 15分钟 |
| ★★★☆☆ 衔接第7讲 | [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) | 区分用户事件与外部同步，理解清理函数 | 20分钟 |

阅读步骤统一为“预测—运行—改动—解释”：先预测例子输出，再运行；只改一个条件，再说明行为为什么变化。不要只看答案和截图。FSO 离线全文继续复用同级资料库，React/Next.js 官方文档链接需要联网。

## 2. 案例练习：选择记录时存对象还是 id

假设界面左侧显示案例列表，右侧显示选中案例的详情。初稿把 `items` 和 `selectedItem` 都存入 state。当列表中的案例被改名时，selectedItem 仍可能指向旧对象，导致两边标题不一致。

本课程的改写是保存选择事实 `selectedId`，每次渲染从 items 找到对应对象：

```jsx
const [items, setItems] = useState(initialCases);
const [selectedId, setSelectedId] = useState(null);
const selectedItem = items.find(item => item.id === selectedId) ?? null;

function renameCase(id, title) {
  setItems(previous => previous.map(item =>
    item.id === id ? { ...item, title } : item
  ));
}
```

这段放在函数组件内部，文件顶部导入 useState 与初始数据。按钮调用 `setSelectedId(item.id)`，详情区根据 selectedItem 是否存在显示内容。若记录被删除，查找返回 null，界面应显示“请选择案例”或“案例已删除”，而不是读取空值的 title。

| 字段 | 是否需要 state | 本例理由 |
|---|---|---|
| items | 是（允许编辑时） | 用户可以改变已保存记录 |
| selectedId | 是 | 记录用户选了哪一条 |
| selectedItem | 否 | 可由 items 和 selectedId 推导 |
| visibleCount | 否 | 等于可见数组长度 |
| draftTitle | 视业务而定 | 若编辑前可取消，它与已保存标题是不同事实 |

验收：选择一条→修改标题→详情同步变化；删除选中记录→显示合理空态。截图之外，提交状态表，并指出每个 setter 所在组件。

## 3. 编辑草稿为什么可以有自己的状态

“不要复制 props 到 state”不是说任何草稿都不合法。编辑中的标题和已经保存的标题具有不同含义：用户可能取消修改。

```jsx
function TitleEditor({ item, onSave }) {
  const [draft, setDraft] = useState(item.title);
  return <form onSubmit={event => {
    event.preventDefault();
    const title = draft.trim();
    if (title) onSave(item.id, title);
  }}>
    <label>编辑标题<input value={draft} onChange={event => setDraft(event.target.value)} /></label>
    <button type="submit">保存</button>
  </form>;
}
// 父组件中，仅在 selectedItem 存在时显示：
// <TitleEditor key={selectedItem.id} item={selectedItem} onSave={renameCase} />
```

本例规定切换记录就丢弃未保存草稿，因此用记录 id 作为编辑器 key，切换时初始化新草稿。若需求是保留每条记录的草稿，就应按 id 在上层保存草稿；不能同时声称“切换重置”和“切换保留”。同一个 id 的外部数据更新也不会自动重置上面的 draft，实际产品应另行决定提示冲突还是重载。

检查点：输入未保存标题后切到另一条，再切回来，看到的是已保存标题。说明这次 key 的目的与普通列表 key 有何联系。

## 4. 事件、派生计算和 Effect 分别放什么

| 行为 | 本课程放置位置 | 原因 |
|---|---|---|
| 点击收藏 | 事件处理函数 | 由一次明确用户操作触发 |
| 按关键词过滤 | 渲染中的纯计算 | 由当前输入即可算出 |
| 读取 API 并处理旧请求 | 第7讲的 Effect 或框架数据层 | 与组件外部服务同步，需要生命周期设计 |
| 卸载后停止订阅/计时器 | Effect 清理 | 防止旧任务继续作用于已失效界面 |

不要把提交新增案例放进“监视 items 的 Effect”：初始化、重渲染或恢复页面都不等同于用户提交。也不要以关闭 StrictMode 作为重复执行问题的解决方案。先明确哪个操作是用户意图，哪个只是根据数据计算。

## 自检

<details><summary>选中对象和列表对象同时存在，是否一定错误？</summary><p>不一定。独立历史快照、草稿等可能有业务意义；本例只是选择当前记录，应使用 id 避免冗余副本。必须说明两份数据各自代表什么。</p></details>

<details><summary>更换 key 为什么能重置草稿？能否每次渲染都用随机 key？</summary><p>key 改变会让 React 重新识别组件实例。随机 key 会不断卸载重建，输入与焦点可能丢失。应使用真正对应业务身份的值。</p></details>

下一步：[Next.js：路由与服务端/客户端边界](#/part/4/e)。若还无法解释 state 与 props，先完成原案例库，不急于引入框架。


## 进阶衔接：用中文说清状态如何流动

技术术语应先说明含义，再保留代码中的英文名称。不要把“单向数据流”写成“单向数据流”；“单向”描述数据传递的方向。

| 术语 | 本课程的表述与含义 | 案例中的位置 |
|---|---|---|
| component | 组件：根据输入描述界面的可复用单元 | CaseEditor |
| props | 组件属性：父组件传入的数据与回调 | initialItems |
| state | 状态：组件需要记住、修改后会触发重新渲染的数据 | items、keyword |
| render | 渲染：React 根据当前输入计算界面描述 | 函数组件执行 |
| event handler | 事件处理函数：响应点击、输入或提交 | save |
| controlled input | 受控输入：显示值由状态决定，输入事件更新状态 | 标题筛选框 |
| derived value | 派生值：能由已有数据计算出的结果 | visible、待处理数量 |
| state updater | 状态更新函数：请求 React 使用新状态重新渲染 | setItems |
| Effect | 副作用；本节特指组件与外部系统的同步逻辑 | 请求 HTTP 接口 |
| race condition | 竞态条件：多个异步操作完成顺序不同，导致结果相互覆盖 | 旧查询晚于新查询返回 |

### 从编辑工作台理解“状态放在哪里”

打开配套实验的 `/workbench`，同时阅读 [CaseEditor.jsx](labs/next-antd-basics/components/CaseEditor.jsx)。页面组件提供初始数组，CaseEditor 保存已提交记录，Form 保存尚未提交的草稿，Table 接收计算后的列表。组件属性向下传递，用户操作通过回调通知拥有状态的组件，再由该组件更新状态。这就是单向数据流。

| 数据 | 保存位置 | 更新时机 |
|---|---|---|
| 已提交记录 items | CaseEditor 的状态 | 保存或确认删除 |
| 查询条件 keyword、status | CaseEditor 的状态 | 输入或选择 |
| 草稿 title、summary 等 | Form 的表单数据 | 编辑字段 |
| 匹配结果 visible | 每次渲染直接计算 | 不单独保存 |
| 正在编辑的记录身份 editing | CaseEditor 的状态 | 打开或关闭编辑面板 |

不要用一个 Effect 把 visible 再复制到状态中。这会产生两份需要同步的数据，还增加一次更新。也不要在输入标题时直接修改 items 中的记录，否则“取消编辑”就无法放弃草稿。

```jsx
// 不可变更新：保留其他记录，只替换目标记录。
setItems(previous => previous.map(item =>
  item.id === saved.id ? saved : item
));
// 删除也产生新数组，不能对原数组直接 splice。
setItems(previous => previous.filter(item => item.id !== removedId));
```

以上是理解更新方式的独立片段；完整示例通过 saveRecord 集中检查字段并返回新数组。setItems 不会立即修改当前事件处理函数捕获的 items：本次渲染中的状态是一份快照。连续依赖上一次结果的更新应采用函数式更新，不能把多个 `setCount(count + 1)` 当成逐次累加。

### 什么时候需要 Effect

筛选、计数和排序属于计算；保存按钮引发的数据更新属于事件处理；两者通常不需要 Effect。`/remote` 则需要让当前查询条件与 HTTP 请求保持同步，因此使用 useEffect，并在条件变化或组件卸载时取消旧请求。Effect 的依赖项是同步逻辑读取的响应式值，不是为了“只执行一次”可以任意删掉的清单。

练习：在开发者工具中启用网络限速，先查“DNS”，再查“订单”。即使旧请求较晚结束，也只能展示当前查询结果。检查 RemoteCases.jsx 中 AbortController 与 active 标记分别承担什么责任：前者请求取消网络操作，后者阻止已经失效的异步回调写入状态。

官方阅读：★★★★★ [选择状态结构](https://zh-hans.react.dev/learn/choosing-the-state-structure)、[在组件间共享状态](https://zh-hans.react.dev/learn/sharing-state-between-components)；★★★★☆ [你可能不需要 Effect](https://zh-hans.react.dev/learn/you-might-not-need-an-effect)。先画出数据所有者，再写组件。
