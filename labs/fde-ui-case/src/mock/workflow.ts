export interface WfNode {
  id: string;
  kind:
    | 'Start'
    | 'LLM'
    | 'Agent'
    | 'Tool'
    | 'RAG'
    | 'Condition'
    | 'Loop'
    | 'Human Approval'
    | 'API'
    | 'Code'
    | 'End';
  label: string;
  sub: string;
  x: number;
  y: number;
  config?: { label: string; value: string }[];
}

export const workflowNodes: WfNode[] = [
  { id: 'wf-start', kind: 'Start', label: '告警触发', sub: 'Alarm Event', x: 340, y: 0 },
  { id: 'wf-correlate', kind: 'Code', label: '告警收敛', sub: 'correlate_alarms()', x: 340, y: 110 },
  {
    id: 'wf-diag',
    kind: 'Agent',
    label: 'Diagnosis Agent',
    sub: '根因推理',
    x: 340,
    y: 220,
    config: [
      { label: 'Agent', value: 'DiagnosisAgent' },
      { label: 'Model', value: 'qwen2.5-72b-instruct' },
      { label: 'Max Turns', value: '8' },
      { label: 'Timeout', value: '60s' },
      { label: 'Retry', value: '2 次（指数退避）' },
      { label: 'Fallback', value: 'deepseek-v3' },
    ],
  },
  {
    id: 'wf-rag',
    kind: 'RAG',
    label: '知识检索',
    sub: 'search_knowledge',
    x: 90,
    y: 220,
    config: [
      { label: 'Tool', value: 'search_knowledge' },
      { label: 'top_k', value: '6' },
      { label: '时效过滤', value: 'last_updated >= now - 24 months' },
      { label: '输出', value: '文档片段 + 更新日期 + 相似度' },
    ],
  },
  { id: 'wf-topo', kind: 'Tool', label: '拓扑查询', sub: 'query_topology (MCP)', x: 590, y: 220 },
  {
    id: 'wf-cond',
    kind: 'Condition',
    label: '置信度 > 0.8 ?',
    sub: 'confidence gate',
    x: 340,
    y: 340,
    config: [
      { label: '表达式', value: 'diagnosis.confidence > 0.8' },
      { label: 'True 分支', value: '风险等级判断' },
      { label: 'False 分支', value: '人工复核' },
      { label: '阈值来源', value: 'Decision Memory · 2026-08-24' },
    ],
  },
  { id: 'wf-human-low', kind: 'Human Approval', label: '人工复核', sub: '转诊断班处理', x: 90, y: 450 },
  { id: 'wf-risk', kind: 'Condition', label: '风险等级 ?', sub: 'risk gate', x: 590, y: 450 },
  {
    id: 'wf-approval',
    kind: 'Human Approval',
    label: '值班经理审批',
    sub: 'HITL Approval',
    x: 590,
    y: 560,
    config: [
      { label: '审批人', value: '值班经理（张明）' },
      { label: '超时策略', value: '15 分钟未响应则升级至运维经理' },
      { label: '可选操作', value: 'Approve / Reject / Edit' },
      { label: '审批记录', value: '写入 Trace 与 Decision Memory' },
    ],
  },
  {
    id: 'wf-create',
    kind: 'API',
    label: '创建工单',
    sub: 'POST /itsm/workorder',
    x: 590,
    y: 670,
    config: [
      { label: 'Tool', value: 'create_work_order' },
      { label: 'Permission', value: 'APPROVAL_REQUIRED' },
      { label: '限流', value: '20 次/分钟（令牌桶）' },
      { label: '失败处理', value: '指数退避重试 3 次后转人工' },
    ],
  },
  { id: 'wf-recommend', kind: 'LLM', label: '生成处理建议', sub: '不派单，仅建议', x: 330, y: 560 },
  { id: 'wf-end', kind: 'End', label: '流程结束', sub: '写入 Trace / Eval', x: 460, y: 780 },
];

export const workflowEdges = [
  { id: 'we-1', source: 'wf-start', target: 'wf-correlate' },
  { id: 'we-2', source: 'wf-correlate', target: 'wf-diag' },
  { id: 'we-3', source: 'wf-diag', target: 'wf-rag', label: 'tool call' },
  { id: 'we-4', source: 'wf-diag', target: 'wf-topo', label: 'tool call' },
  { id: 'we-5', source: 'wf-diag', target: 'wf-cond' },
  { id: 'we-6', source: 'wf-cond', target: 'wf-human-low', label: 'No' },
  { id: 'we-7', source: 'wf-cond', target: 'wf-risk', label: 'Yes' },
  { id: 'we-8', source: 'wf-risk', target: 'wf-approval', label: 'High' },
  { id: 'we-9', source: 'wf-risk', target: 'wf-recommend', label: 'Low' },
  { id: 'we-10', source: 'wf-approval', target: 'wf-create', label: 'Approved' },
  { id: 'we-11', source: 'wf-create', target: 'wf-end' },
  { id: 'we-12', source: 'wf-recommend', target: 'wf-end' },
  { id: 'we-13', source: 'wf-human-low', target: 'wf-end' },
];

export const nodePalette: { kind: WfNode['kind']; color: string; desc: string }[] = [
  { kind: 'Start', color: '#52c41a', desc: '流程入口' },
  { kind: 'LLM', color: '#eb2f96', desc: '单次模型调用' },
  { kind: 'Agent', color: '#722ed1', desc: '自主 Agent 节点' },
  { kind: 'Tool', color: '#1677ff', desc: '工具调用' },
  { kind: 'RAG', color: '#13c2c2', desc: '知识检索' },
  { kind: 'Condition', color: '#faad14', desc: '条件分支' },
  { kind: 'Loop', color: '#597ef7', desc: '循环' },
  { kind: 'Human Approval', color: '#fa541c', desc: '人工审批' },
  { kind: 'API', color: '#fa8c16', desc: '外部接口' },
  { kind: 'Code', color: '#8c8c8c', desc: '代码执行' },
  { kind: 'End', color: '#434343', desc: '流程结束' },
];

export const workflowVersions = [
  { version: 'v1.3', time: '2026-08-25 14:22', author: '周衡', note: '增加检修窗口抑制分支', current: true },
  { version: 'v1.2', time: '2026-08-24 10:05', author: '周衡', note: '置信度阈值 0.75 → 0.8' },
  { version: 'v1.1', time: '2026-08-22 16:48', author: '林知远', note: '补充人工审批节点' },
  { version: 'v1.0', time: '2026-08-21 09:30', author: '周衡', note: '初始版本' },
];
