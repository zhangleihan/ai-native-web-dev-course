import type { AgentDef } from './types';

export const agents: AgentDef[] = [
  {
    id: 'agt-diag',
    name: 'DiagnosisAgent',
    cn: '故障诊断 Agent',
    role: '通信网络故障诊断专家',
    goal: '根据告警、拓扑与历史知识，输出带证据的根因判断与置信度',
    instructions: `你是省级核心网的资深故障诊断专家。

工作原则：
1. 先调用 correlate_alarms 收敛告警，识别根告警，再开始推理；
2. 必须调用 query_topology 确认受影响的上下游网元与业务；
3. 检索知识库时只采信 24 个月内的文档，引用需给出文档编号与更新日期；
4. 每条结论必须给出证据来源，不得凭空推断；
5. 若证据不足以支撑置信度 > 0.8，明确输出 need_human_review = true；
6. 你没有创建工单的权限，只能输出诊断结论与建议。

输出必须符合 DiagnosisResult schema。`,
    model: 'qwen2.5-72b-instruct',
    provider: 'Qwen（私有化）',
    temperature: 0.2,
    outputSchema: `{
  "root_cause": "string",
  "fault_type": "string",
  "confidence": "number(0-1)",
  "affected_services": ["string"],
  "affected_customers": ["string"],
  "evidence": [{"source": "string", "excerpt": "string", "updated_at": "date"}],
  "recommended_steps": ["string"],
  "need_human_review": "boolean"
}`,
    tools: ['tool-correlate', 'tool-topology', 'tool-knowledge', 'tool-alarm-history'],
    knowledge: ['运维知识库（24 个月内 268 篇）', '历史工单向量库（9.6 万条）'],
    memory: ['PROJECT', 'SEMANTIC', 'EPISODIC'],
    guardrails: ['输出必须包含 evidence 字段', '禁止调用写操作工具', '禁止引用超过 24 个月的文档'],
    status: 'ready',
    runs: 34,
    successRate: 0.91,
    avgLatency: 18.4,
    avgCost: 0.42,
  },
  {
    id: 'agt-ops',
    name: 'OperationsAgent',
    cn: '运维执行 Agent',
    role: '工单派发与执行协调员',
    goal: '基于诊断结论生成工单草稿，推荐处理人，经审批后创建工单',
    instructions: `你负责把诊断结论转化为可执行的工单。

工作原则：
1. 只接受 confidence > 0.8 且 need_human_review = false 的诊断结论；
2. 工单必须包含：网元标识、故障类型、影响业务范围、建议处理步骤；
3. 依据技能标签、责任区域、在班状态推荐处理人；
4. create_work_order 属于高风险动作，必须提交人工审批，严禁绕过；
5. 遵守项目决策：不允许直接操作或重启任何网络设备。`,
    model: 'qwen2.5-32b-instruct',
    provider: 'Qwen（私有化）',
    temperature: 0.1,
    outputSchema: `{
  "work_order": {
    "ne_id": "string",
    "fault_type": "string",
    "priority": "P1|P2|P3",
    "description": "string",
    "recommended_assignee": "string"
  },
  "approval_required": "boolean"
}`,
    tools: ['tool-assign', 'tool-create-wo', 'tool-topology'],
    knowledge: ['排班与技能矩阵'],
    memory: ['PROJECT', 'DECISION'],
    guardrails: ['create_work_order 强制审批', '禁止设备变更类操作', '单次运行最多创建 1 个工单'],
    status: 'ready',
    runs: 21,
    successRate: 0.86,
    avgLatency: 9.7,
    avgCost: 0.18,
  },
  {
    id: 'agt-report',
    name: 'ReportAgent',
    cn: '报告生成 Agent',
    role: '故障复盘报告撰写员',
    goal: '汇总诊断过程、处理结果与耗时，生成结构化复盘报告',
    instructions: `根据一次完整的故障处理 Trace，生成面向管理层的复盘报告。

包含：故障概述、时间线、根因分析、处理措施、影响评估、改进建议。
语言简洁，避免技术黑话，关键数据必须来自 Trace 而非编造。`,
    model: 'qwen2.5-32b-instruct',
    provider: 'Qwen（私有化）',
    temperature: 0.4,
    outputSchema: `{
  "summary": "string",
  "timeline": [{"time": "string", "event": "string"}],
  "root_cause_analysis": "string",
  "impact": "string",
  "improvements": ["string"]
}`,
    tools: ['tool-alarm-history', 'tool-knowledge'],
    knowledge: ['历史复盘报告模板'],
    memory: ['SESSION', 'EPISODIC'],
    guardrails: ['数据必须来自 Trace', '不得包含客户隐私信息'],
    status: 'ready',
    runs: 12,
    successRate: 1.0,
    avgLatency: 22.1,
    avgCost: 0.31,
  },
  {
    id: 'agt-triage',
    name: 'TriageAgent',
    cn: '告警分诊 Agent',
    role: '告警分流入口',
    goal: '判断告警是否有效、是否需要进入诊断流程，或直接抑制',
    instructions: `你是告警分诊入口。

判断规则：
1. 检查网元是否处于检修窗口，是则抑制；
2. 检查是否为已知抖动告警（5 分钟内同网元同类型 > 3 条），是则收敛；
3. Critical / Major 且非抑制项 → handoff 给 DiagnosisAgent；
4. Minor / Warning → 仅记录，不进入诊断。`,
    model: 'qwen2.5-7b-instruct',
    provider: 'Qwen（私有化）',
    temperature: 0.0,
    outputSchema: `{"decision": "suppress|record|diagnose", "reason": "string"}`,
    tools: ['tool-correlate'],
    knowledge: [],
    memory: ['SESSION'],
    guardrails: ['单条告警处理时长 < 2s'],
    status: 'draft',
    runs: 5,
    successRate: 0.8,
    avgLatency: 1.4,
    avgCost: 0.01,
  },
];

export const agentRunModes = [
  {
    key: 'single',
    name: 'Single Agent',
    desc: '单 Agent 直接调用工具完成任务，结构最简单，适合边界清晰的场景。',
    diagram: 'User → Agent → Tools → Answer',
    used: false,
  },
  {
    key: 'manager',
    name: 'Manager + Specialist',
    desc: 'Manager Agent 分解任务，调度多个专家 Agent，适合复合任务。',
    diagram: 'Manager → [Data / Search / Analysis / Report]',
    used: false,
  },
  {
    key: 'handoff',
    name: 'Handoff',
    desc: '分诊 Agent 判断后移交给专家 Agent，上下文随之转移。',
    diagram: 'Triage Agent → Specialist Agent',
    used: true,
  },
  {
    key: 'workflow',
    name: 'Deterministic Workflow',
    desc: '确定性流程编排，节点可含 Agent、工具与人工审批，可预测可审计。',
    diagram: 'Input → Retrieve → Analyze → Human Review → Execute',
    used: true,
  },
];

export const frameworkAdapters = [
  { name: 'OpenAI Agents SDK', status: 'active', version: '0.3.2', desc: '默认适配器，支持 Handoff 与 Structured Output' },
  { name: 'LangGraph Adapter', status: 'available', version: '0.2.45', desc: '用于复杂状态机与循环控制场景' },
  { name: 'Custom Workflow Engine', status: 'available', version: '内置', desc: '平台自带的确定性 Workflow 执行器' },
  { name: 'Cloud AI-IDE Adapter', status: 'active', version: '0.1.0', desc: '浏览器云 IDE：编辑器 + Copilot + 终端，Run 回调 Harness' },
  { name: 'IDE Bridge (Cursor / VS Code)', status: 'available', version: '0.1.0', desc: '外部 AI IDE 通过 Git + Harness SDK 回写 Agent 实现' },
  { name: 'Lingji Research Adapter', status: 'available', version: 'preview', desc: '中国移动灵畿科研平台模型网关与研发空间接入' },
];

export type AgentWorkspaceKind = 'studio' | 'cloud-ide' | 'external-ide' | 'lingji';

export const agentWorkspaces: {
  id: AgentWorkspaceKind;
  name: string;
  vendor: string;
  desc: string;
  openness: string;
  constraint: string;
  files: { path: string; desc: string }[];
}[] = [
  {
    id: 'studio',
    name: '平台 Agent Studio',
    vendor: 'AI-FDE Lab',
    desc: '表单化定义 Role / Goal / Tools / Guardrails，适合统一教学路径与入门实验。',
    openness: '受控',
    constraint: '实现形态由平台约束，换框架成本低但表达力有限',
    files: [],
  },
  {
    id: 'cloud-ide',
    name: '云 AI-IDE',
    vendor: 'FDE Cloud IDE（浏览器）',
    desc: '平台托管的云端 AI IDE：文件树、编辑器、Copilot、终端。规格来自 Studio，Run 仍走 Harness。',
    openness: '开放',
    constraint: '可在浏览器里写代码，但不能直连模型、不能绕过审批',
    files: [
      { path: 'AGENTS.md', desc: '从 Studio 规格生成' },
      { path: 'harness.config.yaml', desc: '运行入口绑定 Harness' },
      { path: 'src/agents/*.py', desc: 'Agent 实现骨架' },
      { path: 'tests/test_guardrail.py', desc: '禁止直连模型的回归测试' },
    ],
  },
  {
    id: 'external-ide',
    name: '外部 AI 辅助 IDE',
    vendor: 'Cursor / VS Code Copilot / Continue',
    desc: '在学生已有的 AI IDE 中用自然语言和代码实现 Agent，平台只下发规格、脚手架与 Harness SDK。',
    openness: '开放',
    constraint: '代码可自由编写，但 Agent.run / 工具调用必须走 Harness，不可直连模型绕过审批',
    files: [
      { path: 'AGENTS.md', desc: '从 Ontology + Guardrail 生成的实现规格，供 Cursor / Copilot 读取' },
      { path: '.cursor/rules/fde-harness.mdc', desc: '强制：工具调用走 MCP Gateway，禁止直连外部 API' },
      { path: 'harness.config.yaml', desc: '项目 ID、模型路由、权限矩阵、评测入口' },
      { path: 'src/agents/diagnosis.py', desc: 'DiagnosisAgent 骨架，已注入 output schema' },
      { path: 'src/agents/operations.py', desc: 'OperationsAgent 骨架，create_work_order 预置 APPROVAL_REQUIRED' },
    ],
  },
  {
    id: 'lingji',
    name: '灵畿科研平台研发环境',
    vendor: '中国移动灵畿',
    desc: '在灵畿一体化研发空间编码与调试，模型与算力走灵畿网关，过程资产留在科研项目空间。',
    openness: '半开放',
    constraint: '研发在灵畿完成，运行与评测仍回写本平台 Trace / Eval',
    files: [
      { path: 'lingji.project.yaml', desc: '灵畿项目空间绑定：算力池、模型网关、代码仓' },
      { path: 'AGENTS.md', desc: '与外部 IDE 共用的实现规格' },
      { path: 'harness.config.yaml', desc: 'provider: lingji-gateway' },
    ],
  },
];
