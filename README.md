# AI 原生网络应用开发 · 32 学时讲义

第 0 讲为课程介绍（目标、核心内容、考核、微信群）。其后 16 讲 × 2 学时为正课。贯穿案例是 **AI-FDE 工程管理实训平台**（`FDE-Workspace/web`）。

每讲四节：

1. **关键内容**（标题随讲次变化，如「HTTP GET/POST、状态码与报文头」）
2. **项目关联**
3. **课堂练习**
4. **课后练习**

## 打开

完整步骤、双服务、端口与排障见 **[服务启动说明.md](./服务启动说明.md)**。

最短路径：

```bash
# 终端 1：教材
cd ai-native-web-dev-course
./start.sh          # http://127.0.0.1:8766

# 终端 2：FDE 平台
cd /path/to/FDE-Workspace
./start.sh          # http://127.0.0.1:3100
```

不要用 `file://` 打开教材 HTML。

第 3 讲原生练习已拷到 `labs/js-basics`、`labs/terrarium`、`labs/typing-game`。编辑 `markdown/NN-*.md` 后重新 `python3 scripts/build_course.py`。

第 1–2 讲用到的 Full Stack Open 插图若本地没有，在教材目录执行：

```bash
ln -sfn ../fullstackopen-zh-offline/images fso-images
```
