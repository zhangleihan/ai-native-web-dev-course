# 组件、props、state 与列表的 key

FSO Part 1 用函数组件写浏览器 UI：入参 props，返回元素；Part 1c/1d 讲状态与事件；Part 2a 讲集合渲染与 `key`。FDE 把这些用到案例卡、工作台待办、Ontology 表，并额外用 Context 跨页——必须先掌握 Part 1 的规则，才能批评 Store。

## 组件树

```
layout.tsx
  ConfigProvider
    StoreProvider
      AppShell          侧栏、顶栏、CopilotDrawer
        {children}      各 page.tsx
```

`/login` 时 `AppShell` 直接 `return <>{children}</>`，所以没有侧栏——这是 **条件渲染**。

`PageHead`、`FlowCanvas`、`Case` 卡片都应是函数组件。FSO 把 note 抽成组件并传 `note` 对象；FDE 应传 `CaseItem`。

## 列表与 key

```tsx
{list.map((c) => (
  <Col span={8} key={c.id}>
    <Card onClick={() => router.push(`/cases/${c.id}`)}>...</Card>
  </Col>
))}
```

`key` 必须稳定。用下标当 key，过滤行业时卡片会错位——FSO 用 notes 演示过。课堂用案例库复现：先「全部」再「通信运营」。

## 局部 state vs 全局 Context

| 状态 | 放哪 | 例子 |
|---|---|---|
| 仅本页 | `useState` | 案例库筛选 |
| 跨页、刷新可丢 | `StoreProvider` | extracts、run、user |
| 跨会话、多用户 | 尚无 | 领取案例、Run 历史 |

FSO 强调不要复制 state，提到最近公共父组件。FDE 提到应用根上。`useStore()` 让 Discover 与工作台共享数据，代价是任意 `patch` 可能重渲染大树，且刷新归零。

## 受控输入

搜索框 `value={kw} onChange=...` 是受控（Part 1d）。登录密码 `defaultValue` 是非受控且没人读。不要同时写 `value` 和 `defaultValue`。

## 副作用

渲染必须纯。滚动、定时器、订阅放 `useEffect` 并清理。`CopilotDrawer` 在 `msgs` 变化时滚到底；`store.tsx` 的 `startRun` 前 `clearTimers()`。这是 FSO 后面 Part 2 才系统讲的 effect，本讲先建立习惯。
