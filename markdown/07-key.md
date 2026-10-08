# 前后端集成：请求生命周期与竞态

## 学习目标与课前准备

学完本讲，应能：接通真实 API；呈现加载、成功、空结果与失败；取消失效请求并说明跨源行为

先修：React state 与 Express 列表契约。本讲 2 学时，按每学时 45 分钟安排：回顾与问题导入 10 分钟、概念和示例 30 分钟、课堂练习 40 分钟、讲评与出口检查 10 分钟。课后练习时间不计入 32 学时。


## 接口成功不等于界面可靠

把前端数组换成 fetch 只是第一步。用户会快速改变筛选，也会遇到服务断开。界面需要明确当前显示的是哪个请求的结果，不能让慢的旧请求覆盖新的筛选。

以下是 React 组件中的 Effect 片段。组件先声明 `industry`、`difficulty`、`kw`，以及 `const [result, setResult] = useState({status:'loading', items:[]})`；从 React 导入 useEffect。开发代理将 `/api` 转发到本机 3001，避免写死部署域名。

```jsx
useEffect(() => {
  const controller = new AbortController();
  let active = true;
  setResult({status: 'loading', items: []});
  async function load() {
    try {
      const query = new URLSearchParams({industry, difficulty, kw});
      const response = await fetch(`/api/cases?${query}`, {signal: controller.signal});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      if (!Array.isArray(body.items) || typeof body.total !== 'number') {
        throw new Error('接口格式不符合约定');
      }
      if (active) setResult({status: 'success', items: body.items});
    } catch (error) {
      if (active && error.name !== 'AbortError') {
        setResult({status: 'error', items: [], message: '加载失败，请重试'});
      }
    }
  }
  load();
  return () => { active = false; controller.abort(); };
}, [industry, difficulty, kw]);
```

生产应用还需验证条目字段；第 12 讲区分类型和运行时校验。清理函数同时处理组件卸载和依赖变化。开发环境的额外 Effect 检查不应通过删除清理逻辑来“修复”。

## 四种用户可见状态

loading 展示文字或进度；success 且 items 非空显示列表；success 且为空显示“无匹配案例”；error 展示错误和重试入口。不要把失败当作空数组悄悄吞掉，否则用户会误以为业务数据不存在。

搜索防抖是优化项，不是正确性的前提。没有防抖也应保证旧响应不会覆盖新响应。重试需重新发起相同条件请求，可用明确的重试计数作为 Effect 依赖。

## 同源与 CORS

源由协议、主机、端口组成，`localhost` 与 `127.0.0.1` 不是同一主机。CORS 是浏览器对跨源响应读取的控制，不是服务器身份认证。某些跨源请求符合简单请求条件，不会预检；JSON POST 或自定义头等场景常触发 OPTIONS。

使用 cookie 的跨源请求需要双方正确配置 credentials、具体允许源等，不能把允许源 `*` 当作通用修复。本课优先同源代理；确需跨源时只开放课堂前端源。后端必须独立校验身份，curl 不受浏览器 CORS 约束。

## 按层定位问题

先看 Network 是否发出、URL 是否包含全部筛选字段，再看状态码和响应体，最后看组件状态。服务器日志提供请求 id，有助于关联同一次失败。切勿先同时修改前端、API 和数据库，让因果不可追踪。


## 自检与参考答案

**问题：** 先搜 A 后搜 B，A 的请求最后返回怎么办？

<details><summary>完成思考后查看参考答案</summary>

清理旧请求，并只接受当前请求的结果。仅做输入防抖不足以保证响应顺序。例子用 AbortController 与 active 标志阻止旧结果写入。

</details>

## 阅读定位

[Full Stack Open Part 2：与服务器通信](https://fullstackopen.com/zh/part2/) 和 [Part 3：前后端连接](https://fullstackopen.com/zh/part3/)。

必读范围是本讲正文；参考材料用于查漏补缺，不要求通读整门外部课程。课堂练习与课后练习见本讲后续小节。
