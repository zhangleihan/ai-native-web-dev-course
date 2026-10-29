# 第8讲资料导读：认证、授权与浏览器安全

核查日期：2026-10-28。正文围绕本课程源码重新编写，外部资料用于概念与机制核查，不直接拼接不同框架或不同版本的登录实现。

## 官方课程与教学主线

| 优先级 | 来源 | 指定阅读 | 对应本课 |
|---|---|---|---|
| ★★★★★ | [Helsinki Full Stack Open User Administration](https://fullstackopen.com/en/part4/user_administration/) | 用户、密码散列、用户与资源关联 | 8主节及8/d、8/e；本课用会话和关系存储作独立实现 |
| ★★★★★ | [Helsinki Full Stack Open Token Authentication](https://fullstackopen.com/en/part4/token_authentication/) | 登录、受保护操作、令牌失效问题 | 身份传递与JWT比较，不要求额外实现JWT登录 |
| ★★★★☆ | [Harvard CS50 Web Lecture8 Notes](https://cs50.harvard.edu/web/notes/8/) | Security、HTTPS、Databases、APIs、JavaScript、CSRF | 8/f；理解不同解释与信任边界 |
| ★★★★☆ | 本机FSO离线markdown/part4c.md、part4d.md | Creating users、Limiting creating new notes、Problems of Token-based authentication | 对照用户归属与失效设计，不混用MongoDB示例和本课SQL模型 |

## 机制与规范

| 来源 | 用途与版本边界 |
|---|---|
| [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) | 登录失败、口令验证、重新认证及自动化攻击；本课没有完整限流和MFA |
| [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) | 专用慢散列、盐、Argon2id/bcrypt区别；不将演示bcrypt参数作为新项目统一推荐 |
| [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) | 会话标识、轮换、期限、服务端失效 |
| [express-session](https://expressjs.com/en/resources/middleware/session/) | 会话数据位置、Cookie选项、regenerate/destroy与MemoryStore边界 |
| [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | 最小权限、默认拒绝、每次请求与对象授权 |
| [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) | 同步令牌、来源与纵深防护；XSS可能破坏CSRF防线 |
| [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) | 输出上下文、转义、安全文本与富文本边界 |
| [MDN Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies) | 浏览器携带、属性与作用域 |
| [MDN Same-origin](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy) | 源的定义与浏览器隔离 |
| [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) | 读取许可、预检与凭据；不等于服务端授权 |
| [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) | 额外浏览器防线，尚未为实验部署完整策略 |
| [RFC8725 JWT BCP](https://www.rfc-editor.org/rfc/rfc8725.html) | 算法、签名与声明验证，签名不代表载荷保密 |
| [OAuth2授权框架](https://www.rfc-editor.org/rfc/rfc6749.html) | 只用于理解委托授权概念，不据此照搬历史流程实现 |
| [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html) | 身份层与OAuth区别；本课未接入第三方身份提供方 |

## 实际源码定位

| 文件，相对于course-lab | 已核查内容 |
|---|---|
| server/app.mjs | session/CSRF/Origin顺序、登录轮换、注销、req.user与受保护路由 |
| server/domain.mjs | 可写字段、公开用户信息、运行读取与状态规则 |
| server/fixtures.mjs | 隔离账号、随机练习口令的散列、固定样本归属 |
| server/memory-store.mjs | owner/admin检查与内存生命周期 |
| server/pg-store.mjs | 条件UPDATE、运行授权与事务；服务环境另测 |
| server/start.mjs | 内存或PostgreSQL会话存储选择 |
| client/api.js | 从响应更新CSRF，写请求附加头 |
| client/main.jsx | 服务端会话恢复、登录/退出、标题文本插值 |
| tests/api.test.mjs | 原有认证、越权、CSRF与退出检查 |
| tests/auth-boundaries.test.mjs | 新增9项边界用例 |
| scripts/security-demo.mjs | 九幕真实请求、独立数据、逐幕暂停与报告 |
| tests/security-demo.test.mjs | 两次重跑、预期拒绝、报告脱敏及HTML转义 |

## 已验证与待验证

2026-10-28在Node20.18环境验证新增9项测试；综合实验全部27项测试及React构建通过。探测脚本另在隔离本机服务执行，新增一条练习记录，bob原记录未变，最后退出失效。没有将用户真实口令或会话输出为验证记录。

新增测试使用内存会话和业务数据。React测试通过服务器渲染验证文本插值，不是完整浏览器XSS测试；Node请求不执行浏览器SameSite/CORS/Secure策略。真实浏览器、生产HTTPS、代理、数据库会话过期、多实例共享与身份提供方尚未验证。

登录失败消息相同不代表时序不可区分，现有演示没有完整限流、MFA、找回口令或全设备撤销。cookie.maxAge不自动等同于完整闲置/绝对期限策略。教材明确这些范围，不将参考实现称为生产认证系统。

外部讲义、文档与代码保留原署名和许可，公开阅读不等于无限再分发。本目录只提供链接、定位与本课独立测试，不复制整套第三方课程或密码学实现。

## 课堂演示补充验证

2026-10-28新增九幕综合演示，复用本课程Express API、内存存储与会话机制；没有复制第三方认证工程。Node20.18环境下全部28项测试与React构建通过，九幕自动执行通过。集成测试连续运行两次，检查初始状态重新建立、预期拒绝、数据不变和报告不含实际凭据。逐幕模式用于终端交互，网页为静态执行记录。版本化demo-example报告来自一次真实执行；本机新报告写入被Git忽略的demo-output。
