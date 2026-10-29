# 第9讲资料导读与核查记录

核查日期：2026-10-28。以本课程可运行代码为主线，参考以下官方资料重新编写，不转载整篇文档或第三方项目。课程、商标、文档与依赖分别遵守原版权及许可；公开访问不代表整套内容可任意再分发。新增实验为本课独立实现。

## 指定阅读与用途

| 优先级 | 官方来源 | 阅读范围 | 对应内容与限制 |
|---|---|---|---|
| ★★★★★ | [WHATWG HTML：Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html) | EventSource interface、Last-Event-ID、event stream parsing | 9/d、9/e，核查UTF-8、字段、自动重连与位置；业务done/reset由本课定义 |
| ★★★★★ | [MDN：Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) | 接收、发送、命名事件、关闭与事件格式 | 9/d入门；不把示例解释为持久队列 |
| ★★★★★ | [React：useEffect](https://react.dev/reference/react/useEffect) | Connecting to an external system、依赖、清理、StrictMode检查 | 9/e；React API说明，不提供本课后端恢复协议 |
| ★★★★☆ | [Node20 HTTP](https://nodejs.org/docs/latest-v20.x/api/http.html#responsewritechunk-encoding-callback) | response.write、drain、flushHeaders、response close | 9/d、9/f；write false不是业务帧丢失 |
| ★★★★☆ | [MDN：Using readable streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams) | Response.body、reader与读取循环 | 9/f进阶；流读取本身不等于SSE帧解析 |
| ★★★★☆ | [Nginx代理模块](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering) | proxy_buffering、X-Accel-Buffering、proxy_read_timeout | 9/f部署排错；本次未部署实际Nginx |
| ★★★☆☆ | [MDN：WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) | 双向通信与API概览 | 9主节方案比较；本课未新增WebSocket实现 |

本机已有Full Stack Open资料继续用于React、Express和测试先修。本次没有把其普通HTTP教程写成SSE专门教程，也没有重复下载整套素材。

## 关键事实与实现约定

| 内容 | 依据 | 适用范围 |
|---|---|---|
| EventSource使用GET、具备close与连接状态 | WHATWG接口与处理模型 | 原生浏览器API；不支持任意自定义请求头 |
| id与Last-Event-ID表达恢复位置 | WHATWG | 服务器仍须实现历史查询；新对象不继承旧对象内部状态 |
| 帧按空行分隔，文本UTF-8 | WHATWG/MDN | 不能把网络chunk当作完整事件 |
| Effect清理与依赖变化配对 | React | 页面切换与卸载须关闭旧订阅 |
| write false后等待drain | Node HTTP | 缓冲压力，不是刚写帧需要再次发送 |
| reset、done、after、6条历史 | 本实验源码 | 独立教学协议，不是SSE统一业务标准 |
| 服务端终态不会倒退、取消幂等 | tasks.mjs与HTTP验证 | 单进程内存样本，不包含外部副作用撤销 |

## 版本与验证范围

实验依赖锁定Express5.2.1、React/React DOM19.3.0与esbuild0.25.12，沿用本课程已经使用的版本。命令要求Node20.18+；官方Node20文档页面可能随补丁版本变化，不因此更新项目依赖。

本次在Node20.18环境完成独立npm ci、8项自动化测试、React构建和6组真实HTTP演示。浏览器抽检正常任务，页面显示6/6、事件#1–#8与“本次订阅已结束”。其余自动场景由Node HTTP验证，不能视为所有浏览器交互均完成验证。

尚未验证：真实模型、持久化队列、跨进程一致性、外部取消确认、Nginx/云网关部署、海量连接、强制背压压力测试与不同浏览器的断网恢复。没有把示例的5秒心跳和1秒重连提示视为生产统一推荐值。

## 与course-lab的边界

本次检查course-lab/server/app.mjs及client/main.jsx：已有events使用登录与run归属、Last-Event-ID及trace；done可能在终态或30秒订阅期限发送，客户端网络错误后关闭并提示刷新。新实验不改其审批业务，而以独立接口讲解取消、有限历史与手动续传。
