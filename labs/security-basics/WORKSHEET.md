# 第8讲操作记录

本表为待填写清单，不表示已在你的浏览器全部通过。Node测试不模拟浏览器全部安全策略。

| 步骤 | 应观察结果 | 实际结果 |
|---|---|---|
| 匿名GET/session | user为空且取得匿名CSRF | 待填写 |
| 有效匿名CSRF创建 | 401 UNAUTHENTICATED，无新增 | 待填写 |
| 登录后比较会话 | Cookie和CSRF更新，不记录实际值 | 待填写 |
| 新Cookie配旧CSRF | 403 CSRF | 待填写 |
| 另一会话的CSRF | 403 CSRF，无新增 | 待填写 |
| 正确令牌配错误Origin | 403 ORIGIN，无新增 | 待填写 |
| 伪造owner/role创建 | owner仍为当前用户，无role写入 | 待填写 |
| alice修改bob | 403 FORBIDDEN，原记录未变 | 待填写 |
| 同样请求修改本人 | 200，目标字段正确 | 待填写 |
| 缺少CSRF退出 | 403，登录会话仍有效 | 待填写 |
| 有效退出后旧Cookie重放 | 401 | 待填写 |
| 标题含无脚本HTML标记 | 浏览器按文字显示 | 待填写 |
| 观察Cookie属性 | HttpOnly、SameSite，本机Secure配置 | 待填写 |

复现信息只保留方法、路径、状态、错误码、数据变化与相关源码位置；不要粘贴口令、完整Cookie、CSRF或API密钥。

另列未验证项：生产HTTPS、真实浏览器SameSite/CORS场景、数据库会话过期、多实例共享、限流/MFA等。未做的检查保留未验证，不用相近结果代替。
