# 镜像、Compose 与 CI 流水线

FSO Part 12 从单容器到 compose、网络、volume、多阶段构建；Part 11 讲 CI：测试绿了才能部署。FDE 的 `start.sh` 在宿主机跑 `next dev`；Deploy 页 `startDeploy()` 只是播 `buildSteps` 动画。

## 三件套

`web`（Next runner，非 root）、`api`（REST+SSE，持 DB URL 与模型密钥）、`db`（Postgres **卷**，数据不进镜像层）。`.env` 不要 `COPY` 进镜像，用 compose `environment`。

## 浏览器可解析的 API 地址

`NEXT_PUBLIC_*` 是 **用户浏览器** 用的 URL。写成 `http://api:3101` 会导致浏览器 DNS 失败——这是 FSO 容器网络练习里最常见的坑在 SPA 上的版本。

## CI 最小集

`typecheck` → `test` → `docker build`。Deploy 页将来应展示真实 job，而不是 `mock/deploy.ts` 数组。
