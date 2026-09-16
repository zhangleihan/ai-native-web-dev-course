# 课堂练习

**限时：本讲课内完成。** 目标是把 POC 跑起来并拆穿它。

## 1. 启动并走 Golden Path

```bash
cd FDE-Workspace    # 或你的克隆路径
./start.sh          # http://127.0.0.1:3100
```

学生角色登录 → `/cases/case-001` 通信网络故障处理 → Discover。DevTools → Network → Fetch/XHR。

## 2. 给 Agent 的规格（只读）

```text
仓库：FDE-Workspace/web
列出从打开 / 到渲染工作台待办所涉及的源文件，
以及有没有任何 fetch/axios 调用业务数据。
输出请求链：有的步骤实线，没有的虚线（DB、LLM、REST）。
不要修改代码。
```

自己核对：`src/app/page.tsx` 的 `todos` 是否来自 `useStore()`。

## 课堂要交出口

- [ ] 能指出 AppShell / Store / mock 三层
- [ ] Network 里说明「没有业务 API」
- [ ] 一张带虚线的请求链（纸面或 mermaid）
