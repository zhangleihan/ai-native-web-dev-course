# 浏览器安全：区分XSS、CSRF、同源与凭据

## 1. 先分清“谁发请求”和“谁能读结果”

浏览器执行脚本、保存Cookie并执行同源限制。服务器接收的请求不一定经过自己的React页面，因此安全设计需要理解浏览器机制和服务器规则各自的职责。

同源通常要求协议、主机和端口相同。127.0.0.1:3001与127.0.0.1:3002是不同源；localhost与127.0.0.1也不能随意混用。同站（same-site）依据站点定义，通常不以端口区分，并考虑协议，因此同站不一定同源。[MDN同源策略](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy)

Cookie作用域也不按端口隔离。不要认为给本机服务换一个端口，就建立了完整的身份隔离。

## 2. XSS：不可信数据被解释为代码

跨站脚本（XSS）的关键是应用把不可信输入放进可执行上下文。例如案例标题本应展示文字，却经innerHTML作为HTML插入。攻击脚本随后可能以当前站点权限读取页面信息或发起操作。

来源可以是保存到数据库的标题、URL参数或其他接口内容。数据来自自己的后端也不意味着它可信，因为最初可能由其他用户提交。

```javascript
// 不可信标题按文本插入。
node.textContent = title;
```

React正常文本插值同样会进行相应转义：

```jsx
<h3>{item.title}</h3>
```

危险边界通常出现在绕过文本插值的HTML插入、字符串模板生成脚本、未限制URL方案或富文本渲染等位置。不同输出上下文需要不同处理，不能对所有内容只执行一次“去掉尖括号”。[OWASP XSS防护](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

## 3. 转义、输入校验与富文本清洗

输入校验检查标题类型和长度，不能证明字符串适合当HTML执行。输出转义让特殊符号显示成文字；富文本清洗则在允许部分HTML的前提下限制标签、属性和URL。

普通标题直接文本展示即可。确需富文本时，采用维护中的清洗方案并定义允许范围，不自行用几条正则表达式处理所有HTML。CSP可作为额外防线，不替代正确输出处理。

新增测试使用React服务器渲染确认标签文本被转义；它没有运行真实浏览器或证明所有页面都没有XSS。手工练习可保存无脚本的 `<strong>课堂标记</strong>` 作为标题，确认页面显示原文字而非加粗HTML，并检查对应DOM。

数据库参数化只保护SQL结构，不会自动清洗网页输出；API以JSON返回字符串，也不意味着消费该字段的页面一定安全。

## 4. HttpOnly能做到什么

HttpOnly让普通页面脚本不能通过document.cookie直接读取相应Cookie。它不阻止浏览器在符合条件的请求中自动携带Cookie，因此同源XSS仍可能借当前身份调用接口或读取可访问数据。

Secure限定Cookie在适用的安全传输条件下发送；SameSite控制部分跨站携带行为；二者都不是内容净化或资源授权。[MDN Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)

本课HTTP回环实验默认secure=false，便于本机演示。真实HTTPS部署、代理信任和Secure配置需要一同验证；不能只复制一个secure:true就声称代理后的登录必定正确。

## 5. CSRF：借浏览器自动携带身份

跨站请求伪造（CSRF）利用浏览器对目标站点自动附带凭据的行为，诱导用户执行并非本人意图的操作。攻击者不一定需要读取响应，能导致业务数据改变就可能造成影响。

假设用户已登录案例站点，其他站点试图诱导浏览器提交修改请求。服务器若只检查Cookie中有登录会话，可能把这个请求当成用户本意。

本课不搭建外部攻击网站，使用自己的测试客户端构造错误来源或缺失令牌的请求，验证服务器拒绝及没有副作用。它验证服务端检查，不等于验证所有真实浏览器的跨站行为。

## 6. 跟踪现有同步令牌方案

实验中GET /api/session为会话准备随机CSRF值。前端从JSON取出，并在写请求的X-CSRF-Token头发送；服务器将它与当前会话绑定值比较。

```javascript
// 已建立会话后的源码片段。
if (req.headers.origin && req.headers.origin !== publicOrigin) {
  fail(403, 'ORIGIN', '请求来源不允许');
}
if (!equal(req.headers['x-csrf-token'], req.session.csrf)) {
  fail(403, 'CSRF', '请刷新登录状态后重试');
}
```

equal会先检查类型、长度和十六进制格式，再使用恒定时间比较函数。关键是令牌不可随便猜出且绑定当前会话，不能只检查“存在某个自定义Header”。登录会重新生成令牌，退出销毁该会话。[OWASP同步令牌方案](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

本课允许没有Origin但CSRF有效的非浏览器客户端请求；存在Origin且不匹配则拒绝。源校验是附加层，不是服务器认为Origin字段可以证明任何HTTP客户端的身份。curl或Node可以自行构造该头，认证仍依赖有效会话。

## 7. SameSite为什么不能单独包办CSRF

SameSite=Lax会限制部分跨站Cookie携带，但仍存在允许的导航等情境；同站的其他源也不必然被视为跨站。改变状态的操作不应使用GET。

本实验使用SameSite、来源和同步CSRF值共同防护，不能用其中一项测试替代其他项。若同源XSS已经存在，恶意脚本可能取得CSRF值或执行同源操作，所以CSRF与XSS必须分别处理。

Bearer令牌若由脚本显式附到Authorization头，经典自动Cookie型CSRF的条件会不同；若把JWT放入自动发送的Cookie，仍要重新分析CSRF。防护取决于凭据如何携带，而不是令牌名字。

## 8. CORS不是登录或防火墙

CORS控制浏览器是否允许脚本跨源读取响应，并对部分请求先做预检。它不阻止所有跨站请求被发送，也不能阻止命令行客户端直接请求API。[MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

因此“未配置CORS”不代表所有写接口自动安全；“允许CORS”也不代表任何人都被授权。跨源凭据请求、预检和响应许可要按第7讲的配置理解，同时保留认证与资源授权。

本课综合实验页面与API同源，默认没有跨源许可。Node测试不执行浏览器CORS与SameSite规则，必须在真实浏览器补测相应行为。

## 9. 凭据与配置不进入前端包

数据库连接串、SESSION_SECRET、模型API key放在后端配置中。React构建时嵌入的变量、页面源码、网络响应或source map都可能被客户端读取，前端环境变量名称本身不构成秘密保护。

HTTPS保护传输链路，不替代后端权限、口令散列或输出转义。日志应避免记录密码、完整Cookie、CSRF值及Authorization令牌；出现问题时提供状态码、错误类型与必要请求标识即可。

需要分享复现证据时，保留方法、路径和非敏感字段，移除凭据。第8讲探测脚本只打印通过项，不打印口令、Cookie或CSRF值。

## 10. 组合判断常见现象

| 现象 | 先检查 | 不能直接推断 |
|---|---|---|
| 登录200后创建403 | 是否采用登录返回的新CSRF | 会话一定无效 |
| 前端跨源失败，Node成功 | CORS、凭据与地址 | 后端授权已经充分 |
| Cookie有HttpOnly | 直接脚本读取受限 | 所有XSS已消除 |
| 输入里的标签被JSON原样返回 | 消费页面如何渲染 | API应该一律删除字符 |
| 跨用户修改403 | 错误码与拒绝层、数据变化 | 已覆盖其他管理接口 |
| 清空user后还能用旧Cookie请求 | 服务端会话是否销毁 | 前端退出已足够 |

## 自检与参考答案

<details><summary>SQL参数化成功，为什么页面仍可能出现XSS？</summary><p>参数化保护SQL解释边界，页面输出属于另一个解释上下文。用户字符串仍需按文本或经过正确清洗后渲染。</p></details>

<details><summary>为什么CORS限制读取响应，仍不能代替CSRF？</summary><p>有些跨站请求可以发送，攻击效果可能来自业务副作用而非读取响应；自动携带凭据的写操作仍需防护。</p></details>

<details><summary>复制bob的CSRF给alice请求为什么应失败？</summary><p>令牌绑定会话，alice的Cookie对应自己的服务端值，不能用另一会话令牌满足检查。</p></details>
