# React联调教程：查询、表单与服务端结果

## 1. 启动独立联调实验

从课程根目录执行：

```bash
cd labs/express-basics
npm ci --ignore-scripts
cd ../integration-basics
npm ci --ignore-scripts
npm run dev
```

打开 http://127.0.0.1:3031 。同一命令启动3030 API与3031页面/代理，默认使用相对/api。无需先启动3002、数据库或综合实验；复用Express代码，但数据是本次独立内存样本。Ctrl+C关闭，重启清空新增记录。

本实验先用esbuild构建React，再由本机服务提供文件，没有自动热更新。修改源码后重新build或dev；不要把Vite配置直接写进本项目就期望生效。

## 2. 从三个固定样本开始

初始数据为链路中断、订单延迟、链路恢复记录。列表每页2条，total为3。试着输入关键词、筛选行业与难度，再翻页，观察参数与显示结果是否一致。

筛选条件由页面state保存，匹配与分页由API执行。改变筛选时将offset归零；否则原来位于第二页的offset可能让一个新条件显示空页。

```jsx
const [filters, setFilters] = useState({
  kw: '', industry: '', difficulty: '', offset: 0, limit: 2
});
function changeFilter(key, value) {
  setFilters(old => ({...old, [key]: value, offset: 0}));
}
```

这段放在组件中，示意配套实现的数据结构。输入框显示filters.kw，请求也由同一份filters构造，避免“页面选通信，实际却查零售”。

## 3. 先看一个基础查询Effect

以下可放入已有React组件；组件先定义api、filters、version和result。api.list为前一节业务服务，version在显式重试时加一。

```jsx
useEffect(() => {
  const controller = new AbortController();
  let active = true;
  setResult({status: 'loading'});
  api.list(filters, {signal: controller.signal}).then(data => {
    if (active) setResult({status: 'success', data});
  }).catch(error => {
    if (active && error.name !== 'AbortError') {
      setResult({status: 'error', error});
    }
  });
  return () => { active = false; controller.abort(); };
}, [api, filters, version]);
```

active防止旧回调发布，abort清理失效传输。清理既用于组件卸载，也用于依赖改变前的旧请求收尾。依赖是查询原因，不是查询结果；把result也放进去会因为收到结果再次查询。

[React Effect教程](https://react.dev/learn/synchronizing-with-effects)解释这种外部同步与清理。本例的浏览器构建采用production配置；在启用StrictMode的开发项目里，还应正确承受额外的建立/清理检查。

## 4. 完整实验把“最新请求”提取成独立模块

client/latest.mjs的LatestRequest记录代次。每次run先让旧代次失效，再建立新的AbortController；只有仍属于当前代次、且未取消的结果才能发布。

```javascript
const version = this.version;
const data = await work(controller.signal);
if (version === this.version && !controller.signal.aborted) {
  this.publish({status: 'success', data});
}
```

这是类内部的核心摘录，不是独立可运行片段。失败分支也检查代次，防止旧请求的错误覆盖新请求的成功。完整模块同时处理取消和发布loading。

CaseList以useMemo创建生命周期对象，不在构造时发请求；Effect调用run，清理时cancel。api则在请求地址改变时重新创建，避免每次组件渲染都产生新的依赖对象。

## 5. 用慢查询和快查询观察竞态

选择延迟读取，点击“慢查链路”，随后尽快点“快查订单”。实验让链路读取等待约900毫秒，订单约60毫秒。目标不是比手速，而是观察当前条件始终决定最终显示。

浏览器可能把旧请求标成canceled，也可能某个请求已经结束；重要的是旧结果不能覆盖订单。自动演示另外使用可控顺序验证，避免只凭一次页面操作下结论。

防抖可以减少输入过程中的查询次数，代次检查则保证即便有多个异步任务，旧数据也不会发布。两者解决不同问题。

## 6. 提交表单使用事件处理函数

创建按钮触发onSubmit，而不是先设置“待提交对象”再由Effect观察它。草稿与服务端对象分开保存：draft是用户正在编辑的值，saved是服务器确认的结果。

```jsx
async function submit(event) {
  event.preventDefault();
  const saved = await api.create(draft);
  setSaved(saved);
  setDraft(emptyDraft);
  refreshList();
}
```

这是说明顺序的简化版，不包含完整校验与失败处理。实际表单在提交前检查非空白标题，以ref防止同一时段重复进入，提交中禁用fieldset，收到成功才清空草稿。失败时保留输入，避免使用者重新填写。

禁用表单也防止等待期间用户输入了另一份草稿，而旧提交回来后把新输入一起清掉。按钮disabled提升当前页面交互可靠性，但不能替代后端幂等。

## 7. 前后端校验各有职责

HTML的required、maxLength和页面提示用于即时反馈；服务器仍需独立校验所有请求。客户端可以被绕过，浏览器校验也不自动代表后端接受同一范围。

本例后端去首尾空白，并生成id。成功提示采用返回对象中的title与id。不要用本地草稿拼一个“看起来已保存”的卡片，再把未收到响应当作默认成功。

## 8. 保存结果与列表刷新分别显示

本例先记录创建成功，再把offset设回0，按当前筛选重新读取。它没有向列表盲目追加新项，也没有清空所有筛选强迫新项出现。

如果当前关键词为订单，新建的链路案例可能不在列表中；如果读取场景仍设为503，列表刷新会失败，但保存成功提示保留。两次请求分别有结果，不能用一个busy或error覆盖所有业务事实。

| 动作 | 成功后 | 失败后 |
|---|---|---|
| 查询 | 替换当前查询结果 | 显示读取错误，允许重试 |
| 创建 | 采用服务端对象，独立触发刷新 | 明确拒绝则修正；未确认则先核对 |
| PATCH/DELETE拓展 | 用服务端结果或重新查询 | 不宣称已修改；识别可能的冲突与未知结果 |

## 9. 写入结果未确认的对照

选择表单的“已写入，但响应被实验服务中断”，填写一个唯一标题并提交。服务端确实创建对象，但响应在返回前被中断；当前代理因此返回502。

页面保留草稿，提示结果未确认，不自动重发。点击“恢复正常查询”，用该唯一标题搜索，应该能查到已保存记录。此时再次提交会造成第二条记录，本例没有幂等键，不能用UI禁用声称彻底解决重复创建。

真实环境可能出现网络失败、超时或某类5xx，不能机械地以一个状态证明写入未发生。本例把这些写入结果保守归为需核对；最终业务结论要依据服务器状态。

## 10. 为什么暂不使用乐观更新

乐观更新先改变本地列表，假设服务器会成功，再在失败时恢复。它能减少等待感，但要解决临时id、撤销、并发修改、分页总数与重复提交等问题。

入门先实现等待确认的版本，再按业务风险决定是否引入乐观策略。不要把本地插入数组误写为“已经同步到服务器”。

## 11. 读源码的顺序

1. client/api.mjs：请求分类、查询编码与业务数据检查。
2. client/latest.mjs：当前性和取消，不依赖React，便于验证竞态。
3. client/main.jsx中的CaseList：Effect、状态渲染与分页。
4. CreateForm：草稿、提交、确认与失败提示。
5. server/lab.mjs：代理、CORS与明确标注的故障注入。

检查时解释每一次刷新由什么触发。不要为了“让页面重新请求”而把每个状态都加入依赖，或到处强制刷新整个浏览器。

## 检查点

<details><summary>创建后GET列表失败，应该把刚才的成功改成“创建失败”吗？</summary><p>不应。创建已获得确认；当前失败属于列表读取，需要单独提示和重试。</p></details>

<details><summary>为什么例子同时使用取消与代次判断？</summary><p>取消用于尽早停止失效传输，代次判断阻止旧结果发布；即使某个任务不响应取消，界面仍应正确。</p></details>

<details><summary>保存失败时清空输入框，会带来什么问题？</summary><p>丢失使用者草稿，也妨碍修正或核对未知结果。应在明确成功后再清空。</p></details>
