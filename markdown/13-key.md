# 服务端模型、JSON Schema 与流式输出

FSO Part 8 的 GraphQL 教训：**客户端按 schema 要字段，服务器决定能给什么。** LLM 的输出 JSON Schema 与此同类。Copilot 必须在 **api 进程** 调用模型，密钥不出浏览器。

## 产品角色

抽屉是 Coach · Reviewer · Critic · Guide，`fallback` 写明不代写作业。接真模型后进 **系统提示**。上下文由服务器按角色裁剪：学生看不到隐藏评分标准。POC 客户端拿得到整个 `dataset`，这是要拆的。

## Schema 对照

DiagnosisAgent 已有 `root_cause`、`evidence`、`need_human_review`。Copilot 也应强制字段，例如 `intent`、`answer`、`evidence[]`、`refuses_to_complete_assignment`。前端渲染 `answer`，`evidence` 跳转到 Ontology/Discover。

`POST /api/copilot/stream` → SSE，最后 `event: done` 带完整 JSON。无密钥时 UI 标明「剧本模式」，禁止静默假回复冒充真模型。

## 提示注入

访谈原文进 **数据区**，不得覆盖系统提示。Copilot 不得调用 `create_work_order`。知识检索过滤 24 个月以外文档（Agent instructions 第 3 条）；没有向量库就 SQL `ILIKE`，但必须有来源字段。
