# 资源授权：从权限表到不能绕过的检查

## 1. 将权限判断放到请求路径上

登录只确认身份，不决定全部操作资格。访问控制要同时考虑主体、资源、动作与状态。例如alice可以读取公开案例，可以修改自己的案例，却不能修改bob的案例；管理员能审批，也必须遵守审批状态。

本课以三个练习身份验证，而不是只用一个管理员账号演示。管理员容易成功，无法证明普通用户的限制有效。[OWASP授权指南](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

| 主体 | 资源 | 动作 | 预期 |
|---|---|---|---|
| 匿名且CSRF有效 | 任意案例集合 | 创建 | 401 |
| alice | alice案例 | 修改 | 200 |
| alice | bob案例 | 修改 | 403且数据未变 |
| admin | bob案例 | 修改 | 200 |
| bob | alice运行 | 读取 | 403 |
| alice | 自己运行 | 审批 | 403 |
| admin | 已拒绝运行 | 改为批准 | 409 |

所有写操作还需满足来源、CSRF与字段校验。若测试用例的前提不同，状态码可能先反映其他层次。

## 2. 对象级越权与功能级越权

对象级越权是对不属于自己或不允许访问的资源操作。例如保留alice会话，只把路径里的案例编号换成bob的。编号使用UUID能降低猜测便利性，却不是权限控制。

功能级越权是普通用户调用管理能力，例如直接向审批接口发送POST。页面没有管理入口不代表接口安全，应在服务端检查所需角色与业务条件。

字段级越权则可能通过ownerId、role或隐藏表单字段改变权限事实。三个问题需要分别测试，不能用一次“未登录被拒绝”覆盖。

## 3. 身份怎样进入路由

现有app.mjs中，登录检查函数每次从会话取userId，再加载用户：

```javascript
const login = async (req, res, next) => {
  req.user = req.session.userId ? await store.user(req.session.userId) : null;
  if (!req.user) fail(401, 'UNAUTHENTICATED', '请先登录');
  next();
};
```

req.user是服务端在这次请求中建立的对象，不是客户端提交的JSON。未认证时不能继续next进入业务操作。正常路径调用next，表示让后续处理继续执行。

创建接口随后采用：

```javascript
const c = await store.createCase({...validCase(req.body), ownerId:req.user.id});
```

validCase只返回title、industry、difficulty；即使请求体夹带ownerId或role，最终归属仍由req.user.id决定。综合实验采用“忽略额外字段并构造允许字段”的行为；第五讲独立入门实验选择拒绝额外字段，两者都不能让额外字段生效，但调用契约应分别写清楚。

## 4. 在数据操作前检查对象归属

MemoryStore.updateCase中的顺序是找记录、检查归属、再修改：

```javascript
const c = this.cases.find(c => c.id === id);
if (!c) fail(404, 'NOT_FOUND', '案例不存在');
if (c.ownerId !== actor.id && actor.role !== 'admin') {
  fail(403, 'FORBIDDEN', '不可修改其他用户的案例');
}
Object.assign(c, patch);
```

actor来自登录检查，patch来自可写字段校验。先改对象再检查权限，即使最后返回403，数据也已经被破坏。失败验证必须检查最终存储状态。

综合实验的PATCH为简化实现要求提交title、industry、difficulty三个可写字段；只发标题会先校验失败。若要测试对象授权，应发送完整有效字段，避免400遮挡403。后续改成部分更新时，需要同时修改字段契约与测试。

## 5. 数据库中的条件更新

PostgreSQL适配器使用带授权条件的UPDATE：

```sql
UPDATE cases SET title=$1,industry=$2,difficulty=$3
WHERE id=$4 AND (owner_id=$5 OR $6)
RETURNING *;
```

这些参数分别来自已校验业务字段、路径id、服务端用户id和服务端计算的管理员标志。$6不能直接取自请求体里的isAdmin。

把归属条件放在实际写入语句中，有助于避免查询后另一个写入改变条件造成的竞争窗口。返回零行还需区分资源缺失与权限不足，并按选定策略返回404或403。数据库事务和约束与应用授权互补，并不相互替代。

本次新增安全测试运行的是内存适配器。已有PGlite存储测试覆盖部分SQL授权，真实PostgreSQL的并发更新和权限配置仍需在服务环境验证。

## 6. 角色变化与最小权限

如果用户登录时把role复制进会话，然后长期只信任会话内的旧值，管理员降权可能不会及时生效。本实验会话保存userId，受保护请求重新读取store.user，因此之后的请求可观察到服务端角色变化。

新增测试先用管理员修改bob案例，再在隔离测试夹具中把该角色降为student，随后相同会话的跨用户修改必须被拒绝。该操作是自动测试直接修改夹具，不是新增了一个可由客户端调用的改角色接口。

本设计也不是无限保证：一次请求中的角色读取之后若立刻发生并发变更，仍需根据敏感程度选择更强的事务或权限版本机制。最小权限原则要求默认只授予需要的能力，而不是所有登录账号默认管理员。

## 7. 多租户与状态条件的扩展

期末项目若有班级、团队或组织，owner检查还不够。一个用户可能属于多个组织，需要在查询和写入时限定tenant/team范围。列表过滤、详情、更新、导出和后台任务都应遵守同一边界。

角色、所有权和状态也应共同判断。审批提案需要“管理员+可见资源+WAITING_APPROVAL+允许决定”，不能因为role为admin就跳过已结束状态。

这些规则应集中表达并让每条相关路径调用，避免在React按钮、Express路由和数据层分别出现互相矛盾的权限表。数据层仍可加条件作进一步保护。

## 8. 从矩阵生成负向测试

为同一个资源准备合法用户、另一用户和管理员，先验证各自正常操作，再改变一个条件。示例测试步骤为：

1. alice登录并取得有效CSRF。
2. GET公开bob案例，保存完整原对象。
3. PATCH该案例，提交完整合法字段。
4. 检查403和FORBIDDEN。
5. 再读数据，与原对象比较。
6. 对alice自己的案例发相同形状请求，确认成功。

第四步只说明拒绝，第五步证明没有未授权副作用，第六步排除“实现把所有更新都禁用了”的假通过。

还应分别测试错误编号400、合法但缺失404，以及普通用户调用审批403。不要只比较响应消息文字，优先使用稳定错误码与数据事实。

## 9. 授权与前端界面怎样协作

界面可根据当前用户展示可用操作，但最终以服务端响应为准。若角色改变、会话过期或资源被删除，旧界面的按钮仍可能短暂存在，点击后应能解释401/403/404，而不是继续显示“保存成功”。

退出后清空受保护数据和当前身份，避免下一位使用者看到上一个账号的私有内容。切换账号后重新加载相关集合，不能仅修改头像就复用旧用户的缓存。

FDE UI里的演示角色切换只改变前端状态，不等于完成认证与授权。将它接入真实服务时，应从登录、会话恢复和单个资源权限开始，逐步替换模拟行为。

## 自检与参考答案

<details><summary>UUID很难猜，为什么仍要检查对象权限？</summary><p>编号可能通过列表、日志或其他渠道被知道。标识资源不等于授权访问，不能以不可猜测代替权限规则。</p></details>

<details><summary>越权测试返回400而不是403，首先检查什么？</summary><p>检查请求字段和编号是否先校验失败。验证授权时要保证认证、CSRF和业务输入均合法。</p></details>

<details><summary>管理员也需要检查资源状态吗？</summary><p>需要。角色允许进入某项功能，不代表任意状态转换都合法，已拒绝或完成的请求仍受业务规则约束。</p></details>

## 阅读定位

★★★★★ [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)：最小权限、默认拒绝、每次请求检查和对象标识保护。

★★★★☆ [Full Stack Open User Administration](https://fullstackopen.com/en/part4/user_administration/)与[Token Authentication](https://fullstackopen.com/en/part4/token_authentication/)：用户与资源关联、受保护操作及身份传递。
