import type { BuildStep } from '../../deploy';
import type { RunStep } from '../../trace';
import type { WfNode } from '../../workflow';
import type {
  AgentDef,
  AgentRun,
  ApprovalItem,
  ContextBlock,
  McpServer,
  MemoryCandidate,
  MemoryItem,
  Permission,
  ToolDef,
} from '../../types';
import type { EvalL1Item, EvalL2Item, EvalL3Item, EvalL4Item, GraphEdge } from '../schema';

export const gridAgents: AgentDef[] = [
  {
    id: 'gagt-vision',
    name: 'VisionInspectionAgent',
    cn: '缺陷识别 Agent',
    role: '输变电设备外观缺陷识别专家',
    goal: '从巡检照片中识别设备缺陷形态，输出带证据框与置信度的缺陷候选',
    instructions: `你是输变电一次设备的外观缺陷识别专家。

工作原则：
1. 只处理 validity == "有效" 的照片，疑似补拍与重复照片一律跳过并在结果中说明；
2. 识别前必须确认照片已关联 equipment_id，未关联的转人工标注，不得凭外观猜测设备；
3. 缺陷形态限定在 PMS 常用字典 35 项子集内，罕见形态输出 "待人工分类"；
4. 宁可多报不可漏报：置信度低于 0.75 的候选仍需输出，并标记 need_human_confirm = true；
5. 夜间或逆光照片的置信度整体降权 0.1，并在 note 中注明拍摄条件；
6. 你没有定级权限，只输出缺陷形态与位置，不得判定危急/严重/一般。

输出必须符合 DefectCandidate schema。`,
    model: 'qwen2.5-vl-72b-instruct',
    provider: 'Qwen VL（本地 GPU）',
    temperature: 0.1,
    outputSchema: `{
  "candidates": [{
    "photo_id": "string",
    "equipment_id": "string",
    "defect_form": "string",
    "catalog_code": "string",
    "bbox": [0, 0, 0, 0],
    "confidence": "number(0-1)",
    "shooting_condition": "正常|夜间|逆光|雨雾",
    "need_human_confirm": "boolean",
    "note": "string"
  }],
  "skipped": [{"photo_id": "string", "reason": "string"}]
}`,
    tools: ['gtool-validate', 'gtool-match', 'gtool-recognize', 'gtool-ledger'],
    knowledge: ['设备外观缺陷图例库（1240 张标注样本）'],
    memory: ['PROJECT', 'SEMANTIC', 'EPISODIC'],
    guardrails: ['禁止输出缺陷等级', '疑似补拍照片不得参与识别', '置信度低于 0.75 必须标记待确认'],
    status: 'ready',
    runs: 45,
    successRate: 0.86,
    avgLatency: 31.2,
    avgCost: 0.38,
  },
  {
    id: 'gagt-grade',
    name: 'DefectGradingAgent',
    cn: '缺陷定级 Agent',
    role: '缺陷定级与标准适用判定员',
    goal: '依据《输变电设备缺陷定级标准》为缺陷候选定级，并给出条款依据',
    instructions: `你负责把缺陷候选转化为可上报的缺陷记录。

工作原则：
1. 每一条定级结论必须引用标准条款编号，无条款依据的一律不得输出（省公司上报硬性要求）；
2. 检索标准时必须使用 search_standard，不得凭记忆判断条款内容；
3. 判定为"危急"的缺陷，必须提交班长现场复核审批，严禁自动创建缺陷单；
4. 同一设备近三次巡检出现同类缺陷时，按规则升一级并标记为隐患项；
5. 定级存疑时向上取级（宁严勿松），并在 rationale 中说明取舍理由。`,
    model: 'qwen2.5-72b-instruct',
    provider: 'Qwen（本地部署）',
    temperature: 0.1,
    outputSchema: `{
  "defects": [{
    "equipment_id": "string",
    "catalog_code": "string",
    "level": "危急|严重|一般",
    "standard_clause": "string",
    "description": "string",
    "rationale": "string",
    "require_leader_review": "boolean"
  }]
}`,
    tools: ['gtool-standard', 'gtool-defect-history', 'gtool-create-defect'],
    knowledge: ['《输变电一次设备缺陷定级标准》(2025-03)', '《变电站运维规程》(2024-11)', '历史缺陷记录 4.6 万条'],
    memory: ['PROJECT', 'SEMANTIC', 'DECISION'],
    guardrails: ['无条款引用不得输出', '危急级强制人工审批', '禁止下调等级'],
    status: 'ready',
    runs: 41,
    successRate: 0.88,
    avgLatency: 8.4,
    avgCost: 0.16,
  },
  {
    id: 'gagt-writer',
    name: 'ReportWriterAgent',
    cn: '报告撰写 Agent',
    role: '巡检报告撰写员',
    goal: '按省公司统一模板生成结构化巡检报告，缺陷描述规范化且可溯源',
    instructions: `根据一次巡检任务的记录、照片与已定级缺陷，生成结构化巡检报告。

包含：任务概况、点位覆盖情况、照片有效性说明、缺陷清单（含条款引用与照片证据）、结论与建议。
所有数据必须来自本次任务的实际记录，禁止补全或编造；未巡视点位必须如实列出。
缺陷描述使用标准术语，不使用"好像""可能有"等模糊措辞。`,
    model: 'qwen2.5-32b-instruct',
    provider: 'Qwen（本地部署）',
    temperature: 0.3,
    outputSchema: `{
  "summary": "string",
  "coverage": {"planned": "number", "inspected": "number", "rate": "number"},
  "photo_validity": {"total": "number", "valid": "number", "issues": ["string"]},
  "defects": [{"equipment_id": "string", "level": "string", "description": "string", "clause": "string", "photos": ["string"]}],
  "conclusion": "string"
}`,
    tools: ['gtool-report', 'gtool-ledger', 'gtool-upload-pms', 'gtool-file'],
    knowledge: ['省公司巡检报告模板 v4', '标准缺陷术语表'],
    memory: ['SESSION', 'PROJECT'],
    guardrails: ['数据必须来自本次任务记录', '未巡视点位必须如实列出', '禁止模糊措辞'],
    status: 'ready',
    runs: 38,
    successRate: 0.95,
    avgLatency: 6.4,
    avgCost: 0.12,
  },
  {
    id: 'gagt-qc',
    name: 'QualityCheckAgent',
    cn: '报告质检 Agent',
    role: '报告完整性与一致性检查员',
    goal: '在报告提交前检查字段完整性、条款引用有效性与照片证据齐备性',
    instructions: `对生成的报告草稿做提交前质检。

检查项：
1. 每条缺陷是否有 standard_clause 且条款编号存在于标准库；
2. 每条缺陷是否至少关联一张有效照片；
3. 覆盖率与实际记录数是否一致；
4. 是否存在危急缺陷未经班长签字。
发现问题时输出阻断原因，不得自行修改报告内容。`,
    model: 'qwen2.5-7b-instruct',
    provider: 'Qwen（本地部署）',
    temperature: 0.0,
    outputSchema: `{"passed": "boolean", "blocking_issues": ["string"], "warnings": ["string"]}`,
    tools: ['gtool-standard', 'gtool-file'],
    knowledge: [],
    memory: ['SESSION'],
    guardrails: ['不得修改报告内容', '单次检查时长 < 3s'],
    status: 'draft',
    runs: 7,
    successRate: 0.86,
    avgLatency: 2.1,
    avgCost: 0.02,
  },
];

export const gridWorkflowNodes: WfNode[] = [
  { id: 'gwf-start', kind: 'Start', label: '巡检数据上传', sub: 'Task + Photos', x: 400, y: 0 },
  {
    id: 'gwf-validate',
    kind: 'Code',
    label: '照片有效性校验',
    sub: 'validate_photo()',
    x: 400,
    y: 110,
    config: [
      { label: '校验项', value: 'EXIF 时间 / GPS / 清晰度 / 重复度' },
      { label: '时序基准', value: 'EXIF DateTimeOriginal（禁用 upload_time）' },
      { label: '清晰度阈值', value: '拉普拉斯方差 > 90' },
      { label: '重复判定', value: '感知哈希汉明距离 < 6' },
    ],
  },
  {
    id: 'gwf-cond-valid',
    kind: 'Condition',
    label: '有效照片 ≥ 80% ?',
    sub: 'validity gate',
    x: 400,
    y: 220,
    config: [
      { label: '表达式', value: 'photos.valid_rate >= 0.8' },
      { label: 'True 分支', value: '设备匹配' },
      { label: 'False 分支', value: '通知补拍' },
      { label: '阈值来源', value: 'Decision Memory · 2026-08-23' },
    ],
  },
  { id: 'gwf-recapture', kind: 'Human Approval', label: '通知补拍', sub: '退回巡检员', x: 120, y: 330 },
  {
    id: 'gwf-match',
    kind: 'Tool',
    label: '设备匹配',
    sub: 'match_equipment()',
    x: 680,
    y: 330,
    config: [
      { label: 'Tool', value: 'match_equipment' },
      { label: '匹配策略', value: '铭牌 OCR → GPS 邻近 → 点位顺序' },
      { label: '兜底', value: '三级策略均失败转人工标注' },
      { label: '当前匹配率', value: '93.4%（目标 > 95%）' },
    ],
  },
  {
    id: 'gwf-vision',
    kind: 'Agent',
    label: 'VisionInspectionAgent',
    sub: '缺陷识别',
    x: 680,
    y: 440,
    config: [
      { label: 'Agent', value: 'VisionInspectionAgent' },
      { label: 'Model', value: 'qwen2.5-vl-72b-instruct' },
      { label: '批大小', value: '8 张/批' },
      { label: 'Timeout', value: '90s' },
      { label: '夜间降权', value: '置信度 -0.1' },
      { label: 'Guardrail', value: '禁止输出缺陷等级' },
    ],
  },
  { id: 'gwf-vlm', kind: 'Tool', label: '视觉识别', sub: 'recognize_defect (MCP)', x: 940, y: 440 },
  {
    id: 'gwf-cond-conf',
    kind: 'Condition',
    label: '置信度 > 0.75 ?',
    sub: 'confidence gate',
    x: 680,
    y: 550,
    config: [
      { label: '表达式', value: 'candidate.confidence > 0.75' },
      { label: 'True 分支', value: '缺陷定级' },
      { label: 'False 分支', value: '人工逐条确认' },
      { label: '阈值来源', value: 'Decision Memory · 2026-08-25（0.85 → 0.75）' },
    ],
  },
  { id: 'gwf-manual', kind: 'Human Approval', label: '人工确认缺陷', sub: '巡检员逐条确认', x: 400, y: 660 },
  {
    id: 'gwf-rag',
    kind: 'RAG',
    label: '定级标准检索',
    sub: 'search_standard',
    x: 940,
    y: 660,
    config: [
      { label: 'Tool', value: 'search_standard' },
      { label: '语料', value: '《输变电一次设备缺陷定级标准》2025-03' },
      { label: 'top_k', value: '5' },
      { label: '输出', value: '条款编号 + 原文 + 相似度' },
    ],
  },
  {
    id: 'gwf-grade',
    kind: 'Agent',
    label: 'DefectGradingAgent',
    sub: '按条款定级',
    x: 680,
    y: 770,
    config: [
      { label: 'Agent', value: 'DefectGradingAgent' },
      { label: 'Model', value: 'qwen2.5-72b-instruct' },
      { label: '强制引用', value: '无 standard_clause 直接拦截' },
      { label: '复现升级', value: '近三次同类缺陷升一级' },
      { label: 'Guardrail', value: '禁止下调等级' },
    ],
  },
  { id: 'gwf-cond-crit', kind: 'Condition', label: '存在危急缺陷 ?', sub: 'risk gate', x: 680, y: 880 },
  {
    id: 'gwf-review',
    kind: 'Human Approval',
    label: '班长现场复核',
    sub: 'HITL · 签字确认',
    x: 960,
    y: 990,
    config: [
      { label: '审批人', value: '巡检班长（马国庆）' },
      { label: '触发条件', value: 'level == 危急' },
      { label: '超时策略', value: '30 分钟未响应升级至运维部主任' },
      { label: '可选操作', value: '签字通过 / 降级 / 驳回重拍' },
      { label: '审批记录', value: '写入 Trace 与 Decision Memory' },
    ],
  },
  {
    id: 'gwf-order',
    kind: 'API',
    label: '创建 PMS 缺陷单',
    sub: 'POST /pms/defect',
    x: 960,
    y: 1100,
    config: [
      { label: 'Tool', value: 'create_defect_order' },
      { label: 'Permission', value: 'APPROVAL_REQUIRED' },
      { label: '幂等键', value: 'task_id + equipment_id + catalog_code' },
      { label: '失败处理', value: '重试 3 次后落本地待补传队列' },
    ],
  },
  { id: 'gwf-report', kind: 'LLM', label: 'ReportWriterAgent', sub: '生成报告草稿', x: 460, y: 1100 },
  {
    id: 'gwf-upload',
    kind: 'API',
    label: '上传 PMS',
    sub: 'POST /pms/report',
    x: 460,
    y: 1210,
    config: [
      { label: 'Tool', value: 'upload_to_pms' },
      { label: 'Permission', value: 'APPROVAL_REQUIRED' },
      { label: '弱网策略', value: '离线队列 + 回站后自动补传' },
      { label: '回执', value: 'PMS 报告编号写回 InspectionReport' },
    ],
  },
  { id: 'gwf-end', kind: 'End', label: '流程结束', sub: '写入 Trace / Eval', x: 700, y: 1320 },
];

export const gridWorkflowEdges: GraphEdge[] = [
  { id: 'gwe-1', source: 'gwf-start', target: 'gwf-validate' },
  { id: 'gwe-2', source: 'gwf-validate', target: 'gwf-cond-valid' },
  { id: 'gwe-3', source: 'gwf-cond-valid', target: 'gwf-recapture', label: 'No' },
  { id: 'gwe-4', source: 'gwf-cond-valid', target: 'gwf-match', label: 'Yes' },
  { id: 'gwe-5', source: 'gwf-match', target: 'gwf-vision' },
  { id: 'gwe-6', source: 'gwf-vision', target: 'gwf-vlm', label: 'tool call' },
  { id: 'gwe-7', source: 'gwf-vision', target: 'gwf-cond-conf' },
  { id: 'gwe-8', source: 'gwf-cond-conf', target: 'gwf-manual', label: 'No' },
  { id: 'gwe-9', source: 'gwf-cond-conf', target: 'gwf-grade', label: 'Yes' },
  { id: 'gwe-10', source: 'gwf-manual', target: 'gwf-grade', label: '确认后' },
  { id: 'gwe-11', source: 'gwf-grade', target: 'gwf-rag', label: 'tool call' },
  { id: 'gwe-12', source: 'gwf-grade', target: 'gwf-cond-crit' },
  { id: 'gwe-13', source: 'gwf-cond-crit', target: 'gwf-review', label: '危急' },
  { id: 'gwe-14', source: 'gwf-cond-crit', target: 'gwf-report', label: '严重/一般' },
  { id: 'gwe-15', source: 'gwf-review', target: 'gwf-order', label: '签字通过' },
  { id: 'gwe-16', source: 'gwf-order', target: 'gwf-report' },
  { id: 'gwe-17', source: 'gwf-report', target: 'gwf-upload' },
  { id: 'gwe-18', source: 'gwf-upload', target: 'gwf-end' },
  { id: 'gwe-19', source: 'gwf-recapture', target: 'gwf-end' },
];

export const gridWorkflowVersions = [
  { version: 'v2.1', time: '2026-08-25 17:40', author: '孟晓', note: '置信度阈值 0.85 → 0.75（高召回优先）', current: true },
  { version: 'v2.0', time: '2026-08-24 15:12', author: '孟晓', note: '拆分识别与定级为两个 Agent' },
  { version: 'v1.2', time: '2026-08-22 11:26', author: '沈立群', note: '增加班长现场复核审批节点' },
  { version: 'v1.1', time: '2026-08-21 14:03', author: '范志远', note: '补充照片有效性校验前置节点' },
  { version: 'v1.0', time: '2026-08-20 09:15', author: '孟晓', note: '初始版本' },
];

export const gridMemories: MemoryItem[] = [
  {
    id: 'gmem-p-1',
    type: 'PROJECT',
    content: '判定为"危急"的缺陷必须由班长现场复核并签字后方可上报，任何 Agent 不得自动创建危急级缺陷单。',
    summary: '危急缺陷强制班长签字',
    source: '马国庆访谈 gex-5 · 去年漏报事故整改要求',
    importance: 0.99,
    confidence: 0.99,
    createdAt: '2026-08-17 10:20',
    lastUsedAt: '2026-08-26 09:41',
    pinned: true,
  },
  {
    id: 'gmem-p-2',
    type: 'PROJECT',
    content: '照片时序判断只能使用 EXIF 拍摄时间，禁止使用 upload_time——站内 4G 信号差导致离线缓存后批量上传。',
    summary: 'EXIF 时间为唯一时序依据',
    source: '马国庆访谈 gex-8 · Run #0022 教训',
    importance: 0.96,
    confidence: 0.98,
    createdAt: '2026-08-18 09:05',
    lastUsedAt: '2026-08-26 09:41',
    pinned: true,
  },
  {
    id: 'gmem-p-3',
    type: 'PROJECT',
    content: '缺陷定级结论必须引用《输变电一次设备缺陷定级标准》的具体条款编号，无条款引用的结论被 Guardrail 拦截。',
    summary: '定级必须引用标准条款',
    source: '省公司吴主管访谈 gex-60',
    importance: 0.94,
    confidence: 0.97,
    createdAt: '2026-08-18 09:12',
    lastUsedAt: '2026-08-26 09:42',
    pinned: true,
  },
  {
    id: 'gmem-p-4',
    type: 'PROJECT',
    content: 'create_defect_order 与 upload_pms 固定为 APPROVAL_REQUIRED；所有模型推理在电力内网本地 GPU 完成，禁止外网调用。',
    summary: 'PMS 写操作审批 + 数据不出内网',
    source: '韩志远访谈 gex-23 / gex-24',
    importance: 0.95,
    confidence: 0.99,
    createdAt: '2026-08-18 09:20',
    lastUsedAt: '2026-08-25 20:11',
    pinned: true,
  },
  {
    id: 'gmem-p-5',
    type: 'PROJECT',
    content: '缺陷分类只在 PMS 常用子集 35 项内选择，罕见形态输出"待人工分类"，不得在 187 项全集里自由选择。',
    summary: '缺陷字典限定常用子集',
    source: '郑海涛访谈 gex-41',
    importance: 0.87,
    confidence: 0.93,
    createdAt: '2026-08-19 14:30',
    lastUsedAt: '2026-08-26 09:42',
    pinned: false,
  },
  {
    id: 'gmem-s-1',
    type: 'SEMANTIC',
    content: '主变套管油位低于下限刻度属于危急缺陷，依据《输变电一次设备缺陷定级标准》3.2.1 条，须立即上报并安排停电处理。',
    summary: '套管油位异常为危急缺陷',
    source: '《输变电一次设备缺陷定级标准》(2025-03) 3.2.1',
    importance: 0.93,
    confidence: 0.97,
    createdAt: '2026-08-20 11:15',
    lastUsedAt: '2026-08-26 09:42',
    pinned: false,
  },
  {
    id: 'gmem-s-2',
    type: 'SEMANTIC',
    content: '呼吸器硅胶变色超过 2/3 属一般缺陷（5.1.4 条），可在下次计划检修时一并处理，不需单独停电。',
    summary: '硅胶变色定级标准',
    source: '《输变电一次设备缺陷定级标准》(2025-03) 5.1.4',
    importance: 0.78,
    confidence: 0.95,
    createdAt: '2026-08-20 11:22',
    lastUsedAt: '2026-08-26 09:42',
    pinned: false,
  },
  {
    id: 'gmem-s-3',
    type: 'SEMANTIC',
    content: '断路器 A/B/C 三相外观高度相似，照片区分需依赖铭牌 OCR 或巡视路线顺序，仅靠视觉特征匹配错误率超过 40%。',
    summary: '断路器三相需靠铭牌区分',
    source: '范志远匹配实验 2026-08-21',
    importance: 0.85,
    confidence: 0.9,
    createdAt: '2026-08-21 16:40',
    lastUsedAt: '2026-08-26 09:41',
    pinned: false,
  },
  {
    id: 'gmem-e-1',
    type: 'EPISODIC',
    content:
      '任务：校验 IT-20260822-0098 的 312 张照片。动作：直接用 upload_time 与任务时间窗比对判定补拍。结果：23 张正常照片被误判为补拍，覆盖率被错误扣减，巡检员投诉。教训：站内离线缓存导致上传时间集中，必须改用 EXIF 拍摄时间。',
    summary: '用上传时间判定补拍导致误判',
    source: 'Run #run-0022（2026-08-22）',
    importance: 0.94,
    confidence: 0.96,
    createdAt: '2026-08-22 18:30',
    lastUsedAt: '2026-08-26 09:41',
    pinned: true,
    agent: 'VisionInspectionAgent',
  },
  {
    id: 'gmem-e-2',
    type: 'EPISODIC',
    content:
      '任务：识别夜间补充巡视的 86 张照片。动作：使用统一置信度阈值 0.85。结果：78% 的候选被判为低置信度，全部转人工，实际起到反效果。教训：夜间与逆光照片需单独降权并降低阈值，否则人工负担反而增加。',
    summary: '夜间照片统一阈值导致大量转人工',
    source: 'Run #run-0017（2026-08-21）',
    importance: 0.88,
    confidence: 0.91,
    createdAt: '2026-08-21 21:05',
    lastUsedAt: '2026-08-25 15:20',
    pinned: false,
    agent: 'VisionInspectionAgent',
  },
  {
    id: 'gmem-e-3',
    type: 'EPISODIC',
    content:
      '任务：生成 IT-20260824-0121 巡检报告。动作：缺陷描述未引用标准条款编号。结果：被设备专责郑海涛退回，要求补充定级依据。教训：条款引用是省公司硬性要求，须在 Guardrail 层拦截而非事后补。',
    summary: '缺陷描述未引用条款被退回',
    source: 'Run #run-0029（2026-08-24）',
    importance: 0.9,
    confidence: 0.94,
    createdAt: '2026-08-24 17:12',
    lastUsedAt: '2026-08-26 09:42',
    pinned: true,
    agent: 'ReportWriterAgent',
  },
  {
    id: 'gmem-d-1',
    type: 'DECISION',
    content:
      '决策：采用"AI 识别 + 人工确认"而非全自动识别上报。原因：业务方明确宁可多报不可漏报，且去年漏报事故形成了制度红线。证据：周雪梅访谈 gex-50、马国庆访谈 gex-5。负责人：沈立群。影响：人工干预率维持在 26% 左右，但漏检风险可控。',
    summary: '采用 AI 识别 + 人工确认',
    source: '方案评审 2026-08-21',
    importance: 0.96,
    confidence: 0.97,
    createdAt: '2026-08-21 10:30',
    lastUsedAt: '2026-08-26 09:40',
    pinned: true,
  },
  {
    id: 'gmem-d-2',
    type: 'DECISION',
    content:
      '决策：识别置信度阈值定为 0.75，低于通信案例的 0.8。原因：现场照片质量参差，阈值过高会把真实缺陷筛掉。证据：回归集上 0.75 对应召回 0.94、准确率 0.88；0.85 时召回骤降至 0.79。负责人：许琳。影响：误报增加约 6 个百分点，由人工确认吸收。',
    summary: '置信度阈值定为 0.75',
    source: '评测结果讨论 2026-08-25',
    importance: 0.91,
    confidence: 0.9,
    createdAt: '2026-08-25 16:45',
    lastUsedAt: '2026-08-26 09:42',
    pinned: false,
  },
  {
    id: 'gmem-d-3',
    type: 'DECISION',
    content:
      '决策：无人机巡检数据与红外测温图谱本期不接入，移入二期。原因：无人机影像的视角与尺度差异大，需要单独的模型适配，超出 POC 周期。负责人：沈立群。影响：省公司力推的无人机方向本期无法演示，需在汇报中说明路线图。',
    summary: '无人机与红外移入二期',
    source: '范围评审 2026-08-20',
    importance: 0.74,
    confidence: 0.92,
    createdAt: '2026-08-20 15:50',
    lastUsedAt: '2026-08-20 15:50',
    pinned: false,
  },
  {
    id: 'gmem-ss-1',
    type: 'SESSION',
    content: '用户询问：为什么 12 张照片没有参与识别？回答：这 12 张缺少 GPS 且未匹配到设备，已转人工标注队列。',
    summary: '关于未参与识别照片的追问',
    source: 'Session #sess-1104',
    importance: 0.44,
    confidence: 0.82,
    createdAt: '2026-08-26 09:48',
    lastUsedAt: '2026-08-26 09:48',
    pinned: false,
  },
  {
    id: 'gmem-ss-2',
    type: 'SESSION',
    content: '用户纠正：把"套管疑似渗油"改为"套管法兰面可见油迹，面积约 3cm×5cm"，要求描述具体化。',
    summary: '用户要求缺陷描述具体化',
    source: 'Session #sess-1104',
    importance: 0.56,
    confidence: 0.88,
    createdAt: '2026-08-26 09:52',
    lastUsedAt: '2026-08-26 09:52',
    pinned: false,
  },
];

export const gridMemoryCandidates: MemoryCandidate[] = [
  {
    id: 'gmc-1',
    type: 'SEMANTIC',
    content: '杭州湾 220kV 变电站 1 号主变为 2009 年投运的 SFSZ11-180000/220 型，套管渗油为该型号高发缺陷，近三年该站累计记录 7 次。',
    importance: 0.79,
    confidence: 0.93,
    reusability: 0.72,
    safety: 1.0,
    source: 'Run #run-0041 台账与历史查询结果',
    status: 'pending',
  },
  {
    id: 'gmc-2',
    type: 'EPISODIC',
    content:
      '任务：识别 IT-20260825-0136 的 194 张照片。动作：先做设备匹配再识别。结果：匹配率 97.4%，识别耗时较上一轮下降 22%。教训：先匹配设备再识别，可用台账型号信息约束候选缺陷形态，显著提升效率。',
    importance: 0.85,
    confidence: 0.89,
    reusability: 0.84,
    safety: 1.0,
    source: 'Run #run-0041 自动总结',
    status: 'pending',
  },
  {
    id: 'gmc-3',
    type: 'DECISION',
    content: '决策：把照片有效性阈值从 80% 下调到 70%，避免因少量缺 GPS 照片就退回整个任务。',
    importance: 0.68,
    confidence: 0.61,
    reusability: 0.58,
    safety: 0.85,
    source: '孟晓在 Session 中的口头提议',
    status: 'pending',
  },
  {
    id: 'gmc-4',
    type: 'PROJECT',
    content: '第三班组马班长在 17:00 后平均需要 42 分钟才响应危急缺陷复核请求，可能影响当日上报目标。',
    importance: 0.7,
    confidence: 0.55,
    reusability: 0.52,
    safety: 0.7,
    source: '审批记录统计推断',
    status: 'pending',
  },
];

export const gridContextBlocks: ContextBlock[] = [
  {
    key: 'system',
    name: 'System Instruction',
    tokens: 186,
    source: 'Harness 默认模板',
    content:
      '你运行在 AI-FDE Harness 受控环境中。所有工具调用受权限策略约束，高风险动作需人工审批。输出必须符合指定 JSON Schema。禁止编造证据。',
  },
  {
    key: 'role',
    name: 'Agent Role & Instructions',
    tokens: 468,
    source: 'VisionInspectionAgent 定义',
    content:
      '你是输变电一次设备的外观缺陷识别专家。原则：1) 只处理有效照片；2) 未关联设备的转人工；3) 只在常用字典 35 项内选择；4) 宁可多报不可漏报；5) 夜间/逆光降权 0.1；6) 无定级权限。',
  },
  {
    key: 'task',
    name: 'Current Task',
    tokens: 142,
    source: 'Run 输入',
    content:
      '巡检任务 IT-20260826-0143：杭州湾 220kV 变电站，巡检员李婷于 08:12-12:40 完成 46 个点位巡视，上传照片 287 张，请完成有效性校验、设备匹配、缺陷识别与定级，并生成报告。',
  },
  {
    key: 'rules',
    name: 'Project Rules',
    tokens: 298,
    source: 'Project Memory（4 条 pinned）',
    content:
      '① 危急缺陷必须班长现场复核签字；② 照片时序只认 EXIF 拍摄时间；③ 定级必须引用标准条款编号；④ PMS 写操作强制审批且推理不出内网。',
  },
  {
    key: 'memory',
    name: 'Relevant Memory',
    tokens: 402,
    source: 'Episodic ×2 / Semantic ×2（相似度检索）',
    content:
      '经验：用上传时间判定补拍导致 23 张误判（Run #0022）；夜间照片统一阈值导致 78% 转人工（Run #0017）。语义：套管油位低于下限为危急（3.2.1）；断路器三相需靠铭牌 OCR 区分。',
  },
  {
    key: 'ontology',
    name: 'Ontology Schema',
    tokens: 566,
    source: 'Ontology Service（8 Objects / 8 Relations）',
    content:
      'Substation contains Equipment(equipment_id, category, model, phase)；InspectionTask covers Substation；Photo(exif_time, gps, validity) attached_to InspectionRecord；InspectionRecord identifies Defect(catalog_code, level, standard_clause, confidence)；Defect reported_in InspectionReport。',
  },
  {
    key: 'retrieved',
    name: 'Retrieved Knowledge',
    tokens: 1080,
    source: 'RAG · 5 个条款（按条款粒度切分）',
    content:
      '《输变电一次设备缺陷定级标准》(2025-03) 3.2.1 套管油位；5.1.4 呼吸器硅胶；4.3.2 金属部件锈蚀；《变电站运维规程》(2024-11) 7.2 渗漏油判据…',
    trimmed: true,
  },
  {
    key: 'catalog',
    name: 'Defect Catalog Subset',
    tokens: 386,
    source: 'PMS 字典常用子集（35 / 187 项）',
    content:
      '渗漏油、锈蚀、破损、异物搭挂、油位异常、硅胶变色、表计模糊、接头发热、绝缘子污秽、基础沉降…（其余 152 项罕见分类未注入）',
  },
  {
    key: 'conversation',
    name: 'Recent Conversation',
    tokens: 88,
    source: 'Session Memory（最近 3 轮）',
    content: '用户：这次重点看 1 号主变。助手：已了解，将优先处理主变区域照片并在报告中单列。',
  },
  {
    key: 'tools',
    name: 'Tool Schema',
    tokens: 424,
    source: 'Tool Registry（4 个已授权工具）',
    content: 'validate_photo、match_equipment、recognize_defect、query_equipment_ledger 的函数签名与参数定义。',
  },
];

export const gridTrimmedContent = [
  { name: 'PMS 罕见缺陷分类 152 项', reason: '限定常用子集策略，罕见项不注入上下文', tokens: 1640 },
  { name: '《变电站运维规程》第 9-14 章', reason: '与本次巡视点位无关（检修与试验章节）', tokens: 2210 },
  { name: '同站历史缺陷记录第 21-96 条', reason: '超出 Top-K 检索窗口（保留最近 20 条）', tokens: 1380 },
  { name: 'Session 历史第 4-9 轮', reason: '超出会话窗口保留策略（保留最近 3 轮）', tokens: 760 },
];

export const gridTools: ToolDef[] = [
  {
    id: 'gtool-validate',
    name: 'validate_photo',
    cn: '照片有效性校验',
    type: 'Function',
    description: '校验 EXIF 拍摄时间是否落在任务时间窗、GPS 是否在站址范围、是否与历史照片感知哈希重复',
    inputSchema: '{ "photo_ids": ["string"], "task_id": "string" }',
    outputSchema: '{ "valid": ["string"], "no_gps": ["string"], "suspect_reshoot": ["string"], "duplicated": ["string"] }',
    risk: 'low',
    timeout: 30,
    calls: 187,
  },
  {
    id: 'gtool-match',
    name: 'match_equipment',
    cn: '照片设备匹配',
    type: 'Function',
    description: '结合二维码、铭牌 OCR、GPS 与巡视路线顺序，把照片关联到台账设备',
    inputSchema: '{ "photo_ids": ["string"], "station_id": "string" }',
    outputSchema: '{ "matched": [{"photo_id": "string", "equipment_id": "string", "method": "string", "score": "number"}], "unmatched": ["string"] }',
    risk: 'low',
    timeout: 45,
    calls: 164,
  },
  {
    id: 'gtool-recognize',
    name: 'recognize_defect',
    cn: '缺陷视觉识别',
    type: 'MCP',
    description: '调用本地多模态模型批量识别照片中的设备缺陷形态并返回证据框',
    inputSchema: '{ "photo_ids": ["string"], "equipment_context": "object", "catalog_subset": ["string"] }',
    outputSchema: '{ "candidates": [{"photo_id": "string", "defect_form": "string", "bbox": [0,0,0,0], "confidence": "number"}] }',
    risk: 'low',
    timeout: 120,
    calls: 152,
    server: 'vision-mcp',
  },
  {
    id: 'gtool-standard',
    name: 'search_standard',
    cn: '定级标准检索',
    type: 'RAG',
    description: '在缺陷定级标准与运维规程中按条款粒度检索，返回条款编号与原文',
    inputSchema: '{ "query": "string", "equipment_category": "string", "top_k": "number" }',
    outputSchema: '{ "clauses": [{"clause": "string", "text": "string", "doc": "string", "score": "number"}] }',
    risk: 'low',
    timeout: 20,
    calls: 203,
  },
  {
    id: 'gtool-ledger',
    name: 'query_equipment_ledger',
    cn: '设备台账查询',
    type: 'Database',
    description: '按站点、设备编号或类别查询台账中的型号、相别、投运日期与二维码标识',
    inputSchema: '{ "station_id": "string", "category": "string" }',
    outputSchema: '{ "equipments": [{"equipment_id": "string", "model": "string", "phase": "string", "commission_date": "date"}] }',
    risk: 'low',
    timeout: 15,
    calls: 118,
    server: 'ledger-mcp',
  },
  {
    id: 'gtool-defect-history',
    name: 'query_defect_history',
    cn: '历史缺陷查询',
    type: 'Database',
    description: '按设备或站点查询历史缺陷记录与处理结果，用于重复缺陷升级判定',
    inputSchema: '{ "equipment_id": "string", "months": "number" }',
    outputSchema: '{ "records": ["object"], "recurrence_count": "number" }',
    risk: 'low',
    timeout: 15,
    calls: 91,
    server: 'ledger-mcp',
  },
  {
    id: 'gtool-report',
    name: 'generate_report',
    cn: '报告模板渲染',
    type: 'Function',
    description: '按省公司统一模板渲染巡检报告（Word / PDF），嵌入照片证据与条款引用',
    inputSchema: '{ "task_id": "string", "defects": ["object"], "template": "string" }',
    outputSchema: '{ "report_id": "string", "file_path": "string", "pages": "number" }',
    risk: 'medium',
    timeout: 60,
    calls: 74,
  },
  {
    id: 'gtool-create-defect',
    name: 'create_defect_order',
    cn: '创建 PMS 缺陷单',
    type: 'API',
    description: '在 PMS 系统创建缺陷单（业务写操作，危急级须班长签字后方可调用）',
    inputSchema: '{ "equipment_id": "string", "catalog_code": "string", "level": "string", "description": "string", "clause": "string" }',
    outputSchema: '{ "defect_no": "string", "status": "string", "created_at": "datetime" }',
    risk: 'high',
    timeout: 30,
    calls: 46,
  },
  {
    id: 'gtool-upload-pms',
    name: 'upload_pms',
    cn: '报告上传 PMS',
    type: 'API',
    description: '把审核通过的巡检报告上传至 PMS 并归档到对应任务',
    inputSchema: '{ "report_id": "string", "task_id": "string" }',
    outputSchema: '{ "status": "string", "pms_url": "string" }',
    risk: 'high',
    timeout: 60,
    calls: 38,
  },
  {
    id: 'gtool-notify',
    name: 'notify_duty',
    cn: '值班通知',
    type: 'Mock',
    description: '向值班人员推送危急缺陷通知（本期为 Mock 实现）',
    inputSchema: '{ "receivers": ["string"], "message": "string" }',
    outputSchema: '{ "sent": "number" }',
    risk: 'high',
    timeout: 20,
    calls: 0,
  },
  {
    id: 'gtool-delete-photo',
    name: 'delete_photo',
    cn: '删除照片',
    type: 'MCP',
    description: '从工作区删除照片文件（项目决策：全面禁止，原始证据不得删除）',
    inputSchema: '{ "photo_ids": ["string"] }',
    outputSchema: '{ "deleted": "number" }',
    risk: 'high',
    timeout: 15,
    calls: 0,
    server: 'file-mcp',
  },
  {
    id: 'gtool-file',
    name: 'workspace_file',
    cn: '工作区文件读写',
    type: 'MCP',
    description: '读写项目工作区文件，限制在 /workspace 目录内',
    inputSchema: '{ "op": "read|write|list", "path": "string", "content": "string" }',
    outputSchema: '{ "ok": "boolean", "data": "string" }',
    risk: 'medium',
    timeout: 15,
    calls: 96,
    server: 'file-mcp',
  },
];

export const gridPermissions: Record<string, Record<string, Permission>> = {
  'gagt-vision': {
    'gtool-validate': 'ALLOW',
    'gtool-match': 'ALLOW',
    'gtool-recognize': 'ALLOW',
    'gtool-standard': 'ALLOW',
    'gtool-ledger': 'ALLOW',
    'gtool-defect-history': 'ALLOW',
    'gtool-report': 'DENY',
    'gtool-create-defect': 'DENY',
    'gtool-upload-pms': 'DENY',
    'gtool-notify': 'DENY',
    'gtool-delete-photo': 'DENY',
    'gtool-file': 'ALLOW',
  },
  'gagt-grade': {
    'gtool-validate': 'DENY',
    'gtool-match': 'DENY',
    'gtool-recognize': 'DENY',
    'gtool-standard': 'ALLOW',
    'gtool-ledger': 'ALLOW',
    'gtool-defect-history': 'ALLOW',
    'gtool-report': 'DENY',
    'gtool-create-defect': 'APPROVAL_REQUIRED',
    'gtool-upload-pms': 'DENY',
    'gtool-notify': 'APPROVAL_REQUIRED',
    'gtool-delete-photo': 'DENY',
    'gtool-file': 'ALLOW',
  },
  'gagt-writer': {
    'gtool-validate': 'DENY',
    'gtool-match': 'DENY',
    'gtool-recognize': 'DENY',
    'gtool-standard': 'ALLOW',
    'gtool-ledger': 'ALLOW',
    'gtool-defect-history': 'ALLOW',
    'gtool-report': 'ALLOW',
    'gtool-create-defect': 'DENY',
    'gtool-upload-pms': 'APPROVAL_REQUIRED',
    'gtool-notify': 'DENY',
    'gtool-delete-photo': 'DENY',
    'gtool-file': 'ALLOW',
  },
  'gagt-qc': {
    'gtool-validate': 'ALLOW',
    'gtool-match': 'DENY',
    'gtool-recognize': 'DENY',
    'gtool-standard': 'ALLOW',
    'gtool-ledger': 'ALLOW',
    'gtool-defect-history': 'DENY',
    'gtool-report': 'DENY',
    'gtool-create-defect': 'DENY',
    'gtool-upload-pms': 'DENY',
    'gtool-notify': 'DENY',
    'gtool-delete-photo': 'DENY',
    'gtool-file': 'ALLOW',
  },
};

export const gridMcpServers: McpServer[] = [
  {
    id: 'vision-mcp',
    name: 'Vision Inference MCP',
    endpoint: 'mcp://10.32.7.18:8941/vision',
    status: 'connected',
    tools: 4,
    latency: 640,
    desc: '本地 GPU 多模态推理服务，提供缺陷识别、铭牌 OCR、图像质量评估',
  },
  {
    id: 'ledger-mcp',
    name: 'Equipment Ledger MCP',
    endpoint: 'mcp://10.32.7.22:8942/ledger',
    status: 'connected',
    tools: 5,
    latency: 46,
    desc: '设备台账与历史缺陷库只读查询，禁止写操作',
  },
  {
    id: 'file-mcp',
    name: 'File Workspace MCP',
    endpoint: 'mcp://localhost:8932/files',
    status: 'connected',
    tools: 4,
    latency: 14,
    desc: '巡检照片与报告文件读写，限制在沙箱目录内',
  },
  {
    id: 'pms-mcp',
    name: 'PMS Enterprise MCP',
    endpoint: 'mcp://10.32.8.5:8945/pms',
    status: 'error',
    tools: 6,
    latency: 0,
    desc: 'PMS 生产管理系统接入，测试环境写权限尚未开通',
  },
  {
    id: 'weather-mcp',
    name: 'Weather MCP',
    endpoint: 'mcp://gateway/weather',
    status: 'disabled',
    tools: 2,
    latency: 0,
    desc: '气象数据接入，需外网访问，内网可得性待确认',
  },
];

export const gridMcpDiscoveredTools: Record<string, { name: string; desc: string; enabled: boolean }[]> = {
  'vision-mcp': [
    { name: 'defect.recognize', desc: '批量缺陷识别', enabled: true },
    { name: 'nameplate.ocr', desc: '设备铭牌文字识别', enabled: true },
    { name: 'image.quality', desc: '图像质量与光照评估', enabled: true },
    { name: 'image.phash', desc: '感知哈希去重', enabled: true },
  ],
  'ledger-mcp': [
    { name: 'equipment.query', desc: '设备台账查询', enabled: true },
    { name: 'defect.history', desc: '历史缺陷查询', enabled: true },
    { name: 'station.info', desc: '变电站基础信息', enabled: true },
    { name: 'catalog.dict', desc: '缺陷分类字典', enabled: true },
    { name: 'ledger.update', desc: '台账写入', enabled: false },
  ],
  'file-mcp': [
    { name: 'file.read', desc: '读取文件', enabled: true },
    { name: 'file.write', desc: '写入文件', enabled: true },
    { name: 'file.list', desc: '列出目录', enabled: true },
    { name: 'file.delete', desc: '删除文件', enabled: false },
  ],
  'pms-mcp': [
    { name: 'defect.create', desc: '创建缺陷单', enabled: false },
    { name: 'defect.query', desc: '查询缺陷单', enabled: false },
    { name: 'report.upload', desc: '上传巡检报告', enabled: false },
    { name: 'report.query', desc: '查询报告', enabled: false },
    { name: 'task.sync', desc: '同步巡检任务', enabled: false },
    { name: 'defect.close', desc: '关闭缺陷单', enabled: false },
  ],
  'weather-mcp': [
    { name: 'weather.history', desc: '历史天气查询', enabled: false },
    { name: 'weather.current', desc: '实时天气', enabled: false },
  ],
};

export const gridToolCallLogs = [
  { time: '09:41:12', tool: 'validate_photo', agent: 'VisionInspectionAgent', status: 'success', latency: 3200, permission: 'ALLOW' },
  { time: '09:41:18', tool: 'match_equipment', agent: 'VisionInspectionAgent', status: 'success', latency: 2600, permission: 'ALLOW' },
  { time: '09:41:24', tool: 'recognize_defect', agent: 'VisionInspectionAgent', status: 'success', latency: 12400, permission: 'ALLOW' },
  { time: '09:41:48', tool: 'search_standard', agent: 'DefectGradingAgent', status: 'success', latency: 1900, permission: 'ALLOW' },
  { time: '09:41:52', tool: 'query_defect_history', agent: 'DefectGradingAgent', status: 'success', latency: 680, permission: 'ALLOW' },
  { time: '09:42:06', tool: 'create_defect_order', agent: 'DefectGradingAgent', status: 'waiting', latency: 0, permission: 'APPROVAL_REQUIRED' },
  { time: '08:55:31', tool: 'delete_photo', agent: 'VisionInspectionAgent', status: 'blocked', latency: 2, permission: 'DENY' },
  { time: '08:32:44', tool: 'recognize_defect', agent: 'VisionInspectionAgent', status: 'success', latency: 9800, permission: 'ALLOW' },
];

export const gridRunInput =
  '巡检任务 IT-20260826-0143：杭州湾 220kV 变电站，巡检员李婷于 08:12-12:40 完成 46 个点位巡视，上传照片 287 张。请完成照片有效性校验、设备匹配、缺陷识别与定级，并生成可上报 PMS 的巡检报告。';

export const gridLiveRunSteps: RunStep[] = [
  {
    delay: 900,
    log: '[Harness] 初始化 Run，分配 trace_id=tr-20260826-0143',
    span: {
      id: 'gsp-1',
      name: 'Context Build',
      type: 'context',
      startMs: 0,
      durationMs: 780,
      status: 'success',
      tokens: { input: 4040, output: 0 },
      cost: 0.005,
      input: '组装 System / Role / Task / Project Rules / Memory / Ontology / RAG / Catalog / Conversation / Tool Schema',
      output:
        '上下文构建完成，总计 4,040 tokens（预算 8,000）。注入 Project Memory 4 条 pinned 规则，Episodic 2 条，Semantic 2 条，缺陷字典常用子集 35 项。裁剪罕见分类与无关章节共 5,990 tokens。',
      meta: { blocks: 10, budget: '8000', used: '4040', trimmed: '5990' },
    },
  },
  {
    delay: 800,
    log: '[Memory] 读取 Project Memory（4 条 pinned 规则）',
    span: {
      id: 'gsp-2',
      name: 'Memory Read · Project Rules',
      type: 'memory_read',
      startMs: 780,
      durationMs: 190,
      status: 'success',
      input: 'query: project_rules WHERE pinned = true',
      output:
        '① 危急缺陷必须班长现场复核签字；② 照片时序只认 EXIF 拍摄时间；③ 定级必须引用标准条款编号；④ PMS 写操作强制审批且推理不出内网。',
      meta: { hits: 4, source: 'Project Memory' },
    },
  },
  {
    delay: 1600,
    log: '[Tool] validate_photo 校验 287 张照片…',
    span: {
      id: 'gsp-3',
      name: 'Tool · validate_photo',
      type: 'tool',
      startMs: 970,
      durationMs: 3200,
      status: 'success',
      input: '{ "photo_ids": ["…287 张"], "task_id": "IT-20260826-0143" }',
      output:
        '{ "valid": 271, "no_gps": 12, "suspect_reshoot": 4, "duplicated": 0 }\n说明：4 张照片 EXIF 拍摄时间为 08-24，早于任务开始时间 08-26 08:12，判定疑似补拍，不计入覆盖率；12 张缺 GPS 转入待人工标注。',
      meta: { permission: 'ALLOW', risk: 'low', basis: 'EXIF 拍摄时间（非上传时间）' },
    },
  },
  {
    delay: 1500,
    log: '[Tool] match_equipment 关联设备台账…',
    span: {
      id: 'gsp-4',
      name: 'Tool · match_equipment',
      type: 'tool',
      startMs: 4170,
      durationMs: 2600,
      status: 'success',
      input: '{ "photo_ids": ["…271 张有效照片"], "station_id": "ST-HZW-220" }',
      output:
        '{ "matched": 262, "unmatched": 9, "match_rate": 0.967 }\n匹配方式分布：二维码 148 张、铭牌 OCR 71 张、GPS+路线顺序 43 张。共关联到 89 台设备，其中 1 号主变 34 张、220kV 断路器 62 张。',
      meta: { permission: 'ALLOW', risk: 'low', match_rate: 0.967 },
    },
  },
  {
    delay: 2400,
    log: '[Tool] recognize_defect 调用 vision-mcp 批量识别（262 张）…',
    span: {
      id: 'gsp-5',
      name: 'Tool · recognize_defect (MCP)',
      type: 'tool',
      startMs: 6770,
      durationMs: 12400,
      status: 'success',
      input: '{ "photo_ids": ["…262 张"], "equipment_context": "89 台设备台账", "catalog_subset": ["…35 项常用分类"] }',
      output:
        '{ "candidates": 9 }\n初筛出 9 处疑似缺陷：套管油位异常 ×1（conf 0.91）、法兰渗油 ×2（conf 0.88 / 0.79）、金属锈蚀 ×3（conf 0.86 / 0.82 / 0.71）、硅胶变色 ×1（conf 0.93）、异物搭挂 ×1（conf 0.68）、表计模糊 ×1（conf 0.62）。',
      meta: { permission: 'ALLOW', server: 'vision-mcp', risk: 'low', photos: 262 },
    },
  },
  {
    delay: 2200,
    log: '[Model] 调用 qwen2.5-vl-72b 复核候选并排除误报…',
    span: {
      id: 'gsp-6',
      name: 'Model Call · VisionInspectionAgent',
      type: 'model',
      startMs: 19170,
      durationMs: 5200,
      status: 'success',
      tokens: { input: 6180, output: 642 },
      cost: 0.312,
      input: 'model=qwen2.5-vl-72b-instruct, temperature=0.1, 结构化输出 DefectCandidate',
      output: `{
  "candidates": [
    {"equipment_id": "EQ-HZW-MT01-BSH-A", "defect_form": "套管油位低于下限刻度", "catalog_code": "YW-003", "confidence": 0.91, "shooting_condition": "正常", "need_human_confirm": false},
    {"equipment_id": "EQ-HZW-MT01-FLG", "defect_form": "法兰面可见油迹，约 3cm×5cm", "catalog_code": "SL-001", "confidence": 0.88, "shooting_condition": "正常", "need_human_confirm": false},
    {"equipment_id": "EQ-HZW-CB-2201-B", "defect_form": "机构箱底部金属锈蚀", "catalog_code": "XS-002", "confidence": 0.86, "shooting_condition": "正常", "need_human_confirm": false},
    {"equipment_id": "EQ-HZW-MT01-BRT", "defect_form": "呼吸器硅胶变色约 3/4", "catalog_code": "GJ-005", "confidence": 0.93, "shooting_condition": "正常", "need_human_confirm": false},
    {"equipment_id": "EQ-HZW-CB-2203-C", "defect_form": "支架轻微锈蚀", "catalog_code": "XS-002", "confidence": 0.82, "shooting_condition": "正常", "need_human_confirm": false}
  ],
  "excluded": [
    {"reason": "水渍反光误判为渗油", "confidence": 0.79},
    {"reason": "阴影误判为锈蚀", "confidence": 0.71},
    {"reason": "鸟类飞过瞬间，非固定异物", "confidence": 0.68},
    {"reason": "逆光导致表计模糊，属拍摄质量问题非设备缺陷", "confidence": 0.62}
  ]
}`,
      meta: { model: 'qwen2.5-vl-72b-instruct', provider: 'Qwen VL 本地 GPU', temperature: 0.1 },
    },
  },
  {
    delay: 900,
    log: '[Guardrail] 输出校验：Schema ✓ 分类在常用子集内 ✓ 未越权定级 ✓',
    span: {
      id: 'gsp-7',
      name: 'Output Guardrail',
      type: 'output',
      startMs: 24370,
      durationMs: 140,
      status: 'success',
      input: 'DefectCandidate 结构化输出',
      output: 'Schema 校验通过；5 条候选的 catalog_code 均在常用子集 35 项内；未输出缺陷等级（无越权）；4 条排除项均给出理由。',
      meta: { checks: 4, passed: 4 },
    },
  },
  {
    delay: 900,
    log: '[Handoff] VisionInspectionAgent → DefectGradingAgent',
    span: {
      id: 'gsp-8',
      name: 'Handoff · Vision → Grading',
      type: 'handoff',
      startMs: 24510,
      durationMs: 90,
      status: 'success',
      input: '5 条缺陷候选置信度均 > 0.75，无需人工确认，进入定级分支',
      output: '上下文移交 DefectGradingAgent，携带缺陷候选、设备台账信息与照片证据引用。',
      meta: { from: 'VisionInspectionAgent', to: 'DefectGradingAgent' },
    },
  },
  {
    delay: 1500,
    log: '[RAG] search_standard 按条款粒度检索定级标准…',
    span: {
      id: 'gsp-9',
      name: 'Retrieval · search_standard',
      type: 'retrieval',
      startMs: 24600,
      durationMs: 1900,
      status: 'success',
      input: '{ "query": "套管油位 渗漏油 锈蚀 硅胶变色 定级", "equipment_category": "主变/断路器", "top_k": 8 }',
      output:
        '命中 5 个条款：3.2.1 套管油位低于下限（危急，score 0.94）、7.2.3 法兰渗漏油面积判据（严重，0.90）、4.3.2 金属部件锈蚀分级（一般，0.87）、5.1.4 呼吸器硅胶变色（一般，0.92）、9.1.1 缺陷复发升级规则（0.81）。',
      meta: { hits: 5, doc: '《输变电一次设备缺陷定级标准》(2025-03)', permission: 'ALLOW' },
    },
  },
  {
    delay: 2200,
    log: '[Model] DefectGradingAgent 按条款定级…',
    span: {
      id: 'gsp-10',
      name: 'Model Call · DefectGradingAgent',
      type: 'model',
      startMs: 26500,
      durationMs: 5600,
      status: 'success',
      tokens: { input: 4820, output: 596 },
      cost: 0.186,
      input: 'model=qwen2.5-72b-instruct, temperature=0.1, 结构化输出 GradedDefect',
      output: `{
  "defects": [
    {"equipment_id": "EQ-HZW-MT01-BSH-A", "level": "危急", "standard_clause": "3.2.1", "description": "1 号主变 A 相套管油位低于下限刻度，油位窗内不可见油面", "rationale": "条款 3.2.1 明确套管油位低于下限即判危急，需立即上报并安排停电处理", "require_leader_review": true},
    {"equipment_id": "EQ-HZW-MT01-FLG", "level": "严重", "standard_clause": "7.2.3", "description": "1 号主变本体法兰面渗油，油迹面积约 3cm×5cm，未见滴落", "rationale": "条款 7.2.3 渗漏面积大于 10cm² 未滴落判严重", "require_leader_review": false},
    {"equipment_id": "EQ-HZW-CB-2203-C", "level": "严重", "standard_clause": "4.3.2", "description": "2203 断路器 C 相支架锈蚀，近三次巡检均有记录，按 9.1.1 复发升级", "rationale": "锈蚀本判一般，但条款 9.1.1 规定连续三次同类缺陷升一级并标记隐患项", "require_leader_review": false},
    {"equipment_id": "EQ-HZW-CB-2201-B", "level": "一般", "standard_clause": "4.3.2", "description": "2201 断路器 B 相机构箱底部轻微锈蚀，未影响密封", "rationale": "条款 4.3.2 表面锈蚀未影响功能判一般", "require_leader_review": false},
    {"equipment_id": "EQ-HZW-MT01-BRT", "level": "一般", "standard_clause": "5.1.4", "description": "1 号主变呼吸器硅胶变色约 3/4，超过 2/3 阈值", "rationale": "条款 5.1.4 变色超过 2/3 判一般，下次检修一并处理", "require_leader_review": false}
  ]
}`,
      meta: { model: 'qwen2.5-72b-instruct', clauses_cited: 5, critical: 1 },
    },
  },
  {
    delay: 1000,
    log: '[Permission] 存在危急缺陷 → create_defect_order 需班长现场复核签字，暂停',
    pauseForApproval: true,
    span: {
      id: 'gsp-11',
      name: 'Approval · create_defect_order（危急）',
      type: 'approval',
      startMs: 32100,
      durationMs: 0,
      status: 'waiting',
      input: `Tool: create_defect_order
Agent: DefectGradingAgent
Risk: HIGH
Parameters:
  equipment_id: EQ-HZW-MT01-BSH-A（1 号主变 A 相套管）
  level: 危急
  standard_clause: 3.2.1
  catalog_code: YW-003
  description: 套管油位低于下限刻度，油位窗内不可见油面
  evidence_photos: IMG-0143-0087, IMG-0143-0088`,
      output: '等待第三班组班长现场复核签字…',
      meta: { permission: 'APPROVAL_REQUIRED', risk: 'high', rule: '危急缺陷强制现场复核（grule-1）' },
    },
  },
];

export const gridPostApprovalSteps: RunStep[] = [
  {
    delay: 1300,
    log: '[Tool] 班长签字通过，调用 create_defect_order…',
    span: {
      id: 'gsp-12',
      name: 'Tool · create_defect_order',
      type: 'tool',
      startMs: 32100,
      durationMs: 2100,
      status: 'success',
      input:
        '{ "equipment_id": "EQ-HZW-MT01-BSH-A", "catalog_code": "YW-003", "level": "危急", "standard_clause": "3.2.1", "description": "套管油位低于下限刻度，油位窗内不可见油面" }',
      output: '{ "defect_no": "DF-20260826-0091", "status": "Created", "created_at": "2026-08-26T09:44:12+08:00" }\n同批创建严重缺陷 2 条、一般缺陷 2 条（无需签字）。',
      meta: { permission: 'APPROVAL_REQUIRED', approved_by: '马国庆（第三班组班长）', risk: 'high' },
    },
  },
  {
    delay: 1600,
    log: '[Model] ReportWriterAgent 生成巡检报告草稿…',
    span: {
      id: 'gsp-13',
      name: 'Model Call · ReportWriterAgent',
      type: 'model',
      startMs: 34200,
      durationMs: 6400,
      status: 'success',
      tokens: { input: 5240, output: 1120 },
      cost: 0.142,
      input: 'model=qwen2.5-32b-instruct, temperature=0.3, 省公司巡检报告模板 v4',
      output: `《杭州湾 220kV 变电站巡检报告》IR-20260826-0143
· 任务概况：巡检员李婷，08:12-12:40，计划点位 46，实际巡视 46，覆盖率 100%
· 照片有效性：上传 287 张，有效 271 张；12 张缺 GPS 待人工标注；4 张 EXIF 时间早于任务窗口，判定疑似补拍且未计入覆盖率
· 设备关联：262 张关联至 89 台设备，关联率 96.7%
· 缺陷清单：危急 1 条（3.2.1）、严重 2 条（7.2.3 / 4.3.2+9.1.1）、一般 2 条（4.3.2 / 5.1.4），均附条款引用与照片证据
· 结论：1 号主变 A 相套管油位异常已开危急缺陷单 DF-20260826-0091 并经班长现场复核签字，建议 24 小时内安排停电处理`,
      meta: { pages: 9, defects: 5, clauses_cited: 5 },
    },
  },
  {
    delay: 1200,
    log: '[Tool] upload_pms 上传报告并归档到任务…',
    span: {
      id: 'gsp-14',
      name: 'Tool · upload_pms',
      type: 'tool',
      startMs: 40600,
      durationMs: 1800,
      status: 'success',
      input: '{ "report_id": "IR-20260826-0143", "task_id": "IT-20260826-0143" }',
      output: '{ "status": "Uploaded", "pms_url": "pms://report/IR-20260826-0143" }\n报告于任务当日完成上传，较基线提前约 2.4 天。',
      meta: { permission: 'APPROVAL_REQUIRED', approved_by: '马国庆（第三班组班长）', risk: 'high' },
    },
  },
  {
    delay: 900,
    log: '[Memory] 生成记忆候选，等待确认',
    span: {
      id: 'gsp-15',
      name: 'Memory Write · 候选生成',
      type: 'memory_write',
      startMs: 42400,
      durationMs: 280,
      status: 'success',
      input: 'Run 总结 → Memory Evaluator（Importance 0.87 / Confidence 0.92 / Reusability 0.83 / Safety 1.0）',
      output: '生成 2 条候选记忆进入待确认队列（Episodic ×1，Semantic ×1），未直接写入长期记忆。',
      meta: { candidates: 2, policy: 'Run 完成后总结 + 用户确认' },
    },
  },
  {
    delay: 800,
    log: '[Eval] 触发 Eval Hook，计算本次运行评分',
    span: {
      id: 'gsp-16',
      name: 'Eval Hook',
      type: 'output',
      startMs: 42680,
      durationMs: 520,
      status: 'success',
      input: 'Task Success / Output Quality / Tool Correctness / Clause Grounding / Cost / Latency / Safety',
      output:
        'Task Success ✓ | Output Quality 0.89 | Tool Correctness 1.0 | Clause Grounding 1.0（5/5 条款可溯源）| Cost $0.65 | Latency 43.3s | Safety ✓ → 综合 88 分',
      meta: { score: 88 },
    },
  },
  {
    delay: 700,
    log: '[Harness] Run 完成，状态 COMPLETED',
    span: {
      id: 'gsp-17',
      name: 'Final Output',
      type: 'output',
      startMs: 43200,
      durationMs: 70,
      status: 'success',
      input: '—',
      output:
        '巡检报告 IR-20260826-0143 已生成并上传 PMS。287 张照片校验出 4 张疑似补拍，262 张关联至 89 台设备（96.7%）。识别并定级缺陷 5 条：危急 1、严重 2、一般 2，危急项已经班长现场复核签字并开单 DF-20260826-0091。全程 43.3 秒，成本 $0.65。',
      meta: { status: 'COMPLETED' },
    },
  },
];

export const gridRejectedSteps: RunStep[] = [
  {
    delay: 1000,
    log: '[Approval] 班长复核后否决，Run 进入 CANCELLED',
    span: {
      id: 'gsp-12r',
      name: 'Approval Rejected',
      type: 'approval',
      startMs: 32100,
      durationMs: 220,
      status: 'error',
      input: 'create_defect_order 审批请求（危急级）',
      output: '班长现场复核后判定为油位窗污渍造成的误判，缺陷单未创建。识别结果保留为待核查项，照片转入误报样本集。',
      error: 'REJECTED_BY_HUMAN',
      meta: { rejected_by: '马国庆（第三班组班长）' },
    },
  },
  {
    delay: 800,
    log: '[Harness] Run 结束，状态 CANCELLED',
    span: {
      id: 'gsp-13r',
      name: 'Final Output',
      type: 'output',
      startMs: 32320,
      durationMs: 70,
      status: 'success',
      input: '—',
      output: '流程终止于危急缺陷复核环节。其余 4 条缺陷未受影响，可单独走报告生成；本次误判样本已加入回归集，用于阈值校准。',
      meta: { status: 'CANCELLED' },
    },
  },
];

export const gridHistoryRuns: AgentRun[] = [
  {
    id: 'run-0041',
    agentId: 'gagt-vision',
    agentName: 'VisionInspectionAgent → DefectGradingAgent',
    status: 'COMPLETED',
    input: '巡检任务 IT-20260825-0136：临安 110kV 变电站，194 张照片',
    output: '识别缺陷 3 条（严重 1、一般 2），报告 IR-20260825-0136 当日上传 PMS。',
    startedAt: '2026-08-25 16:22:04',
    durationMs: 31800,
    tokens: 9840,
    cost: 0.51,
    evalScore: 91,
    spans: [],
  },
  {
    id: 'run-0039',
    agentId: 'gagt-vision',
    agentName: 'VisionInspectionAgent',
    status: 'COMPLETED',
    input: '巡检任务 IT-20260825-0129：余杭 35kV 变电站，118 张照片',
    output: '未发现缺陷，照片关联率 98.3%，报告生成并归档。',
    startedAt: '2026-08-25 11:08:41',
    durationMs: 22400,
    tokens: 6210,
    cost: 0.33,
    evalScore: 94,
    spans: [],
  },
  {
    id: 'run-0036',
    agentId: 'gagt-grade',
    agentName: 'DefectGradingAgent',
    status: 'CANCELLED',
    input: '为 EQ-HZW-CB-2205-A 疑似绝缘子破损创建缺陷单',
    output: '班长现场复核后判定为镜头污渍造成的伪影，审批拒绝。',
    startedAt: '2026-08-24 14:35:19',
    durationMs: 12600,
    tokens: 3480,
    cost: 0.14,
    evalScore: 46,
    spans: [],
  },
  {
    id: 'run-0029',
    agentId: 'gagt-writer',
    agentName: 'ReportWriterAgent',
    status: 'FAILED',
    input: '生成 IT-20260824-0121 巡检报告',
    output: 'Guardrail 拦截：3 条缺陷缺少 standard_clause，报告未通过质检。',
    startedAt: '2026-08-24 17:02:55',
    durationMs: 9400,
    tokens: 4120,
    cost: 0.11,
    evalScore: 0,
    spans: [],
  },
  {
    id: 'run-0022',
    agentId: 'gagt-vision',
    agentName: 'VisionInspectionAgent',
    status: 'COMPLETED',
    input: '巡检任务 IT-20260822-0098：萧山 220kV 变电站，312 张照片',
    output: '误用上传时间判定补拍，23 张正常照片被错误排除，修正后重跑通过。',
    startedAt: '2026-08-22 18:11:30',
    durationMs: 48200,
    tokens: 11260,
    cost: 0.62,
    evalScore: 61,
    spans: [],
  },
];

export const gridPendingApproval: Omit<ApprovalItem, 'status'> = {
  id: 'gapv-live',
  runId: 'run-live',
  agent: 'DefectGradingAgent',
  tool: 'create_defect_order',
  reason: '识别出危急级缺陷（套管油位低于下限，条款 3.2.1），按项目规则须班长现场复核签字后方可开单',
  parameters: {
    equipment_id: 'EQ-HZW-MT01-BSH-A（1 号主变 A 相套管）',
    level: '危急',
    standard_clause: '3.2.1',
    catalog_code: 'YW-003',
    confidence: '0.91',
    description: '套管油位低于下限刻度，油位窗内不可见油面',
    evidence_photos: 'IMG-0143-0087 / IMG-0143-0088',
  },
  risk: 'high',
  requestedAt: '2026-08-26 09:42:06',
};

export const gridApprovalHistory: ApprovalItem[] = [
  {
    id: 'gapv-0033',
    runId: 'run-0041',
    agent: 'DefectGradingAgent',
    tool: 'create_defect_order',
    reason: '严重级法兰渗油，条款 7.2.3',
    parameters: { equipment_id: 'EQ-LA-MT02-FLG', level: '严重', clause: '7.2.3' },
    risk: 'high',
    requestedAt: '2026-08-25 16:24:38',
    status: 'approved',
    decidedBy: '马国庆（第三班组班长）',
    comment: '现场看过，确实有油迹，同意开单',
  },
  {
    id: 'gapv-0031',
    runId: 'run-0036',
    agent: 'DefectGradingAgent',
    tool: 'create_defect_order',
    reason: '危急级绝缘子破损，条款 6.1.2',
    parameters: { equipment_id: 'EQ-HZW-CB-2205-A', level: '危急', clause: '6.1.2' },
    risk: 'high',
    requestedAt: '2026-08-24 14:36:02',
    status: 'rejected',
    decidedBy: '马国庆（第三班组班长）',
    comment: '到现场核过了，是镜头上的污渍，设备本体完好',
  },
  {
    id: 'gapv-0028',
    runId: 'run-0034',
    agent: 'ReportWriterAgent',
    tool: 'upload_pms',
    reason: '巡检报告 IR-20260823-0112 上传归档',
    parameters: { report_id: 'IR-20260823-0112', defects: '2 条' },
    risk: 'high',
    requestedAt: '2026-08-23 19:44:11',
    status: 'approved',
    decidedBy: '沈立群（FDE Lead）',
    comment: '格式符合省公司模板，同意上传',
  },
];

export const gridRunCandidates: MemoryCandidate[] = [
  {
    id: 'gmc-live-1',
    type: 'EPISODIC',
    content:
      '任务：IT-20260826-0143 杭州湾 220kV 站 287 张照片。动作：validate_photo → match_equipment → recognize_defect → 复核排除误报 → search_standard → 定级 → 班长签字 → 开单 → 生成报告 → 上传。结果：43.3 秒完成，识别 5 条缺陷（危急 1），排除 4 条误报。教训：先匹配设备再识别，可用型号信息约束候选形态；水渍反光与阴影是渗油/锈蚀的两类典型误报源。',
    importance: 0.89,
    confidence: 0.92,
    reusability: 0.86,
    safety: 1.0,
    source: 'Run #run-live 自动总结',
    status: 'pending',
  },
  {
    id: 'gmc-live-2',
    type: 'SEMANTIC',
    content:
      '杭州湾 220kV 变电站 1 号主变 A 相套管（EQ-HZW-MT01-BSH-A）油位窗观测角度受支架遮挡，正面拍摄易将污渍误读为油面，建议巡视路线要求侧向补拍一张。',
    importance: 0.81,
    confidence: 0.87,
    reusability: 0.74,
    safety: 1.0,
    source: 'Run #run-live 识别过程观察',
    status: 'pending',
  },
];

export const gridGeneratedFiles = [
  { path: 'frontend/app/page.tsx', desc: '巡检任务列表主页面', lines: 196 },
  { path: 'frontend/app/task/[id]/page.tsx', desc: '任务详情与照片墙', lines: 388 },
  { path: 'frontend/app/defect/review/page.tsx', desc: '缺陷复核与签字页', lines: 244 },
  { path: 'frontend/app/report/[id]/page.tsx', desc: '报告预览与导出', lines: 271 },
  { path: 'backend/main.py', desc: 'FastAPI 入口', lines: 88 },
  { path: 'backend/agents/vision_inspection.py', desc: 'VisionInspectionAgent 实现', lines: 312 },
  { path: 'backend/agents/defect_grading.py', desc: 'DefectGradingAgent 实现', lines: 226 },
  { path: 'backend/agents/report_writer.py', desc: 'ReportWriterAgent 实现', lines: 184 },
  { path: 'backend/pipeline/photo_validator.py', desc: 'EXIF / GPS / 感知哈希校验', lines: 167 },
  { path: 'backend/pipeline/equipment_matcher.py', desc: '照片-设备匹配器', lines: 203 },
  { path: 'backend/harness/permission.py', desc: '权限与审批策略', lines: 138 },
  { path: 'backend/ontology/schema.py', desc: 'Ontology 对象定义', lines: 341 },
  { path: 'Dockerfile', desc: '容器构建文件（含 CUDA 运行时）', lines: 36 },
  { path: 'README.md', desc: '项目说明', lines: 124 },
];

export const gridBuildSteps: BuildStep[] = [
  {
    key: 'clone',
    name: 'Pull Project Git',
    duration: 1800,
    logs: [
      '$ git clone https://git.fde-lab.internal/p-2024-11/grid-inspection.git',
      'Cloning into grid-inspection...',
      'remote: Enumerating objects: 386, done.',
      'Receiving objects: 100% (386/386), 2.08 MiB | 7.1 MiB/s, done.',
      'HEAD is now at c41d7be feat: 置信度阈值下调至 0.75',
    ],
  },
  {
    key: 'build',
    name: 'Build Docker Image',
    duration: 5200,
    logs: [
      '$ docker build -t fde/p-2024-11:v5 .',
      'Step 1/14 : FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04',
      'Step 5/14 : RUN pip install -r requirements.txt',
      ' ---> Installing fastapi, pillow, piexif, imagehash, pgvector...',
      'Step 9/14 : COPY models/qwen2.5-vl-adapter ./models/',
      'Step 14/14 : CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]',
      'Successfully built b7e42c9a1f60',
      'Successfully tagged fde/p-2024-11:v5',
    ],
  },
  {
    key: 'run',
    name: 'Run Container',
    duration: 2600,
    logs: [
      '$ docker run -d --name p-2024-11-v5 --gpus 1 --cpus=4 --memory=16g fde/p-2024-11:v5',
      'Container 4f81ba62c9d3 started',
      'INFO:     Started server process [1]',
      'INFO:     CUDA device detected: NVIDIA A100-40GB',
      'INFO:     Vision model loaded: qwen2.5-vl-72b-instruct (int4)',
      'INFO:     Ontology service loaded: 8 objects, 8 relations, 6 actions',
      'INFO:     Agent registry loaded: 4 agents',
      'INFO:     Application startup complete.',
    ],
  },
  {
    key: 'health',
    name: 'Health Check',
    duration: 2000,
    logs: [
      '$ curl -f http://p-2024-11-v5:8000/health',
      '{"status":"ok","db":"connected","gpu":"available","mcp":{"vision-mcp":"ok","ledger-mcp":"ok","file-mcp":"ok","pms-mcp":"error"}}',
      'WARN  pms-mcp unreachable — 写接口降级为 Mock 模式',
      'Health check passed (3/3 attempts, 1 warning)',
    ],
  },
  {
    key: 'url',
    name: 'Assign URL',
    duration: 1200,
    logs: [
      'Registering route in gateway...',
      'TLS certificate issued (internal CA)',
      '✓ Deployment URL: https://p-2024-11.sandbox.fde-lab.internal',
    ],
  },
];

export const gridDeploymentInfo = {
  url: 'https://p-2024-11.sandbox.fde-lab.internal',
  image: 'fde/p-2024-11:v5',
  container: '4f81ba62c9d3',
  cpu: '4 cores + 1×A100',
  memory: '16 GB',
  disk: '40 GB',
  network: '电力内网白名单',
  createdAt: '2026-08-26 09:28',
};

export const gridRuntimeLogs = [
  '09:28:14 INFO  Application startup complete',
  '09:28:51 INFO  GET /health 200 6ms',
  '09:41:09 INFO  POST /api/tasks/IT-20260826-0143/process 200 43312ms trace_id=tr-20260826-0143',
  '09:42:06 INFO  Approval requested: create_defect_order (run-live) level=危急',
  '09:44:10 INFO  Approval granted by 马国庆',
  '09:44:12 INFO  POST /pms/defect/create 201 2100ms defect_no=DF-20260826-0091',
  '09:44:52 INFO  POST /pms/report/upload 200 1800ms report_id=IR-20260826-0143',
  '09:47:33 WARN  GPU memory 34.2/40 GB — 建议单批照片数不超过 300',
  '09:52:18 INFO  GET /api/traces/tr-20260826-0143 200 41ms',
];

export const gridDeployHistory = [
  { version: 'v5', time: '2026-08-26 09:28', status: 'running', author: '孟晓', note: '置信度阈值下调至 0.75' },
  { version: 'v4', time: '2026-08-25 14:52', status: 'stopped', author: '孟晓', note: '批量识别改为分片处理，缓解显存峰值' },
  { version: 'v3', time: '2026-08-24 20:07', status: 'stopped', author: '范志远', note: '照片校验改用 EXIF 时间' },
  { version: 'v2', time: '2026-08-23 16:41', status: 'failed', author: '范志远', note: 'CUDA 版本与驱动不匹配，构建失败' },
];

export const gridResourceUsage = [
  { time: '09:28', cpu: 9, memory: 22 },
  { time: '09:32', cpu: 15, memory: 28 },
  { time: '09:36', cpu: 22, memory: 31 },
  { time: '09:40', cpu: 87, memory: 78 },
  { time: '09:44', cpu: 71, memory: 84 },
  { time: '09:48', cpu: 34, memory: 62 },
  { time: '09:52', cpu: 21, memory: 48 },
  { time: '09:56', cpu: 17, memory: 44 },
];

export const gridEvalL1: EvalL1Item[] = [
  { name: 'Accuracy', cn: '缺陷识别准确率', value: 0.88, target: 0.85, unit: '', desc: '200 张分层标注回归集上识别结果与专家标注一致率' },
  { name: 'Recall', cn: '缺陷召回率', value: 0.94, target: 0.95, unit: '', desc: '真实缺陷被识别出的比例（业务方要求高召回优先）' },
  { name: 'Faithfulness', cn: '条款引用正确率', value: 0.96, target: 0.95, unit: '', desc: '定级引用的标准条款与专家判定一致的比例' },
  { name: 'Hallucination', cn: '幻觉率', value: 0.04, target: 0.05, unit: '', desc: '出现无照片依据的缺陷描述的比例（越低越好）', lower: true },
];

export const gridEvalL2: EvalL2Item[] = [
  { name: 'Task Success', cn: '任务成功率', value: 0.86, target: 0.85, desc: '完整走通校验→匹配→识别→定级→报告的比例' },
  { name: 'Tool Success', cn: '工具调用成功率', value: 0.95, target: 0.95, desc: '工具调用返回有效结果的比例' },
  { name: 'Action Accuracy', cn: '动作正确率', value: 0.87, target: 0.85, desc: '选择了正确工具与参数的比例' },
  { name: 'Match Rate', cn: '照片设备关联率', value: 0.967, target: 0.95, desc: '有效照片成功关联到台账设备的比例' },
  { name: 'Avg Steps', cn: '平均步数', value: 7.4, target: 9, desc: '单次任务平均执行步骤数（越少越好）', lower: true },
  { name: 'Intervention Rate', cn: '人工干预率', value: 0.26, target: 0.3, desc: '需要人工确认或复核的比例（越低越好）', lower: true },
];

export const gridEvalL3: EvalL3Item[] = [
  { name: 'P50 Latency', cn: '中位时延', value: 42.6, unit: 's', target: 60, lower: true },
  { name: 'P95 Latency', cn: 'P95 时延', value: 88.2, unit: 's', target: 120, lower: true },
  { name: 'Avg Cost', cn: '单次成本', value: 0.58, unit: '$', target: 0.8, lower: true },
  { name: 'Availability', cn: '可用性', value: 98.7, unit: '%', target: 99 },
  { name: 'Error Rate', cn: '错误率', value: 3.4, unit: '%', target: 5, lower: true },
];

export const gridEvalL4: EvalL4Item[] = [
  {
    name: 'Time Saved',
    cn: '报告整理时长',
    before: '3.5 小时',
    after: '0.6 小时',
    delta: '-82.9%',
    positive: true,
    note: '20 份历史报告人机对照实测，含人工确认与班长复核时间',
  },
  {
    name: 'Timeliness',
    cn: '报告上传时延',
    before: '2-3 天',
    after: '当日',
    delta: '-2.4 天',
    positive: true,
    note: '12 次灰度任务全部在巡检当日完成上传',
  },
  {
    name: 'Match Rate',
    cn: '照片设备关联率',
    before: '70%',
    after: '96.7%',
    delta: '+26.7pp',
    positive: true,
    note: '二维码 + 铭牌 OCR + GPS 路线三路融合匹配',
  },
  {
    name: 'Standardization',
    cn: '缺陷描述规范化率',
    before: '不可统计',
    after: '93%',
    delta: '达成目标',
    positive: true,
    note: '按 PMS 常用字典 35 项归类，且均引用标准条款编号',
  },
  {
    name: 'Cost Saved',
    cn: '年化工时释放',
    before: '—',
    after: '约 8580 工时',
    delta: '+8580h',
    positive: true,
    note: '按 6 班组年 2960 次巡检、单次节省 2.9 小时折算；口径为工时释放而非人力裁减',
  },
];

export const gridFdeScore = [
  { name: 'Problem Understanding', cn: '问题理解', weight: 20, score: 16, comment: 'Problem Canvas 完整，PSF 79 分；隐藏约束（EXIF 时间、字典子集）挖掘到位' },
  { name: 'Business/Ontology Model', cn: '业务/Ontology 建模', weight: 15, score: 12, comment: '8 个对象覆盖照片到报告全链路，DefectCatalog 候选尚未确认' },
  { name: 'Solution Design', cn: '方案设计', weight: 15, score: 12, comment: 'Workflow 编排清晰，但夜间/逆光场景的降权策略仍停留在候选规则' },
  { name: 'Prototype', cn: '原型实现', weight: 15, score: 11, comment: '主流程可运行，PMS 写接口降级为 Mock' },
  { name: 'Agent/Harness Quality', cn: 'Agent/Harness 质量', weight: 10, score: 9, comment: '危急缺陷审批链路与条款引用 Guardrail 均已落地' },
  { name: 'Deployment', cn: '部署', weight: 10, score: 7, comment: 'GPU 沙箱部署成功，显存峰值接近上限，缺少并发压测' },
  { name: 'Evaluation', cn: '评测', weight: 10, score: 8, comment: 'L1-L4 齐备且做了分层回归，召回 0.94 略低于 0.95 目标' },
  { name: 'Business Value', cn: '业务价值', weight: 5, score: 4, comment: '工时释放口径诚实，未夸大为人力成本节约' },
];

export const gridTeamComparison = [
  { team: 'MEM 第三组', score: 82, psf: 86, ontology: 7, runs: 38, deploy: true },
  { team: 'MEM 第一组', score: 76, psf: 81, ontology: 6, runs: 29, deploy: true },
  { team: 'MEM 第五组', score: 79, psf: 79, ontology: 8, runs: 45, deploy: true, current: true },
  { team: 'MEM 第二组', score: 69, psf: 72, ontology: 5, runs: 22, deploy: true },
  { team: 'MEM 第四组', score: 61, psf: 64, ontology: 4, runs: 17, deploy: false },
];

export const gridTeacherFeedback = [
  {
    author: '陈老师',
    role: '教师',
    time: '2026-08-26 08:40',
    content:
      '这个组最亮眼的是把「上传时间不可信」这个技术细节，从访谈里挖出来并升级成了 Project Memory 和 Guardrail。很多组会把它当成一个 bug 去修，你们把它当成了业务约束去建模，这是 FDE 和普通开发的分水岭。下一步建议尽快确认 DefectCatalog，字典映射不落地，规范化率的数字就站不住。',
    tags: ['优点', '待改进'],
  },
  {
    author: '王工',
    role: '企业导师',
    time: '2026-08-25 19:15',
    content:
      '从班组实际看，你们把人工签字环节只留在危急这一档，这个取舍是对的——如果每条缺陷都要班长点一遍，这套系统一个月就会被弃用。但有个现实问题：班长不在站上的时候怎么办？现在流程假设他能立刻到现场，实际上他可能在另一个站。建议补一个「远程预审 + 到场补签」的降级路径。',
    tags: ['实践建议', '风险'],
  },
  {
    author: '陈老师',
    role: '教师',
    time: '2026-08-24 15:30',
    content:
      'Run #0022 的复盘写得很好，把误判 23 张照片的根因追到了离线缓存机制上，并且沉淀成了 Episodic Memory。但要提醒：Run #0017 的夜间照片问题，你们记录了教训却还没有落到规则里，候选规则「夜间/逆光降权」一直挂在 Ontology 待确认队列。教训不落地就只是笔记。',
    tags: ['优点', '待改进'],
  },
];

export const gridPortfolioSections = [
  {
    key: 'summary',
    title: '项目摘要',
    content:
      '本项目面向变电站巡检报告场景，构建了一套"照片校验—设备匹配—缺陷识别—标准定级—报告生成"的自动化流水线。通过 Ontology 打通变电站、设备、照片、缺陷、报告五类业务对象，以确定性 Workflow 编排三个专家 Agent，在保留班长对危急缺陷现场签字权的前提下，把报告整理时长从 3.5 小时压缩到 0.6 小时，报告上传由滞后 2-3 天变为当日完成。',
  },
  {
    key: 'problem',
    title: '问题定义',
    content:
      '核心问题：巡检员需从 200-400 张照片中人工回忆设备归属并撰写缺陷描述，平均耗时 3.5 小时，导致报告滞后 2-3 天。根因在于照片在采集环节就与设备台账脱钩，且缺陷判定标准未被显性化为可执行规则。PSF 评分 79/100。',
  },
  {
    key: 'model',
    title: '业务建模',
    content:
      '构建 8 个业务对象（Substation、Equipment、Defect、InspectionTask、InspectionRecord、Photo、InspectionReport、Inspector）、8 组关系、6 个 Action、6 条业务规则。其中"危急缺陷强制现场复核"与"照片时间戳有效性校验"两条规则直接对应组织制度与现场物理约束。',
  },
  {
    key: 'solution',
    title: '解决方案',
    content:
      '照片有效性校验（EXIF/GPS/感知哈希）→ 三路融合设备匹配 → VisionInspectionAgent 多模态识别 → 置信度门控 0.75 → DefectGradingAgent 按条款定级 → 危急项班长现场复核签字 → 创建 PMS 缺陷单 → ReportWriterAgent 生成报告 → 上传 PMS。视觉模型本地 GPU 推理，数据不出电力内网。',
  },
  {
    key: 'harness',
    title: '工程底座',
    content:
      'Harness 提供 Context Builder（10 个上下文块，缺陷字典按常用子集裁剪）、权限矩阵、危急缺陷审批链路、GPU 沙箱执行、完整 Trace 与 Eval Hook。create_defect_order 与 upload_pms 强制审批，delete_photo 全面 DENY（原始证据不得删除）。',
  },
  {
    key: 'result',
    title: '交付成果',
    content:
      '部署 URL：https://p-2024-11.sandbox.fde-lab.internal；45 次 Agent Run，任务成功率 86%；缺陷识别准确率 0.88、召回 0.94、条款引用正确率 0.96；FDE 综合评分 79/100。',
  },
  {
    key: 'lesson',
    title: '复盘与沉淀',
    content:
      '三条关键教训已写入 Episodic Memory：① 照片时序只能用 EXIF 时间，上传时间因离线缓存不可信；② 夜间与逆光照片需单独降权，统一阈值会让人工负担不降反升；③ 条款引用必须在 Guardrail 层拦截而非事后补。两条关键决策写入 Decision Memory：采用"AI 识别 + 人工确认"路线、置信度阈值定为 0.75。遗留项：夜间降权规则尚未从候选转为正式规则。',
  },
];

export const gridCopilotAnswers = [
  {
    keywords: ['problem', '问题定义', '定义有什么问题', 'psf'],
    role: 'Critic',
    text: `你们的 Problem Canvas 有一个别组很少做到的优点：把「上传时间不可信」这种物理约束写进了 Constraints，而不是当成实现细节。PSF 79 分，我挑三个还能提的地方：

1. KPI 里写了「缺陷漏检率 ≤3%」，但没有配套的误报率上限。你们选了高召回策略，那误报会上升——如果误报率到 30%，巡检员每次要确认十几条假缺陷，这套系统照样会被弃用。建议补一个上限。
2. 「不增加一线额外操作负担」这条约束很关键，但它是定性的。建议量化成「巡检员单次任务的新增操作步骤 ≤2 步」，否则验收时无法判定。
3. Data Availability 提到照片标注率只有 12%，但没说冷启动怎么办。是先用规程文本做零样本，还是先人工标一批种子集？这决定了你们前两周的工作量。`,
  },
  {
    keywords: ['ontology', '本体', '对象', '缺少哪些'],
    role: 'Reviewer',
    text: `8 个 Object 覆盖了从照片到报告的完整链路，比大多数组扎实。对照访谈，还缺两块：

· DefectCatalog（缺陷分类字典）——这是最要紧的。郑海涛说得很清楚：187 项里常用只有 35 项。你们现在把 catalog_code 建成了 Defect 的一个枚举字段，但"全集与常用子集的映射"这层关系没有对象来承载，季度校准时改哪里？候选队列里已经有了，建议尽快确认。
· MaintenanceHistory（检修履历）——规则 grule-5「重复缺陷升级为隐患」依赖历史比对，但你们现在只能查历史缺陷，查不到中间是否已经消缺过。这会导致把已处理的缺陷重复上报。

另外提醒：Photo 上同时有 exif_time 和 upload_time 两个字段是对的，但建议在 Ontology 层就给 upload_time 加上「不可用于时序判断」的注释，否则新人接手很容易踩 Run #0022 的坑。`,
  },
  {
    keywords: ['agent', '方案', '过度复杂', '架构'],
    role: 'Reviewer',
    text: `三个 Agent 的划分是合理的，识别、定级、撰写确实是三种不同的能力，硬塞进一个 Agent 会让 prompt 变得不可维护。

但 QualityCheckAgent 我建议砍掉。它现在用 7B 模型做四项检查——条款编号是否存在、是否有照片关联、覆盖率是否一致、危急项是否签字——这四项全都是确定性判断，写成断言函数既快又不会漏。用 LLM 做这件事，反而引入了"质检本身出错"的新风险。

判断原则和通信案例是一样的：如果一个环节的输入输出都是结构化的、规则明确的，就不要用 Agent。你们把它标成 draft 说明已经在犹豫了，可以直接下决心。

另外 VisionInspectionAgent 那步「复核候选并排除误报」值得保留——排除水渍反光、阴影这类误报需要结合上下文判断，这才是 LLM 该干的活。`,
  },
  {
    keywords: ['审批', 'approval', '人工', 'hitl'],
    role: 'Coach',
    text: `你们只在危急这一档要签字，这个取舍我完全支持，理由是它同时满足了两个条件：制度上必须有人签（事故整改要求），业务上频次足够低（一次巡检通常 0-1 条危急）。

但有一个现实问题王工已经提过，我再强调一次：流程假设班长能立刻到现场，实际他可能在另一个站。现在的设计里，审批一旦挂起，整条流水线就停在那里，报告也出不来。

建议改成：危急缺陷的审批不阻塞其余缺陷的报告生成。让 4 条非危急缺陷先走完报告流程，危急项单独挂起等签字，签字后追加到报告。这样即使班长两小时后才到场，当日上传的目标仍然能达成。

顺便说，delete_photo 设成 DENY 是对的——原始证据不能删，这一条在电力行业属于审计红线。`,
  },
  {
    keywords: ['memory', '记忆', '上下文', 'context'],
    role: 'Guide',
    text: `Memory 这块你们有一个很漂亮的做法：把缺陷字典的常用子集单独做成一个 Context Block，只注入 35 项，裁掉 152 项罕见分类，省了 1640 tokens 还提升了准确率。这是把业务洞察直接变成上下文工程的典型例子。

两个可以改进的点：

· Run #0017 的教训（夜间照片统一阈值导致 78% 转人工）已经写进了 Episodic Memory，但对应的规则「夜间/逆光降权」还挂在 Ontology 候选队列里没确认。教训不落地就只是笔记，Agent 下次还会犯同样的错。
· Retrieved Knowledge 现在占 1080 tokens，你们按条款粒度切分是对的做法（比整篇文档切分精确得多）。但检索是在定级阶段才做的，识别阶段其实也能用——比如"套管油位窗的正常形态"这类描述，能帮视觉模型减少误判。`,
  },
  {
    keywords: ['部署', 'deploy', '沙箱', 'gpu'],
    role: 'Guide',
    text: `这个项目的部署比通信案例难，因为多了 GPU 这一层。三个检查项：

1. 显存峰值 34.2/40 GB 已经很接近上限了。287 张照片是一次典型巡检的量，但 400 张的站呢？建议把批量识别改成固定分片（比如每片 64 张），让显存占用与照片总数解耦。你们 v4 已经做了分片，确认一下分片大小是不是自适应的。
2. pms-mcp 现在是 error 状态，写接口降级成了 Mock。答辩时这一点会被问到，建议主动说明：不是没做，是测试环境权限没批下来，并且展示 Mock 与真实接口的契约一致性。
3. 模型加载时间要算进冷启动。int4 量化的 72B 模型加载通常要 40-90 秒，如果沙箱有自动休眠策略，第一个请求会超时。`,
  },
  {
    keywords: ['评测', 'eval', '指标', 'roi', '召回'],
    role: 'Critic',
    text: `先说做得对的地方：L4 里你们把收益写成「年化工时释放 8580 小时」而不是「节约人力成本 XX 万元」，并且在 note 里注明「口径为工时释放而非人力裁减」。这比大多数组诚实，评委会认这一点。

但 L1 有个问题要正视：召回 0.94 没达到 0.95 的目标，而业务方（周雪梅）的原话是「宁可多报几个，不能少报一个」。0.94 意味着每 100 个真实缺陷会漏 6 个——如果漏的那 6 个里有一个是危急缺陷，这个项目在安全审查那一关就过不去。

建议做一件事：把回归集按缺陷等级分层，单独报出「危急缺陷的召回率」。如果危急项召回是 1.0，整体 0.94 完全可以接受，这个数字反而会成为你们的加分项；如果危急项也有漏检，那就必须在汇报中把它作为已知风险明确提出，并给出缓解方案。

分层报告永远比一个总体数字更有说服力。`,
  },
];

export const gridCopilotQuickAsks = [
  '我的 Problem 定义有什么问题？',
  '这个 Ontology 缺少哪些对象？',
  '哪些动作应该设置人工审批？',
  '召回率没达标怎么办？',
];
