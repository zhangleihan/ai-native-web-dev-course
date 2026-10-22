import type { AgentRun, ApprovalItem, TraceSpan } from './types';

export interface RunStep {
  span: TraceSpan;
  delay: number;
  log: string;
  pauseForApproval?: boolean;
}

export const runInput =
  '告警 ALM-20260826-0731：网元 NE-CORE-0872（华东汇聚核心路由器）上报 Critical 级 LOS 光路中断告警，10:07:44 触发，同区域 5 分钟内另有 23 条关联告警。请诊断根因并处理。';

export const liveRunSteps: RunStep[] = [
  {
    delay: 900,
    log: '[Harness] 初始化 Run，分配 trace_id=tr-20260826-0731',
    span: {
      id: 'sp-1',
      name: 'Context Build',
      type: 'context',
      startMs: 0,
      durationMs: 620,
      status: 'success',
      tokens: { input: 3632, output: 0 },
      cost: 0.004,
      input: '组装 System / Role / Task / Project Rules / Memory / Ontology / RAG / Conversation / Tool Schema',
      output:
        '上下文构建完成，总计 3,632 tokens（预算 8,000）。注入 Project Memory 4 条 pinned 规则，Episodic 2 条，Semantic 2 条。裁剪过期文档 3 篇（共 2,370 tokens）。',
      meta: { blocks: 9, budget: '8000', used: '3632', trimmed: '3550' },
    },
  },
  {
    delay: 800,
    log: '[Memory] 读取 Project Memory（4 条 pinned 规则）',
    span: {
      id: 'sp-2',
      name: 'Memory Read · Project Rules',
      type: 'memory_read',
      startMs: 620,
      durationMs: 180,
      status: 'success',
      input: 'query: project_rules WHERE pinned = true',
      output:
        '① 不允许 Agent 直接变更网络设备；② create_work_order 强制人工审批；③ 知识检索过滤 24 个月以上文档；④ 模型推理不得出内网。',
      meta: { hits: 4, source: 'Project Memory' },
    },
  },
  {
    delay: 1100,
    log: '[Tool] correlate_alarms 执行中…',
    span: {
      id: 'sp-3',
      name: 'Tool · correlate_alarms',
      type: 'tool',
      startMs: 800,
      durationMs: 340,
      status: 'success',
      input: '{ "alarm_ids": ["ALM-20260826-0731", "…23 条"], "window_minutes": 5 }',
      output:
        '{ "root_alarm": "ALM-20260826-0731 (NE-CORE-0872, LOS)", "derived": 23, "suppressed_count": 23, "confidence": 0.94 }',
      meta: { permission: 'ALLOW', risk: 'low' },
    },
  },
  {
    delay: 1400,
    log: '[Tool] query_topology 经 MCP Gateway 调用 nms-mcp…',
    span: {
      id: 'sp-4',
      name: 'Tool · query_topology (MCP)',
      type: 'tool',
      startMs: 1140,
      durationMs: 1240,
      status: 'success',
      input: '{ "ne_id": "NE-CORE-0872", "depth": 2 }',
      output:
        '{ "upstream": ["OLT-HZ-0031"], "downstream": [12 个接入网元], "services": [12 条政企专线], "customers": ["杭州XX银行", "浙江XX集团", "…共 8 家"], "sla": "金牌×5 / 银牌×7" }',
      meta: { permission: 'ALLOW', server: 'nms-mcp', risk: 'low' },
    },
  },
  {
    delay: 1600,
    log: '[RAG] search_knowledge 检索中（已启用时效过滤）…',
    span: {
      id: 'sp-5',
      name: 'Retrieval · search_knowledge',
      type: 'retrieval',
      startMs: 2380,
      durationMs: 2180,
      status: 'success',
      input: '{ "query": "LOS 光路中断 核心路由器 根因排查", "top_k": 6, "min_updated_at": "2024-08-26" }',
      output:
        '命中 4 篇：《光传输故障处理手册》v3.2（2025-06，score 0.91）、《核心网汇聚层故障案例集》（2026-01，score 0.88）、《光缆接头进水故障专题》（2025-09，score 0.84）、工单 WO-20251103-2214（2025-11，score 0.79）。过滤过期文档 3 篇。',
      meta: { hits: 4, filtered: 3, permission: 'ALLOW' },
    },
  },
  {
    delay: 1000,
    log: '[Memory] 检索相似历史经验（Episodic）',
    span: {
      id: 'sp-6',
      name: 'Memory Read · Episodic',
      type: 'memory_read',
      startMs: 4560,
      durationMs: 210,
      status: 'success',
      input: 'similarity_search("LOS 告警 诊断 拓扑", type=EPISODIC, top_k=2)',
      output:
        '① 拓扑查询应前置于知识检索（Run #0031 教训，已遵守）；② 过时文档导致结论被驳回（Run #0019 教训，时效过滤已启用）。',
      meta: { hits: 2 },
    },
  },
  {
    delay: 2200,
    log: '[Model] 调用 qwen2.5-72b-instruct 生成诊断结论…',
    span: {
      id: 'sp-7',
      name: 'Model Call · DiagnosisAgent',
      type: 'model',
      startMs: 4770,
      durationMs: 6840,
      status: 'success',
      tokens: { input: 5412, output: 738 },
      cost: 0.287,
      input: 'model=qwen2.5-72b-instruct, temperature=0.2, 结构化输出 DiagnosisResult',
      output: `{
  "root_cause": "OLT-HZ-0031 至 NE-CORE-0872 段光缆链路中断，初判为接头盒进水导致衰耗骤增",
  "fault_type": "光路中断 (LOS)",
  "confidence": 0.92,
  "affected_services": ["12 条政企专线"],
  "affected_customers": ["杭州XX银行", "浙江XX集团", "…共 8 家"],
  "evidence": [
    {"source": "拓扑查询", "excerpt": "NE-CORE-0872 上游唯一链路来自 OLT-HZ-0031"},
    {"source": "《光缆接头进水故障专题》(2025-09)", "excerpt": "雨季接头盒进水引发衰耗骤增，典型表现为单侧 LOS"},
    {"source": "工单 WO-20251103-2214", "excerpt": "同区域历史同类故障，处理时长 96 分钟"}
  ],
  "recommended_steps": ["现场核查 OLT-HZ-0031 侧光功率", "检查沿线接头盒密封状态", "准备光缆熔接工具与备纤"],
  "need_human_review": false
}`,
      meta: { model: 'qwen2.5-72b-instruct', provider: 'Qwen 私有化', temperature: 0.2 },
    },
  },
  {
    delay: 900,
    log: '[Guardrail] 输出校验：Schema ✓ Evidence ✓ 引用时效 ✓',
    span: {
      id: 'sp-8',
      name: 'Output Guardrail',
      type: 'output',
      startMs: 11610,
      durationMs: 120,
      status: 'success',
      input: 'DiagnosisResult 结构化输出',
      output: 'Schema 校验通过；evidence 字段非空（3 条）；引用文档均在 24 个月内；未检测到策略违规。',
      meta: { checks: 4, passed: 4 },
    },
  },
  {
    delay: 1000,
    log: '[Handoff] DiagnosisAgent → OperationsAgent',
    span: {
      id: 'sp-9',
      name: 'Handoff · Diagnosis → Operations',
      type: 'handoff',
      startMs: 11730,
      durationMs: 90,
      status: 'success',
      input: 'confidence=0.92 > 0.8 且 need_human_review=false，进入执行分支',
      output: '上下文移交 OperationsAgent，携带诊断结论、影响范围与推荐步骤。',
      meta: { from: 'DiagnosisAgent', to: 'OperationsAgent' },
    },
  },
  {
    delay: 1100,
    log: '[Tool] recommend_engineer 匹配处理人…',
    span: {
      id: 'sp-10',
      name: 'Tool · recommend_engineer',
      type: 'tool',
      startMs: 11820,
      durationMs: 420,
      status: 'success',
      input: '{ "region": "杭州西湖区", "skill": "光缆熔接", "priority": "P1" }',
      output: '{ "candidates": [{"name": "陈锐", "match": 0.94, "on_duty": true}, {"name": "李强", "match": 0.81, "on_duty": true}] }',
      meta: { permission: 'ALLOW', risk: 'medium' },
    },
  },
  {
    delay: 900,
    log: '[Permission] create_work_order → APPROVAL_REQUIRED，暂停等待人工审批',
    pauseForApproval: true,
    span: {
      id: 'sp-11',
      name: 'Approval · create_work_order',
      type: 'approval',
      startMs: 12240,
      durationMs: 0,
      status: 'waiting',
      input: `Tool: create_work_order
Agent: OperationsAgent
Risk: HIGH
Parameters:
  ne_id: NE-CORE-0872
  fault_type: 光路中断 (LOS)
  priority: P1
  assignee: 陈锐
  description: OLT-HZ-0031 至 NE-CORE-0872 段光缆链路中断，疑似接头盒进水`,
      output: '等待值班经理审批…',
      meta: { permission: 'APPROVAL_REQUIRED', risk: 'high' },
    },
  },
];

export const postApprovalSteps: RunStep[] = [
  {
    delay: 1200,
    log: '[Tool] 审批通过，调用 create_work_order…',
    span: {
      id: 'sp-12',
      name: 'Tool · create_work_order',
      type: 'tool',
      startMs: 12240,
      durationMs: 1860,
      status: 'success',
      input:
        '{ "ne_id": "NE-CORE-0872", "fault_type": "光路中断 (LOS)", "priority": "P1", "assignee": "陈锐", "description": "OLT-HZ-0031 段光缆链路中断，疑似接头盒进水，建议携带熔接工具与备纤" }',
      output: '{ "wo_id": "WO-20260826-0417", "status": "Assigned", "created_at": "2026-08-26T10:08:33+08:00" }',
      meta: { permission: 'APPROVAL_REQUIRED', approved_by: '张明（值班经理）', risk: 'high' },
    },
  },
  {
    delay: 1000,
    log: '[Memory] 生成 Episodic Memory 候选，等待确认',
    span: {
      id: 'sp-13',
      name: 'Memory Write · Episodic 候选',
      type: 'memory_write',
      startMs: 14100,
      durationMs: 260,
      status: 'success',
      input: 'Run 总结 → Memory Evaluator（Importance 0.88 / Confidence 0.91 / Reusability 0.85 / Safety 1.0）',
      output: '生成 2 条候选记忆进入待确认队列（Episodic ×1，Semantic ×1），未直接写入长期记忆。',
      meta: { candidates: 2, policy: 'Run 完成后总结 + 用户确认' },
    },
  },
  {
    delay: 900,
    log: '[Eval] 触发 Eval Hook，计算本次运行评分',
    span: {
      id: 'sp-14',
      name: 'Eval Hook',
      type: 'output',
      startMs: 14360,
      durationMs: 480,
      status: 'success',
      input: 'Task Success / Output Quality / Tool Correctness / Evidence Grounding / Cost / Latency / Safety',
      output:
        'Task Success ✓ | Output Quality 0.91 | Tool Correctness 1.0 | Evidence Grounding 1.0 | Cost $0.31 | Latency 14.8s | Safety ✓ → 综合 92 分',
      meta: { score: 92 },
    },
  },
  {
    delay: 700,
    log: '[Harness] Run 完成，状态 COMPLETED',
    span: {
      id: 'sp-15',
      name: 'Final Output',
      type: 'output',
      startMs: 14840,
      durationMs: 60,
      status: 'success',
      input: '—',
      output:
        '诊断完成：OLT-HZ-0031 至 NE-CORE-0872 光缆链路中断（置信度 0.92），影响 12 条政企专线、8 家客户。已创建 P1 工单 WO-20260826-0417，指派陈锐处理。全程 14.9 秒，成本 $0.31。',
      meta: { status: 'COMPLETED' },
    },
  },
];

export const rejectedSteps: RunStep[] = [
  {
    delay: 1000,
    log: '[Approval] 审批被拒绝，Run 进入 CANCELLED',
    span: {
      id: 'sp-12r',
      name: 'Approval Rejected',
      type: 'approval',
      startMs: 12240,
      durationMs: 200,
      status: 'error',
      input: 'create_work_order 审批请求',
      output: '审批被拒绝，工单未创建。诊断结论已保留，转交诊断班人工处理。',
      error: 'REJECTED_BY_HUMAN',
      meta: { rejected_by: '张明（值班经理）' },
    },
  },
  {
    delay: 800,
    log: '[Harness] Run 结束，状态 CANCELLED',
    span: {
      id: 'sp-13r',
      name: 'Final Output',
      type: 'output',
      startMs: 12440,
      durationMs: 60,
      status: 'success',
      input: '—',
      output: '流程终止于审批环节。诊断结论已写入 Session Memory，供人工复核参考。',
      meta: { status: 'CANCELLED' },
    },
  },
];

export const historyRuns: AgentRun[] = [
  {
    id: 'run-0035',
    agentId: 'agt-diag',
    agentName: 'DiagnosisAgent → OperationsAgent',
    status: 'COMPLETED',
    input: '告警 ALM-20260825-1180：NE-AGG-0233 端口 LinkDown',
    output: '根因：接入侧光模块失效，置信度 0.89。已创建 P2 工单 WO-20260825-0392。',
    startedAt: '2026-08-25 18:42:11',
    durationMs: 16200,
    tokens: 6420,
    cost: 0.34,
    evalScore: 90,
    spans: [],
  },
  {
    id: 'run-0034',
    agentId: 'agt-diag',
    agentName: 'DiagnosisAgent',
    status: 'COMPLETED',
    input: '告警 ALM-20260825-0904：机房温度告警',
    output: '根因：空调机组故障，置信度 0.95。建议现场检修，未涉及网络设备变更。',
    startedAt: '2026-08-25 14:03:52',
    durationMs: 11400,
    tokens: 4980,
    cost: 0.26,
    evalScore: 94,
    spans: [],
  },
  {
    id: 'run-0033',
    agentId: 'agt-ops',
    agentName: 'OperationsAgent',
    status: 'CANCELLED',
    input: '为 ALM-20260825-0731 创建工单',
    output: '审批被拒绝：值班经理判断该告警属于计划检修范围。',
    startedAt: '2026-08-25 11:20:08',
    durationMs: 8100,
    tokens: 2140,
    cost: 0.09,
    evalScore: 52,
    spans: [],
  },
  {
    id: 'run-0032',
    agentId: 'agt-diag',
    agentName: 'DiagnosisAgent',
    status: 'FAILED',
    input: '告警 ALM-20260824-2201：BBU 心跳丢失',
    output: 'query_topology 调用超时（15s），重试 2 次后失败。',
    startedAt: '2026-08-24 22:11:33',
    durationMs: 47800,
    tokens: 3210,
    cost: 0.17,
    evalScore: 0,
    spans: [],
  },
  {
    id: 'run-0031',
    agentId: 'agt-diag',
    agentName: 'DiagnosisAgent',
    status: 'COMPLETED',
    input: '告警 ALM-20260824-1502：NE-CORE-0431 Critical',
    output: '首轮误判衍生告警为根因，置信度 0.62 触发人工复核。经修正后结论正确。',
    startedAt: '2026-08-24 15:02:17',
    durationMs: 21600,
    tokens: 7100,
    cost: 0.41,
    evalScore: 68,
    spans: [],
  },
];

export const pendingApproval: Omit<ApprovalItem, 'status'> = {
  id: 'apv-live',
  runId: 'run-live',
  agent: 'OperationsAgent',
  tool: 'create_work_order',
  reason: 'Critical 级光路中断告警，诊断置信度 0.92，影响 12 条政企专线（含 5 条金牌 SLA）',
  parameters: {
    ne_id: 'NE-CORE-0872',
    fault_type: '光路中断 (LOS)',
    priority: 'P1',
    assignee: '陈锐（匹配度 0.94，在班）',
    description: 'OLT-HZ-0031 至 NE-CORE-0872 段光缆链路中断，疑似接头盒进水导致衰耗骤增',
  },
  risk: 'high',
  requestedAt: '2026-08-26 10:08:31',
};

export const approvalHistory: ApprovalItem[] = [
  {
    id: 'apv-0021',
    runId: 'run-0035',
    agent: 'OperationsAgent',
    tool: 'create_work_order',
    reason: 'Major 级 LinkDown，置信度 0.89',
    parameters: { ne_id: 'NE-AGG-0233', priority: 'P2', assignee: '李强' },
    risk: 'high',
    requestedAt: '2026-08-25 18:42:55',
    status: 'approved',
    decidedBy: '张明（值班经理）',
    comment: '判断合理，同意派单',
  },
  {
    id: 'apv-0020',
    runId: 'run-0033',
    agent: 'OperationsAgent',
    tool: 'create_work_order',
    reason: 'Critical 告警，置信度 0.84',
    parameters: { ne_id: 'NE-ACC-1174', priority: 'P1', assignee: '王涛' },
    risk: 'high',
    requestedAt: '2026-08-25 11:20:41',
    status: 'rejected',
    decidedBy: '张明（值班经理）',
    comment: '该网元今晚有计划检修，属预期告警，不派单',
  },
  {
    id: 'apv-0019',
    runId: 'run-0030',
    agent: 'OperationsAgent',
    tool: 'send_customer_notice',
    reason: '金牌 SLA 业务中断超 15 分钟',
    parameters: { customers: '3 家', channel: 'SMS' },
    risk: 'high',
    requestedAt: '2026-08-24 09:15:22',
    status: 'rejected',
    decidedBy: '林知远（FDE Lead）',
    comment: '客户通知功能本期不上线，已记入 Decision Memory',
  },
];
