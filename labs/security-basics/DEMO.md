# 第8讲九幕演示运行说明

从课程根目录：

```bash
cd labs/course-lab
npm ci --ignore-scripts
npm run security:demo
```

每幕先预测，再按回车执行。自动模式：

```bash
npm run security:demo:auto
```

自动生成相邻security-basics/demo-output/report.html与report.json，终端给出相对路径。教材服务已启动时可访问 `/labs/security-basics/demo-output/report.html`。示例报告在demo-example/report.html，保留本次真实执行结果供对照，不代表你的环境已通过。

## 九幕与预期

1. 匿名有CSRF，创建401且数量不变。
2. 登录200，会话与CSRF轮换，旧匿名Cookie访问401。
3. 本人创建201、修改200。
4. alice修改bob为403，原对象不变。
5. 夹带owner/role仍201，但保存归属为alice、无角色升级。
6. 旧/他人CSRF为403 CSRF；错误Origin为403 ORIGIN；数量不变。
7. 管理员修改bob为200，owner仍为bob。
8. 标题保留HTML标记字符串，React文本插值转义。
9. 退出204，重放旧Cookie为401。

完整解释在教材 `#/part/8/g`，源码为course-lab/scripts/security-demo.mjs。

## 与已有探测脚本的区别

security:demo每次创建独立内存服务，使用随机本机端口、临时练习口令和全新样本；不读.env，不修改已有课程服务数据，结束关闭服务。Node客户端在进程内保存凭据，但终端与报告不输出实际值。

security:probe则连接已经运行的本机course-lab并使用.env账号，会向那个服务新增练习记录。需要稳定复现九幕时优先用demo。

自动报告会覆盖上次本机demo-output，目录已忽略；demo-example是版本化示例，不受运行命令影响。全部演示数据是临时夹具，不代表数据库持久化或生产认证能力。

## 验证

course-lab中执行 `node --test tests/security-demo.test.mjs`，验证自动演示连续运行两次都通过、初始样本一致、报告不含凭据且正确转义。既有 `npm run test:security`仍运行9项认证边界测试；`npm run check`还包括综合实验与React构建。

真实浏览器SameSite/CORS/Secure、数据库会话和生产HTTPS不在本脚本验证范围。脚本只验证本机真实HTTP、当前内存业务规则和React服务器文本输出。
