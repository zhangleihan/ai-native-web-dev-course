# 同源代理、CORS与联调：从浏览器现象定位问题

## 1. 来源由协议、主机和端口共同决定

| 页面与请求 | 是否同源 | 原因 |
|---|---|---|
| http://127.0.0.1:3031页面→/api/cases | 是 | 浏览器先请求同一3031 |
| 同一页面→http://127.0.0.1:3030/api/cases | 否 | 端口不同 |
| localhost:3031页面→127.0.0.1:3031 | 否 | 主机名不同 |
| https页面→同主机的http接口 | 否 | 协议不同，还可能涉及混合内容限制 |

源不按文件夹区分。把项目代码移到同一Git仓库，不会让两个端口自动变成同源。磁盘file页面也不是本实验的HTTP来源，应通过启动命令打开。

## 2. CORS决定浏览器是否允许脚本读取跨源响应

CORS是Cross-Origin Resource Sharing，即跨源资源共享。服务器通过响应头表达允许的来源与条件，浏览器据此控制读取；它不是用户身份、数据库权限或防火墙规则。[MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

curl、Node和服务器之间的请求不会像浏览器页面一样执行该读取限制。因此“curl拿到200”不能证明浏览器也能读；反过来，浏览器报CORS也不等于后端完全没有收到请求。

## 3. 简单请求与预检

符合条件的跨源请求可以直接发送，然后由浏览器检查响应读取许可。JSON POST、自定义X-Lab-Scenario头等通常会使浏览器先发OPTIONS预检，询问目标是否允许该方法和请求头。

```text
浏览器页面3031
  → OPTIONS API3030：允许POST与Content-Type吗？
  ← 允许指定来源、方法、头部
  → POST API3030：发送JSON
  ← 业务结果及对应跨源响应头
```

不是所有GET都无需预检，也不是所有POST都有预检；要看方法、头部与内容类型。HTTP OPTIONS出现在Network中通常是协议行为，不是React莫名执行了两次业务提交。

## 4. 三种实际路径对照

从3031实验页面选择“请求路径”：

| 模式 | 请求去向 | 预期 |
|---|---|---|
| 同源/api，经开发代理 | 页面3031/api→服务器转发3030/api | 浏览器同源，可读 |
| 跨源直连，开放给本页面 | 浏览器直接3030/api | 服务器允许当前实验页面来源，可读 |
| 跨源直连，未开放读取 | 浏览器直接3030/no-cors/api | 无跨源读取许可；浏览器应阻止脚本读取 |

未开放入口只是本次公开内存API的另一个挂载地址。Node自动测试仍可读取其200和数据，正好说明CORS不是服务器鉴权。使用浏览器做实际对照时，保留Console与Network证据；Node只检查响应头，不能替代浏览器强制行为验证。

读取场景不是normal时，实验会发送自定义故障头，直连模式可能增加预检。先用正常读取对照，再加入故障，避免同时改变多个条件。

## 5. 正确配置需要具体对应

本例只对实际启动的实验页面来源与API自身来源开放对应许可；没有为任意网页返回通配许可。响应中可观察：

```text
Access-Control-Allow-Origin: http://127.0.0.1:3031
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, X-Lab-Scenario
Access-Control-Expose-Headers: X-Request-Id
Vary: Origin
```

方法和头部许可在预检响应中给出；Expose-Headers让脚本在跨源时读取请求编号。正常响应仍需合适的Allow-Origin。根据请求来源动态返回允许值时，相关缓存还需正确区分Origin。

这些是本实验无账号方案的响应示意，不是任何应用都应照搬的通用配置。写入口还检查Origin；它仍不构成完整认证或CSRF机制。

## 6. Cookie与跨源凭据另外处理

本讲没有登录，fetch采用默认凭据行为。若后续跨源发送Cookie，前端需按需要配置credentials，服务器需匹配具体来源与允许凭据等要求，还要考虑Cookie的域、路径、SameSite与Secure，以及浏览器对第三方Cookie的限制。

不能把Allow-Origin设为*再假定带Cookie也通用可读。CORS配置成功也不代表已防止CSRF；第八讲会分别建立身份、会话与写请求防护。

不要设置`mode: 'no-cors'`来“修好”JSON接口。它会使响应受到不透明等限制，脚本无法按普通JSON读取；关闭浏览器安全功能也不是项目配置方案。

## 7. 开发代理在哪里起作用

```text
浏览器 → 前端服务3031/api/cases
                     ↓ 代理转发，浏览器看不到第二段内部请求
                API服务3030/api/cases
```

代理将页面和/api放在同一入口，减少开发时的跨源配置。它不会改变API的资源授权要求，也不自动成为生产部署配置。实验代理保留方法、路径、查询与请求体，并在后端连接失败时返回可识别的502。

已有Vite项目可在其vite.config.js中配置类似代理；这是Vite对照示例，不是本实验实际使用的配置文件：

```javascript
import {defineConfig} from 'vite';
export default defineConfig({
  server: {
    host: '127.0.0.1',
    proxy: {'/api': {target: 'http://127.0.0.1:3030', changeOrigin: true}}
  }
});
```

Vite的server.proxy用于开发服务器；打包后的静态文件不会自动携带一台代理服务器，部署时仍需配置反向代理、同源API或明确的跨源方案。[Vite server.proxy](https://vite.dev/config/server-options.html#server-proxy)

## 8. 前端配置不应保存秘密

API地址是可公开配置，数据库连接口令或模型密钥不是。Vite的VITE_变量会暴露给客户端代码；把变量移到.env并不会让这些值在浏览器里保密。[Vite环境变量](https://vite.dev/guide/env-and-mode.html)

本实验的/lab-config.json只返回本机API地址。不同构建工具读取环境变量的方式不同，不能把Vite的import.meta.env语法直接当作所有esbuild或Next.js项目的通用入口。

## 9. 按层联调

| 现象 | 决定性检查 | 下一步 |
|---|---|---|
| 请求没出现 | 点击是否触发，表单是否被HTML校验阻止 | 查事件处理与输入 |
| 地址指向8766 | 查看Request URL | 区分教材、页面代理与API端口 |
| 连接拒绝 | curl健康接口也不通 | 查进程与端口 |
| 页面代理502 | 检查后端是否运行、响应是否中断 | 用实际API地址单独核对 |
| 400/422 | 看响应字段和请求体 | 按对应后端契约修正，不靠换状态码解决 |
| 200但解析失败 | 看Content-Type和原始Response | 排查HTML回退页或坏JSON |
| 200但items无法渲染 | 检查字段类型与版本 | 加运行时数据检查 |
| curl成功，页面读不到 | 看Origin、预检与响应头 | 核对CORS；别先修改数据库 |
| 新筛选显示旧数据 | 比较查询条件、完成顺序与代次 | 清理失效读取，阻止旧结果发布 |
| 保存错误但记录已出现 | 对照requestId与列表/详情 | 结果未确认时先核对，避免重复POST |

先保存一条最小失败请求，每次只改变一个条件。禁止用“统一返回空数组”或“所有错误一律提示网络错误”掩盖定位线索。

## 检查点

<details><summary>代理转发到另一个端口，为什么浏览器仍然可以同源读取？</summary><p>浏览器访问的是页面服务上的/api；第二段由服务器转发。浏览器看到的入口仍是同一来源。</p></details>

<details><summary>看到OPTIONS与POST，是否表示创建执行了两次？</summary><p>不是。OPTIONS通常是预检，POST才是业务请求；应分别看方法与副作用。</p></details>

<details><summary>为什么CORS失败不一定表示请求没有到服务器？</summary><p>某些请求可以先发送，再由浏览器阻止脚本读取；预检被拒绝时也可能不发送实际业务请求。需要结合具体请求类型判断。</p></details>
