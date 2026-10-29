# 综合演示：同一个API为什么有时成功、有时拒绝

## 演示目标与运行方式

本例围绕案例库的alice、bob和admin三种身份，按九幕观察“身份—会话—CSRF—资源授权—输出—退出”的完整过程。每幕先预测结果，再执行请求，最后对照状态码和数据证据。完整观察约20–25分钟，也可选择其中的登录、越权、CSRF与退出作为核心路径。

演示不是预先写死的成功日志：脚本启动一套真实Express API，在随机本机端口发请求，并使用断言验证实际结果。业务与会话均为本次独立内存数据，不读取.env、不依赖已经运行的3001服务；练习口令运行时生成且不输出，脚本退出后服务关闭。

从课程仓库根目录执行：

```bash
cd labs/course-lab
npm ci --ignore-scripts
npm run security:demo
```

终端每幕会停在“按回车执行本幕”。先说出预期状态，再按回车观察。Ctrl+C可结束；重新运行会准备新的样本，不需清空原course-lab数据。不要在同一个演示中跳过前面的登录状态，后续场景会使用它。

无需停顿的自动模式：

```bash
npm run security:demo:auto
```

自动模式执行同样九幕并生成 `labs/security-basics/demo-output/report.html` 与report.json。页面报告不含口令、Cookie或CSRF实际值。目录被Git忽略；命令会覆盖上一次本机报告，但不会改动已附的示例报告。

## 不运行也可以对照的实际示例

[打开九幕示例报告](labs/security-basics/demo-example/report.html)。这是本次实际执行保存的参考结果，不是你本机操作已经通过的证明。重新运行后，应对照自己的新报告。

若已经启动教材静态服务，本机新报告路径为 `/labs/security-basics/demo-output/report.html`。该报告展示已执行请求的记录，不是带登录能力的在线控制台，也不会在页面打开时重新发送请求。

| 幕次 | 主要观察 | 关键预期 |
|---|---|---|
| 1 | 匿名已有CSRF | 创建仍401 |
| 2 | 登录轮换 | 登录200，旧匿名Cookie请求401 |
| 3 | 本人合法操作 | 创建201、修改200 |
| 4 | 只换资源编号 | 修改他人403且数据未变 |
| 5 | 伪造角色与归属 | 创建201，但归属仍为alice |
| 6 | 不同拒绝层 | 旧/他人CSRF为403 CSRF，错误来源为403 ORIGIN |
| 7 | 真正的管理员身份 | 修改bob案例200 |
| 8 | 文本与HTML | API保存文字，React转义标签 |
| 9 | 服务端注销 | 退出204，旧Cookie重放401 |

报告中的“本人案例”“bob案例”是便于阅读的路径代称，实际请求使用已创建或固定样本的UUID；数据证据中可查看对应编号。

## 第一幕：有CSRF不等于已登录

先预测：匿名客户端先GET /api/session，已经取得Cookie和有效csrf，现在POST /api/cases能成功吗？

预期输出：

```text
GET /api/session → 200
POST /api/cases → 401 UNAUTHENTICATED
```

观察user为null，案例数量从2到2。匿名会话可持有CSRF令牌，但没有经过认证的userId。这个请求已经满足CSRF，因此401确实来自身份检查。

如果直接省略CSRF去请求，可能先得到403；那不能用于证明身份检查工作正常。

## 第二幕：登录必须建立新的会话

alice登录后，脚本比较Cookie和CSRF是否更新，只显示布尔结果，不显示实际值。随后带登录前的匿名Cookie读取受保护运行集合。

预期：登录200，cookieRotated和csrfRotated均为true；旧匿名Cookie读取/api/runs为401。响应Cookie具备HttpOnly与SameSite=Lax标志。

需要解释：登录前会话没有因为用户登录而原地获得权限，服务端已轮换标识。前端收到登录响应后也必须更新CSRF，否则下一次写请求会被拒绝。

## 第三幕：先证明本人能够操作

alice创建“课堂案例：链路中断”，服务器生成id，ownerId为alice。接着提交完整title、industry、difficulty，将标题改成“课堂案例：已修订”。

```text
POST /api/cases → 201
PATCH /api/cases/本人案例 → 200
```

对照before与after：id和owner不变，标题变更。只有正常路径能够成功，后面的拒绝才不会是“所有写入都失败”的假通过。

综合实验的PATCH要求三个可写字段齐全，与第五讲只提交一个字段的独立入门契约不同。演示使用完整合法字段，避免字段校验遮挡权限判断。

## 第四幕：保留身份，只换目标

脚本保存bob案例的原对象。alice保留有效会话和CSRF，仅把修改目标换为bob案例，试图写入“不应写入”。

预期403 FORBIDDEN，after与before完全一致，unchanged为true。

这一步同时回答两个问题：服务器是否拒绝，以及拒绝前是否已经改变了数据。只看403不够。案例列表和详情公开可读，并不意味着所有登录用户都可以修改它。

## 第五幕：请求体不能自行提权

alice创建另一条案例，夹带：

```json
{"ownerId":"管理员的编号","role":"admin"}
```

预期仍然201，但saved.ownerId为alice，saved没有role，alice服务端角色仍为student。该实现选择忽略额外字段并重新构造可写对象，成功状态并不表示伪造字段生效。

与第四幕比较：第四幕试图操作他人对象被拒绝；第五幕试图让客户端字段成为身份事实，但字段未被采纳。它们是不同的边界。

## 第六幕：同样的403，需要看错误分类

脚本分别发送三个写请求：

| 凭据组合 | 预期分类 |
|---|---|
| alice新Cookie + 登录前旧CSRF | 403 CSRF |
| aliceCookie + bob会话的CSRF | 403 CSRF |
| aliceCookie + 当前有效CSRF + 错误Origin | 403 ORIGIN |

三次失败后案例数量保持不变。错误Origin只是请求头中的示例文字，所有请求仍发往本机服务，没有访问外部站点。

这些测试证明服务端比较逻辑。Node客户端可以构造Origin，不受浏览器对该头的限制；真实浏览器的同源、SameSite与CORS还要分别验证。不能把这幕当作完整的跨站浏览器攻击复现。

## 第七幕：管理员与普通用户的差异

使用独立客户端登录admin，再对第四幕同一个bob案例提交合法修改。预期200，标题变成“课堂案例：管理员已更新”，owner仍为bob。

管理员修改成功与alice修改失败形成对照，说明权限来自服务端角色。此处确实改变了本次内存样本，退出脚本后丢弃；不会触及已有实验或数据库中的bob记录。

## 第八幕：字符串保存成功，不等于应作为HTML执行

alice将自己案例的标题改成无脚本标记：

```text
<strong>课堂标记</strong>
```

API保存并返回原字符串；React服务器渲染 `<h3>{title}</h3>` 后得到：

```html
<h3>&lt;strong&gt;课堂标记&lt;/strong&gt;</h3>
```

这说明输入校验、JSON保存和输出解释是不同边界。报告会转义显示这些证据，因此不会把标记当作页面HTML执行。本幕验证React文本插值，不测试富文本清洗，也不能证明所有页面没有XSS。

继续思考：若改成innerHTML或dangerouslySetInnerHTML，是否仍然有相同保证？答案需结合输出上下文与清洗策略，而不是沿用此处的文本转义结论。

## 第九幕：退出后重放旧Cookie

脚本在内存中暂存退出前Cookie，调用合法POST /api/logout，再将原值重放到受保护的GET /api/runs。

```text
POST /api/logout → 204
GET /api/runs（退出前Cookie） → 401 UNAUTHENTICATED
```

预期serverSessionDestroyed与replayedCredentialRejected为true。这里验证服务器销毁了原会话，不只是客户端清空user或跳转页面。Cookie实际值不进入终端和报告。

## 将观察对应到源码

| 观察 | 文件，相对于course-lab |
|---|---|
| 九幕编排、预测与断言 | scripts/security-demo.mjs |
| session、登录轮换、CSRF、退出 | server/app.mjs |
| 允许写入的字段 | server/domain.mjs |
| owner/admin实际检查 | server/memory-store.mjs |
| 隔离账号与样本 | server/fixtures.mjs |
| Node客户端维护Cookie与csrf | 相邻security-basics/client.mjs |
| 重复执行与报告验证 | tests/security-demo.test.mjs |

演示使用现有业务实现，不额外加入“跳过认证”或客户端改角色接口。随机口令只存在本次进程中，脚本代表隔离练习身份完成登录。

## 运行失败后的检查

| 现象 | 检查方法 |
|---|---|
| 交互模式提示需要终端 | 在自己的终端运行；批处理使用security:demo:auto |
| 找不到依赖 | 在labs/course-lab执行npm ci --ignore-scripts |
| 某幕断言失败 | 读取最近的请求、实际/预期状态，定位到相应身份或防护层 |
| 报告仍是旧结果 | 重新运行自动模式并重新加载报告，查看生成时间 |
| 原实验3001端口已占用 | 本演示使用随机端口，不需要关闭该服务 |
| 误以为报告能点击修改案例 | 报告是执行记录，重新运行脚本才能产生新结果 |

## 观察记录与自检

记录一条成功和一条拒绝请求：谁在操作、目标是谁的资源、前置条件是否有效、返回什么、数据有何变化。证据不得包含实际Cookie、CSRF或口令。

<details><summary>本演示多次出现401/403，为什么最终仍算全部通过？</summary><p>这些步骤的预期就是拒绝。判断依据是符合契约且没有未经授权的副作用，不是所有请求都返回200。</p></details>

<details><summary>为什么不直接在已有course-lab记录上做演示？</summary><p>独立样本使初始条件可预测、可以反复运行，也避免管理员演示改变正在使用的实验记录。</p></details>

<details><summary>网页报告能证明你的浏览器SameSite和生产HTTPS都正常吗？</summary><p>不能。报告来自本次Node HTTP与React服务器渲染，浏览器策略和生产承载有独立验证范围。</p></details>
