# 第8讲：认证与授权配套实验

复用相邻course-lab的实际登录、会话和资源授权，不再维护另一套账号系统。此目录提供请求客户端、探测脚本、权限表与阅读资料；新增测试位于course-lab/tests/auth-boundaries.test.mjs。

## 推荐：可重复的课堂九幕演示

从课程根目录执行：

```bash
cd labs/course-lab
npm ci --ignore-scripts
npm run security:demo
```

每幕先预测，再按回车观察真实API结果。自动执行及生成网页报告用 `npm run security:demo:auto`。使用独立内存数据与随机本机端口，不读.env、不依赖数据库或已有服务；结束后关闭服务，重复运行恢复新样本。

完整步骤见[演示指南](DEMO.md)，可直接打开[实际执行的示例报告](demo-example/report.html)。本次新报告保存在demo-output/report.html和report.json，目录已被Git忽略；示例报告不会被覆盖。下述原有探测方式用于已有服务，会新增练习记录，两者分别使用。

## 启动

从课程根目录执行：

```bash
cd labs/course-lab
npm ci --ignore-scripts
node scripts/init-env.mjs
npm run dev
```

浏览器 http://127.0.0.1:3001 ，练习账号alice、bob、admin，口令取本机.env的LAB_PASSWORD。初始化不会覆盖已有.env。默认内存模式重启恢复样本，生产认证未在此完整实现。

## 自动测试

不需要启动固定端口服务即可执行：

```bash
npm run test:security
```

9项测试分别使用隔离数据，覆盖登录失败、轮换、CSRF绑定、角色变化、资源归属、Cookie篡改、退出、过期与React文本转义。`npm run check`会运行全部综合实验测试并构建React。

## 手工探测

保持本机课程服务运行，在另一个终端从course-lab执行：

```bash
npm run security:probe
```

读取.env中的PUBLIC_ORIGIN与LAB_PASSWORD，只允许本机HTTP地址。不输出Cookie、CSRF或口令。会创建1条“第8讲权限验证记录”，检查错误来源与越权写入被拒绝，然后退出；重复运行会新增记录。用于可新增测试记录的本机实验，默认内存模式重启可恢复固定样本。

客户端client.mjs显式维护Cookie，便于Node测试；它不是通用浏览器Cookie实现，也不执行SameSite/CORS/Secure策略。probe验证服务器拒绝逻辑，浏览器行为按WORKSHEET另行验证。

## 已实现机制与范围

- 服务端会话、登录轮换、CSRF绑定、来源校验、服务端owner和角色、退出销毁。
- 综合实验PATCH需要全部三个可写字段；创建请求的额外owner/role被忽略，归属由服务端生成。
- 自动测试使用内存会话与内存业务数据。React测试为服务器文本转义，不是完整浏览器XSS测试。
- 没有新增登录限流、MFA、找回口令、全设备撤销或生产HTTPS配置。

权限矩阵见PERMISSIONS.md，操作记录见WORKSHEET.md，来源和核查范围见READING_GUIDE.md。
