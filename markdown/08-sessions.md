# 登录、会话与令牌：从口令验证到退出失效

## 1. 先运行已有登录参考实现

从课程根目录执行，使用Node20.18+：

```bash
cd labs/course-lab
npm ci --ignore-scripts
node scripts/init-env.mjs
npm run dev
```

默认打开 http://127.0.0.1:3001 。初始化脚本在本机.env中生成随机练习口令和SESSION_SECRET，不覆盖已有文件。alice、bob、admin使用该文件中的LAB_PASSWORD，这只是便于演示的隔离账号安排，不是实际账号管理方案。

不需要数据库即可学习默认内存模式。浏览器查看页面前需构建React，npm run dev已包含build；自动接口测试则不要求页面构建和固定端口服务。

## 2. HTTP怎样延续一次登录

一次请求成功不会自动把所有后续请求识别为同一用户，需要建立可验证的关联。

```text
浏览器                             服务器
GET /api/session          → 创建匿名会话与CSRF值
保存Set-Cookie与csrf       ← 返回user:null
POST /api/login           → 检查CSRF、验证口令
更新Cookie与csrf          ← 轮换会话后返回公开用户信息
POST /api/cases           → 根据会话加载用户，检查权限后创建
POST /api/logout          → 服务端销毁会话
后续旧Cookie请求          → 没有有效登录身份，拒绝受保护操作
```

GET /session返回csrf不代表用户已登录；匿名会话也有CSRF令牌，以保护登录等改变状态的请求。身份由user是否经过服务端验证决定。

## 3. 密码应怎样保存

密码不能以明文保存，也不应设计成需要恢复原文的可逆加密字段。密码散列验证将提交值与带盐、可调成本的散列比对，数据库只保存散列及算法所需信息。

盐使相同口令的存储表示可不同，降低预计算攻击的收益；它不是登录时另行输入的秘密，也不能弥补弱口令。直接使用快速SHA-256不能替代专用密码散列算法。

本课fixtures.mjs使用bcryptjs生成成本参数为10的教学散列，登录时用bcrypt.compare验证。新系统应按当前框架与安全指南选用合适方案，OWASP优先推荐Argon2id；bcrypt有输入字节长度等限制，不应把现有演示配置直接视为完整口令政策。[OWASP密码存储](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

本实验随机练习口令为ASCII且较短；现有登录字段长度检查不等于已实现完整的密码强度、72字节边界或泄露口令检测。生产设计应明确这些规则。

## 4. 对照源码阅读登录路由

`server/app.mjs`的核心操作为：

```javascript
const user = await store.findUser(username);
if (!user || !await bcrypt.compare(password, user.passwordHash)) {
  fail(401, 'LOGIN_FAILED', '用户名或口令不正确');
}
await new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
req.session.userId = user.id;
req.session.csrf = token();
await new Promise((resolve, reject) => req.session.save(err => err ? reject(err) : resolve()));
res.json({user: visibleUser(user), csrf: req.session.csrf});
```

这是已注册登录路由内部片段，username、password已做基本校验，bcrypt、fail、token和visibleUser由模块提供。实际请求在到达这里前已检查来源与CSRF。

统一失败状态和消息减少通过正文判断账号是否存在的机会，但现有实现没有抹平所有运行时间差异。应结合限流、监测与身份系统能力处理自动化猜测，不把一个相同错误字符串视为完整防枚举方案。[OWASP认证指南](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

visibleUser只返回id、username、role。passwordHash不能出现在登录响应、会话查询响应或正常日志中。

## 5. 为什么登录后要轮换会话

会话固定攻击利用登录前后标识不变的设计，使已知的匿名会话在用户登录后获得权限。登录成功后调用regenerate创建新会话，再写入userId，可以切断这种延续。

本实验同时生成新的CSRF值。前端必须用登录响应更新它；仍发送旧值会得到403。Cookie和CSRF轮换是不同动作，不能只验证其中一个就声称整个登录过程正确。

登录后用旧匿名Cookie访问/api/runs应为401；用新Cookie配旧CSRF创建案例应为403；新Cookie和新CSRF一起使用才成功。自动测试会分别验证这些行为。

## 6. Cookie中保存了什么

express-session将会话数据保存在服务端，浏览器持有会话标识及签名。签名用于检测改动，不用来掩盖内容。SESSION_SECRET用于签名验证，应具有足够随机性并只保留在服务端。

| 配置 | 本实验值 | 含义 |
|---|---|---|
| name | case.sid | Cookie名称 |
| httpOnly | true | 不向document.cookie开放读取 |
| sameSite | lax | 限制部分跨站自动携带场景 |
| secure | 本机HTTP默认false | 生产HTTPS场景应正确启用 |
| maxAge | 一小时 | 浏览器Cookie过期时间相关设置 |
| resave | false | 不无条件重写未改变会话 |
| saveUninitialized | false | 不自动保存未修改的初始会话 |

这几个参数解决不同问题。HttpOnly不阻止同源恶意脚本借当前浏览器发请求；SameSite不是授权；Secure不表示Cookie内容被单独加密。[express-session官方说明](https://expressjs.com/en/resources/middleware/session/)

浏览器Cookie有Domain/Path等作用域，但不按端口区分。不同本机端口的实验可能共享同一主机下Cookie名称，因此本课统一使用127.0.0.1并避免同名会话冲突。

## 7. 会话存储与过期是服务端职责

默认MemoryStore适合教学与调试，不适合多进程生产服务；重启会丢失会话。综合实验的PostgreSQL路线使用connect-pg-simple保存会话，业务数据与会话记录各有生命周期。[会话存储边界](https://expressjs.com/en/resources/middleware/session/)

浏览器不再发送过期Cookie只是客户端行为。攻击者仍可能主动重放保存的值，服务器也必须按存储规则检查过期。新增测试直接使服务端会话过期，再带原Cookie请求受保护接口，不依赖等待或浏览器自动删除。

一小时的Cookie设置不等于已实现完整的绝对会话期限、闲置超时和所有设备退出。应分别定义这些策略，敏感操作还可能需要重新认证。[OWASP会话管理](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## 8. 退出登录要撤销什么

```javascript
await new Promise((resolve, reject) => req.session.destroy(err => err ? reject(err) : resolve()));
res.clearCookie('case.sid', {path:'/', httpOnly:true, sameSite:'lax', secure:secureCookie})
  .status(204).end();
```

此片段销毁当前服务端会话并清除对应Cookie，路径属性应与原Cookie匹配。客户端收到204后清空user，并重新取得匿名会话。仅执行setUser(null)、删除localStorage或跳回登录页，都不代表服务端会话已失效。

退出本身是改变状态的POST操作，本实验同样要求CSRF。缺少令牌时退出被拒绝，原会话仍有效；合法退出后保存的旧Cookie不应恢复受保护访问。

## 9. JWT为什么不是“更高级的Cookie”

常见签名JWT由头部、载荷和签名组成，载荷通常可解码读取。签名验证用于检测篡改，不等于加密，不能将密码或模型密钥写进载荷。

服务必须按预期算法与密钥验证，并检查过期、签发者、受众等适用约束。只解码payload或只读取userId而不验签，不能确认身份。[JWT最佳实践](https://www.rfc-editor.org/rfc/rfc8725.html)

| 维度 | 服务端会话 | 签名访问JWT |
|---|---|---|
| 客户端持有 | 不透明会话标识 | 令牌及声明 |
| 服务端处理 | 读取会话及用户状态 | 验证令牌，按需要读取当前权限 |
| 退出/撤销 | 删除或失效会话记录 | 常需短期限、撤销或版本等设计 |
| 权限变化 | 可在请求时读取当前角色 | 载荷中的旧角色可能滞后 |
| 浏览器存放 | 通常Cookie | 可以内存、Cookie等，风险随存放方式变化 |

localStorage方便读取，也使同源脚本能接触令牌；HttpOnly Cookie减少直接读取，但要考虑CSRF。没有脱离威胁模型的“放哪里就绝对安全”。本讲不另写JWT签名库或第二套登录。

## 10. OAuth与OIDC只做边界认识

OAuth主要描述委托授权，让客户端在限定范围内访问资源；OpenID Connect在OAuth基础上提供身份层。二者不是密码散列算法，也不是JWT的同义词。[OAuth授权框架](https://www.rfc-editor.org/rfc/rfc6749.html)、[OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html)

需要学校统一身份或第三方登录时，优先采用相应身份提供方与成熟客户端库。正确接入还需要核对回调、状态、令牌用途和会话建立，不能只取得一个前端用户对象就认定身份可信。

## 自检与参考答案

<details><summary>为什么登录后旧CSRF会导致403，而不是401？</summary><p>Cookie可能已代表有效登录身份，但CSRF仍是旧会话的值；请求在到达业务操作前被CSRF层拒绝。</p></details>

<details><summary>JWT载荷里写了admin，为什么还不能信任？</summary><p>必须验证签名与适用约束，并确认权限是否仍有效；客户端解码出的字符串不是服务端授权依据。</p></details>

<details><summary>删除浏览器Cookie为什么不是完整退出验证？</summary><p>服务端记录可能仍有效。应保存旧Cookie，在合法退出后重放，确认受保护访问被拒绝。</p></details>
