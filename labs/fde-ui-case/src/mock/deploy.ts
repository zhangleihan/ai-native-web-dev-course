export const templates = [
  {
    id: 'tpl-rag',
    name: 'RAG Assistant',
    desc: '知识问答助手，含文档上传、向量检索、引用溯源',
    stack: 'Next.js + FastAPI + pgvector',
    files: 42,
    color: '#13c2c2',
  },
  {
    id: 'tpl-dashboard',
    name: 'Agent Dashboard',
    desc: 'Agent 运行监控看板，含 Trace 可视化与指标图表',
    stack: 'Next.js + FastAPI + Redis',
    files: 56,
    color: '#722ed1',
  },
  {
    id: 'tpl-workflow',
    name: 'Workflow App',
    desc: '流程驱动型应用骨架，含审批中心与任务队列',
    stack: 'Next.js + FastAPI + Celery',
    files: 61,
    color: '#1677ff',
  },
  {
    id: 'tpl-risk',
    name: 'Risk Analysis App',
    desc: '风险分析应用，含多维评分卡与报告导出',
    stack: 'Next.js + FastAPI + PostgreSQL',
    files: 48,
    color: '#fa541c',
  },
  {
    id: 'tpl-ops',
    name: 'Operations App',
    desc: '运维工作台骨架，含告警列表、诊断详情、工单审批',
    stack: 'Next.js + FastAPI + PostgreSQL',
    files: 67,
    color: '#52c41a',
  },
  {
    id: 'tpl-report',
    name: 'Inspection Report App',
    desc: '巡检报告应用骨架，含照片墙、缺陷复核签字、报告预览导出',
    stack: 'Next.js + FastAPI + CUDA Runtime',
    files: 58,
    color: '#faad14',
  },
];

export const generatedFiles = [
  { path: 'frontend/app/page.tsx', desc: '告警列表主页面', lines: 218 },
  { path: 'frontend/app/alarm/[id]/page.tsx', desc: '诊断详情页', lines: 342 },
  { path: 'frontend/app/approval/page.tsx', desc: '审批中心', lines: 186 },
  { path: 'backend/main.py', desc: 'FastAPI 入口', lines: 94 },
  { path: 'backend/agents/diagnosis.py', desc: 'Diagnosis Agent 实现', lines: 276 },
  { path: 'backend/agents/operations.py', desc: 'Operations Agent 实现', lines: 198 },
  { path: 'backend/harness/context_builder.py', desc: '上下文构建器', lines: 231 },
  { path: 'backend/harness/permission.py', desc: '权限与审批策略', lines: 142 },
  { path: 'backend/ontology/schema.py', desc: 'Ontology 对象定义', lines: 305 },
  { path: 'Dockerfile', desc: '容器构建文件', lines: 28 },
  { path: 'docker-compose.yml', desc: '本地编排', lines: 44 },
  { path: 'README.md', desc: '项目说明', lines: 112 },
];

export interface BuildStep {
  key: string;
  name: string;
  logs: string[];
  duration: number;
}

export const buildSteps: BuildStep[] = [
  {
    key: 'clone',
    name: 'Pull Project Git',
    duration: 1800,
    logs: [
      '$ git clone https://git.fde-lab.internal/p-2024-07/ops-agent.git',
      'Cloning into ops-agent...',
      'remote: Enumerating objects: 412, done.',
      'Receiving objects: 100% (412/412), 1.24 MiB | 8.4 MiB/s, done.',
      'HEAD is now at 8f3a91c feat: 增加审批回调处理',
    ],
  },
  {
    key: 'build',
    name: 'Build Docker Image',
    duration: 4200,
    logs: [
      '$ docker build -t fde/p-2024-07:v7 .',
      'Step 1/12 : FROM python:3.11-slim',
      'Step 4/12 : RUN pip install -r requirements.txt',
      ' ---> Installing fastapi, sqlalchemy, pgvector, redis...',
      'Step 8/12 : COPY frontend/.next ./frontend/.next',
      'Step 12/12 : CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]',
      'Successfully built 3a7f9e2c4b18',
      'Successfully tagged fde/p-2024-07:v7',
    ],
  },
  {
    key: 'run',
    name: 'Run Container',
    duration: 2400,
    logs: [
      '$ docker run -d --name p-2024-07-v7 --cpus=2 --memory=4g fde/p-2024-07:v7',
      'Container 9c2f8a1b3d47 started',
      'INFO:     Started server process [1]',
      'INFO:     Waiting for application startup.',
      'INFO:     Ontology service loaded: 7 objects, 6 relations, 5 actions',
      'INFO:     Agent registry loaded: 4 agents',
      'INFO:     Application startup complete.',
    ],
  },
  {
    key: 'health',
    name: 'Health Check',
    duration: 2000,
    logs: [
      '$ curl -f http://p-2024-07-v7:8000/health',
      '{"status":"ok","db":"connected","redis":"connected","mcp":{"nms-mcp":"ok","file-mcp":"ok"}}',
      'Health check passed (3/3 attempts)',
    ],
  },
  {
    key: 'url',
    name: 'Assign URL',
    duration: 1200,
    logs: [
      'Registering route in gateway...',
      'TLS certificate issued (internal CA)',
      '✓ Deployment URL: https://p-2024-07.sandbox.fde-lab.internal',
    ],
  },
];

export const deploymentInfo = {
  url: 'https://p-2024-07.sandbox.fde-lab.internal',
  image: 'fde/p-2024-07:v7',
  container: '9c2f8a1b3d47',
  cpu: '2 cores',
  memory: '4 GB',
  disk: '10 GB',
  network: '仅内网白名单',
  createdAt: '2026-08-26 10:31',
};

export const runtimeLogs = [
  '10:31:02 INFO  Application startup complete',
  '10:31:44 INFO  GET /health 200 4ms',
  '10:32:15 INFO  POST /api/alarms/diagnose 200 14872ms trace_id=tr-20260826-0731',
  '10:32:31 INFO  Approval requested: create_work_order (run-live)',
  '10:33:08 INFO  Approval granted by 张明',
  '10:33:10 INFO  POST /itsm/workorder/create 201 1860ms wo_id=WO-20260826-0417',
  '10:35:22 INFO  GET /api/traces/tr-20260826-0731 200 32ms',
  '10:38:47 WARN  ITSM rate limit approaching: 17/20 per minute',
  '10:41:12 INFO  GET /api/metrics 200 12ms',
];

export const deployHistory = [
  { version: 'v7', time: '2026-08-26 10:31', status: 'running', author: '何佳', note: '增加审批回调处理' },
  { version: 'v6', time: '2026-08-25 21:14', status: 'stopped', author: '何佳', note: '修复拓扑查询超时' },
  { version: 'v5', time: '2026-08-25 16:02', status: 'stopped', author: '周衡', note: 'RAG 时效过滤上线' },
  { version: 'v4', time: '2026-08-24 19:38', status: 'failed', author: '周衡', note: '依赖冲突，构建失败' },
];

export const resourceUsage = [
  { time: '10:31', cpu: 12, memory: 34 },
  { time: '10:33', cpu: 68, memory: 52 },
  { time: '10:35', cpu: 41, memory: 55 },
  { time: '10:37', cpu: 23, memory: 53 },
  { time: '10:39', cpu: 57, memory: 61 },
  { time: '10:41', cpu: 31, memory: 58 },
  { time: '10:43', cpu: 19, memory: 56 },
  { time: '10:45', cpu: 26, memory: 57 },
];
