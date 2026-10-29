# 第7讲资料导读与验证范围

核查日期：2026-10-29。围绕本课案例独立编写，不把不同框架、存储或错误格式直接拼接。

| 优先级 | 官方来源 | 阅读与本课用途 |
|---|---|---|
| ★★★★★ | [Helsinki FSO Part2c](https://fullstackopen.com/en/part2/getting_data_from_server/) | Promise、Effect与获取数据；本课采用fetch，不复制Axios/JSON Server工程 |
| ★★★★★ | [Helsinki FSO Part2d](https://fullstackopen.com/en/part2/altering_data_in_server/) | 提交、服务模块与失败处理；本课独立Express API和未知写入结果场景 |
| ★★★★★ | [React同步Effect](https://react.dev/learn/synchronizing-with-effects) | 清理、依赖、失效结果与开发检查 |
| ★★★★★ | [React不必使用Effect的情况](https://react.dev/learn/you-might-not-need-an-effect) | 用户写入放在事件处理，派生显示不滥用Effect |
| ★★★★★ | [MDN Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) | Response、ok、内容类型与读取；HTTP错误不自动等于Promise拒绝 |
| ★★★★☆ | [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) | 传输取消，不推断服务器事务回滚 |
| ★★★★★ | [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) | 来源、预检、凭据与Expose-Headers；不等于认证授权 |
| ★★★★☆ | [Vite代理](https://vite.dev/config/server-options.html#server-proxy)、[环境变量](https://vite.dev/guide/env-and-mode.html) | 已有Vite项目的对照配置；本实验实际使用Node代理与esbuild，未安装Vite |

本机已有FSO素材保留原状，不重复下载。本次只链接和重新解释所需内容，不转载整篇教程。外部课程、文档、商标与依赖许可分别适用，不推定公开阅读等于任意再分发。

## 关键事实与实现约定

| 内容 | 依据/实现 | 范围 |
|---|---|---|
| fetch通常不会因4xx/5xx自动拒绝 | MDN Fetch | 主动检查response.ok |
| Effect读取与提交事件分开 | React官方教程 | 本例查询用Effect，创建用onSubmit |
| 取消与当前性检查分别处理 | React/AbortController与latest.mjs | 模块还验证忽略signal时旧结果不发布 |
| CORS是浏览器读取控制 | MDN与server/lab.mjs | Node检查头部不能证明浏览器强制行为 |
| 写入后响应中断，代理502 | 明确故障注入与真实HTTP检查 | 本例的一种复现，不表示所有502都已经写入 |
| 默认5秒客户端超时 | client/api.mjs的教学策略 | 不是通用生产推荐值，也不是HTTP408 |

## 版本与已验证范围

独立实验锁定Express5.3.0、React/React DOM19.3.0、esbuild0.25.12，沿用本课程已用版本；运行环境Node20.18。实现导入express-basics原路由与存储，不修改其业务，建立独立样本。

本次8项测试、React构建与6组自动演示通过。真实HTTP覆盖代理查询/写入、失败分类、坏JSON与坏结构、响应中断后已保存、错误前后数据、204无内容与CORS头。最新请求模块还以可控Promise验证不响应abort的旧结果与旧错误都不发布。

浏览器访问工具本次不可用，未声称已完成浏览器交互、跨源强制、断网恢复或响应式实测。浏览器观察步骤保留在课堂练习与WORKSHEET中，需分别记录。生产反向代理、真实数据库、登录凭据、幂等创建和海量请求也未在本实验验证。

## 与其他实验的衔接

- 第5讲api-design-tools提供OpenAPI与类型生成；本例另做轻量运行时检查，不把静态类型当作响应保证。
- 第6讲数据库路线可替换存储；当前重启清空不能用来证明持久化。
- course-lab含会话/CSRF；此处无账号请求函数不能直接替代它。
- Next.js现有/remote为只读对照，本次没有把本地UI操作描述为自动更新服务器缓存。
