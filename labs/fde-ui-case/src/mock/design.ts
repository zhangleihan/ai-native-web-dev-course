export interface SolutionField {
  key: string;
  label: string;
  cn: string;
  value: string;
  icon: string;
}

export const solutionCanvas: SolutionField[] = [
  {
    key: 'business_problem',
    label: 'Business Problem',
    cn: '业务问题',
    value: '重大故障根因定位平均 47 分钟，跨系统人工查询导致 MTTR 超标、工单错派率 23%。',
    icon: 'problem',
  },
  {
    key: 'user',
    label: 'User',
    cn: '使用者',
    value: '诊断班工程师（生成诊断）、值班经理（审批派单）、监控班（噪声过滤后的告警视图）。',
    icon: 'user',
  },
  {
    key: 'input',
    label: 'Input',
    cn: '输入',
    value: '实时告警流（FaultCenter）、网络拓扑快照、历史工单、知识库文档、检修计划。',
    icon: 'input',
  },
  {
    key: 'ai_capability',
    label: 'AI Capability',
    cn: 'AI 能力',
    value: '告警语义聚类与收敛、跨源信息汇聚、基于证据的根因推理、结构化诊断报告生成。',
    icon: 'ai',
  },
  {
    key: 'knowledge',
    label: 'Knowledge',
    cn: '知识',
    value: 'RAG 检索 412 篇故障手册（过滤 24 个月内）+ 9.6 万条历史工单向量化 + Ontology 结构化知识。',
    icon: 'knowledge',
  },
  {
    key: 'agent',
    label: 'Agent',
    cn: 'Agent 结构',
    value: 'Manager（Triage Agent）+ Specialist：Diagnosis Agent / Operations Agent / Report Agent。',
    icon: 'agent',
  },
  {
    key: 'tools',
    label: 'Tools',
    cn: '工具',
    value: 'query_topology(MCP)、search_knowledge(RAG)、query_alarm_history(DB)、create_work_order(API,审批)、correlate_alarms(Function)。',
    icon: 'tool',
  },
  {
    key: 'output',
    label: 'Output',
    cn: '输出',
    value: '结构化诊断报告（根因、置信度、影响范围、证据引用、建议步骤）+ 工单草稿 + 处理人推荐。',
    icon: 'output',
  },
  {
    key: 'human_role',
    label: 'Human Role',
    cn: '人的角色',
    value: '值班经理审批高风险动作；诊断班对结论纠正后写入 Project Memory；置信度 ≤0.8 强制转人工。',
    icon: 'human',
  },
  {
    key: 'integration',
    label: 'Integration',
    cn: '集成方式',
    value: '内网私有化部署；FaultCenter 与 NMS 通过 MCP Gateway 只读接入；ITSM 通过 REST 写接口（限流 20/min）。',
    icon: 'integration',
  },
  {
    key: 'evaluation',
    label: 'Evaluation',
    cn: '评估方式',
    value: '50 条历史故障回归集测任务成功率与根因准确率；线上灰度对比定位时长与错派率。',
    icon: 'eval',
  },
  {
    key: 'risk',
    label: 'Risk',
    cn: '风险',
    value: '过时知识导致错误结论（缓解：时效过滤）；自动派单误操作（缓解：强制审批）；ITSM 限流（缓解：队列+重试）。',
    icon: 'risk',
  },
];

export interface ArchNode {
  id: string;
  type: string;
  label: string;
  sub: string;
  x: number;
  y: number;
}

export const architectureNodes: ArchNode[] = [
  { id: 'a-user', type: 'User', label: '诊断班工程师', sub: 'User', x: 20, y: 200 },
  { id: 'a-app', type: 'App', label: '智能运维工作台', sub: 'Next.js App', x: 200, y: 200 },
  { id: 'a-triage', type: 'Agent', label: 'Triage Agent', sub: '告警分诊', x: 400, y: 90 },
  { id: 'a-diag', type: 'Agent', label: 'Diagnosis Agent', sub: '根因诊断', x: 400, y: 220 },
  { id: 'a-ops', type: 'Agent', label: 'Operations Agent', sub: '工单执行', x: 400, y: 350 },
  { id: 'a-llm', type: 'LLM', label: 'Qwen2.5-72B', sub: '私有化部署', x: 620, y: 40 },
  { id: 'a-rag', type: 'RAG', label: '知识检索', sub: 'pgvector', x: 620, y: 150 },
  { id: 'a-onto', type: 'Ontology', label: 'Ontology Service', sub: '7 Objects / 6 Relations', x: 620, y: 260 },
  { id: 'a-approval', type: 'Human Approval', label: '值班经理审批', sub: 'HITL', x: 620, y: 370 },
  { id: 'a-mcp', type: 'MCP', label: 'MCP Gateway', sub: 'NMS / FaultCenter', x: 840, y: 150 },
  { id: 'a-db', type: 'Database', label: 'PostgreSQL', sub: '告警/工单历史', x: 840, y: 260 },
  { id: 'a-itsm', type: 'External System', label: 'ITSM 工单系统', sub: '限流 20/min', x: 840, y: 370 },
];

export const architectureEdges = [
  { id: 'ae-1', source: 'a-user', target: 'a-app' },
  { id: 'ae-2', source: 'a-app', target: 'a-triage' },
  { id: 'ae-3', source: 'a-triage', target: 'a-diag', label: 'handoff' },
  { id: 'ae-4', source: 'a-diag', target: 'a-ops', label: 'handoff' },
  { id: 'ae-5', source: 'a-diag', target: 'a-llm' },
  { id: 'ae-6', source: 'a-diag', target: 'a-rag' },
  { id: 'ae-7', source: 'a-diag', target: 'a-onto' },
  { id: 'ae-8', source: 'a-ops', target: 'a-approval', label: '高风险' },
  { id: 'ae-9', source: 'a-rag', target: 'a-db' },
  { id: 'ae-10', source: 'a-onto', target: 'a-mcp' },
  { id: 'ae-11', source: 'a-approval', target: 'a-itsm', label: 'approved' },
  { id: 'ae-12', source: 'a-diag', target: 'a-mcp' },
];

export const architectPalette = [
  { type: 'User', color: '#1677ff' },
  { type: 'App', color: '#2f54eb' },
  { type: 'Agent', color: '#722ed1' },
  { type: 'LLM', color: '#eb2f96' },
  { type: 'RAG', color: '#13c2c2' },
  { type: 'Ontology', color: '#52c41a' },
  { type: 'Database', color: '#faad14' },
  { type: 'API', color: '#fa8c16' },
  { type: 'MCP', color: '#08979c' },
  { type: 'Workflow', color: '#597ef7' },
  { type: 'Human Approval', color: '#fa541c' },
  { type: 'External System', color: '#8c8c8c' },
];

export const architectSuggestions = [
  {
    title: '推荐采用 Workflow + Agent 而非全自治 Multi-Agent',
    detail:
      '运维场景对可预测性与可审计性要求高，确定性 Workflow 编排下挂专家 Agent，比自由 Multi-Agent 更容易通过合规评审，也更便于 Trace 归因。',
    level: 'recommend',
  },
  {
    title: 'create_work_order 必须设为 APPROVAL_REQUIRED',
    detail: '对应访谈约束「设备变更双人确认」与项目决策「不允许 Agent 直接操作网络设备」，该工具不得配置为 ALLOW。',
    level: 'must',
  },
  {
    title: 'RAG 检索需加入时效性过滤器',
    detail: '知识库 60% 文档超两年未更新，建议在检索层强制 last_updated >= now-24months，并在输出中标注文档日期。',
    level: 'must',
  },
  {
    title: '为 ITSM 写接口增加队列与退避重试',
    detail: '接口限流 20 次/分钟，建议 Harness 侧配置令牌桶 + 指数退避，避免高峰期批量派单触发限流失败。',
    level: 'recommend',
  },
  {
    title: '识别到的风险：置信度阈值缺少校准数据',
    detail: '当前 0.8 阈值为经验取值，建议用 50 条回归集做阈值-准确率曲线校准后再固化。',
    level: 'risk',
  },
  {
    title: '运行底座增加「灵畿科研平台」作为第三选项',
    detail:
      '行业数据驻留要求高、学校暂无 GPU 机房时，优先评估中国移动灵畿科研平台：模型走九天网关，专线接入，控制面（账号/案例/Harness/Eval）仍留在本平台。',
    level: 'recommend',
  },
  {
    title: 'Agent 实现不要锁死在 Studio 表单',
    detail:
      '进阶团队应允许用 Cursor / VS Code Copilot 等外部 AI IDE 实现 Agent。平台下发 AGENTS.md 与 Harness SDK，运行、审批、Trace、评测不可绕过。',
    level: 'recommend',
  },
];
