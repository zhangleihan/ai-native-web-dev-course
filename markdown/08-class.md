# 实践练习：登录、越权与会话失效

## 先运行九幕综合演示

从课程根目录执行：

```bash
cd labs/course-lab
npm ci --ignore-scripts
npm run security:demo
```

按回车逐幕观察匿名写入、会话轮换、本人修改、对象越权、伪造归属、CSRF与来源、管理员修改、文本转义和退出失效。每幕先预测，再检查实际状态与数据。约20–25分钟，完整解释见[九幕综合演示](#/part/8/g)。

自动模式用 `npm run security:demo:auto`，生成相邻security-basics/demo-output中的HTML与JSON报告；也可[打开实际示例报告](labs/security-basics/demo-example/report.html)。演示自行启动随机本机端口，不需要.env、数据库或已有3001服务，结束即丢弃本次数据。以下步骤用于继续阅读源码、浏览器观察和已有服务练习。

## 输入与准备

使用Node20.18+，从课程根目录进入labs/course-lab，执行npm ci --ignore-scripts、node scripts/init-env.mjs、npm run dev。以本机.env中的LAB_PASSWORD登录alice、bob或admin，不使用真实账号或业务材料。

配套资料位于labs/security-basics。自动测试在随机端口建立隔离账号，不要求先启动固定端口服务；手工探测需要已有本机课程服务。

## 步骤一：标注身份流向

打开server/app.mjs和client/api.js，依次找到GET /session、CSRF写请求检查、POST /login、login中间件、创建案例和POST /logout。说明Cookie、会话、csrf和公开user对象分别存在哪里。

## 步骤二：观察登录与退出

在浏览器Network中检查session和login，观察登录后Set-Cookie与csrf变化。记录Cookie属性名称，不复制或提交实际值。退出后确认204与匿名user；只清空React界面不算完成服务端失效验证。

## 步骤三：完成权限矩阵

alice修改自己的案例应成功，修改bob案例应为403；管理员可修改bob案例。综合实验的PATCH需要完整title、industry、difficulty，缺字段400不能作为授权测试证据。保存拒绝前后的bob对象，确认没有副作用。

创建时夹带ownerId与role，实际owner仍应为当前服务端用户，role不会写入。此实验忽略额外字段，不是以400拒绝它们，应按实际契约检查。

## 步骤四：分别测试CSRF和认证

先GET /session，再匿名创建，预期401；缺少或换成另一会话CSRF时403；使用有效令牌但错误Origin时403。分别记录error.code，解释哪个检查先执行。

## 步骤五：使用配套自动验证

在course-lab执行 `npm run test:security`，新增9项检查包括旧会话、旧CSRF、跨会话令牌、角色变化、归属、Cookie篡改、退出、过期和React文本转义。

已有服务运行时，在另一个终端执行 `npm run security:probe`。脚本从.env读取练习配置，打印通过项，不输出凭据；会新增一条明确标注的练习案例，并验证没有改动bob原记录。重复运行会继续增加练习记录，适合默认内存测试环境。

## 步骤六：观察文字输出边界

把无脚本的 `<strong>课堂标记</strong>` 作为练习标题，确认React按文字显示，而不是当成HTML标签渲染。自动测试仅验证React服务器文本转义，浏览器DOM、SameSite、CORS与生产HTTPS需要各自记录。

## 结果记录

| 检查 | 前提 | 实际状态/错误码 | 数据是否改变 |
|---|---|---|---|
| 匿名写入 | 有效匿名CSRF | 自行填写 | 自行填写 |
| 修改他人案例 | 有效登录与CSRF、合法字段 | 自行填写 | 自行填写 |
| 错误来源 | 有效Cookie和令牌 | 自行填写 | 自行填写 |
| 退出后旧Cookie | 原会话已销毁 | 自行填写 | 自行填写 |

提交源码定位、上述记录与一个误判修正过程，例如“原以为验证授权，实际被CSRF提前拒绝”。证据中移除口令、完整Cookie、CSRF值与真实用户信息。
