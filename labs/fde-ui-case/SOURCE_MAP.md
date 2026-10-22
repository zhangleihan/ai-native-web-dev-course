# 源码定位与证据说明

核查日期：2026-10-22。下列路径相对于 FDE-Workspace 根目录。只读分析，没有修改源项目。

| 路径 | 核对内容 |
|---|---|
| POC详细系统功能设计.md（根目录完整文件名见下方） | 产品主线、模块目标；不等于已经实现 |
| web/README.md | 原型性质、路由和模拟能力说明 |
| web/package.json | Next.js 14、React 18、Ant Design 5、TypeScript、React Flow |
| web/src/app/layout.tsx | 样式注册、主题、共享状态与外壳嵌套 |
| web/src/components/AppShell.tsx | 项目切换、菜单分组、角色与通知 |
| web/src/components/ui.tsx | PageHead、Metric、StageBar 等展示组件 |
| web/src/components/FlowCanvas.tsx | nodes/edges、缩放、节点样式；禁止连接，未提供完整位置持久化 |
| web/src/lib/theme.ts 与 app/globals.css | 色值、尺寸、布局与状态颜色 |
| web/src/lib/store.tsx | 项目初始化与切换、访谈、playSteps、startRun、decideApproval |
| web/src/app/cases/page.tsx | 组合筛选与固定三列卡片 |
| web/src/app/project/[projectId]/discover/page.tsx | 访谈脚本、局部草稿与共享洞察 |
| web/src/app/project/[projectId]/design/page.tsx | 局部方案字段与新增节点 |
| web/src/app/project/[projectId]/trace/page.tsx | 运行轨迹、审批入口与等待状态 |
| web/src/mock/datasets/telecom.ts | 通信项目编号 p-2024-07 与数据集组织 |

## 实现边界

- README 的较早页面统计不是当前路由的完整清单，源码另有 proposal 页面。
- 没有可用 Git 历史及完整生成对话；教材轮次是设计复现方案，不作历史归因。
- 角色切换不等于服务端鉴权；UI 模拟 Token/成本不等于真实计量。
- 状态跨页共享不等于持久化；设计页的局部编辑与全局 run 不能混称。
- 四张图片来自“白老师/立项申请/screenshots”，为既有截图，不是本次交互测试结果。

## 源文件指纹

用于后续识别源文件是否更新，SHA-256 不表示运行验证通过。

- `AI-FDE工程管理实训平台-POC详细系统功能设计.md`：`4fd70e99b3bcb40432cbf7427dd2532317d1f944f92ee4e390f5ed49a8b3cfa4`
- `web/README.md`：`b19e3b7aca8bbea293ad51af37417cfd77fc699185cbed5af58d25d7c3dee15c`
- `web/package.json`：`d79b978f656222a40fac0a63c6cc83e4f432785798037e84477888edcb17be84`
- `web/src/app/layout.tsx`：`253697fb9ebd35ae162ba2b7d9810a9bd65795a01eb69356d8ac1d02ccdc1878`
- `web/src/components/AppShell.tsx`：`75c37606dd833d457298ceb530a541d10dbb0c77a9634fa862c3f541af121913`
- `web/src/components/ui.tsx`：`97cb0773e3f96da98cec44b4891fb1cd9274d8ed0015f1b931513b1c6c55b029`
- `web/src/components/FlowCanvas.tsx`：`b458b55ec5b0591781f8f071a4586b82393547f98a8da6b8324c236f4eb868b8`
- `web/src/lib/theme.ts`：`a23a5878f3097b27f0f9320cbe819136f1c50ec8131a95416e6fbe11c31cf4f4`
- `web/src/app/globals.css`：`1b0ed98def4000a43ba49d484914031f7eac5cefdd814d092567fab654bf519b`
- `web/src/lib/store.tsx`：`61e57fb574f4b105dff9b72974d0276062c4cee5b2853fcbcdf295ccd3898e84`
- `web/src/app/cases/page.tsx`：`7c6cef8e9a0b54ab1e1e491276dfc678e798480278f2778ef1c20dc9194056fb`
- `web/src/app/project/[projectId]/discover/page.tsx`：`d2661e2816997482042a1c11df228c4b4b7daf911080b88e9595836fc6a284c4`
- `web/src/app/project/[projectId]/design/page.tsx`：`22ea536abdb48fc9cc6866f4a2ffb7537669b4f4304e0e836376189dc155f094`
- `web/src/app/project/[projectId]/trace/page.tsx`：`913581f367003b838118a46d580759fdaf2840454e06c0a250e9f8806b72dbc8`
- `web/src/mock/datasets/telecom.ts`：`4f7fd401352c41a9915b898f9439000f9eb563331e7ad6d0eb7cc06e146ae0ab`

## 可运行副本

课程 labs/fde-ui-case 已复制原 web/src、依赖锁文件与运行配置。上述 web/src 路径在副本中对应 src；源文件指纹仍用于追溯原工程。启动脚本改为默认监听 127.0.0.1。未复制依赖目录和生成缓存，FDE 原工程保持不变。
