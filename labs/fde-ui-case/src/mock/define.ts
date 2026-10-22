export interface CanvasField {
  key: string;
  label: string;
  cn: string;
  placeholder: string;
  value: string;
  weight: number;
  minLength: number;
  hint: string;
}

export const problemCanvasFields: CanvasField[] = [
  {
    key: 'problem_statement',
    label: 'Problem Statement',
    cn: '问题陈述',
    placeholder: '一句话说明要解决的核心问题',
    value:
      '省级核心网运维中，诊断班在告警发生后需跨 3 套系统人工查询定位根因，平均耗时 47 分钟，导致重大故障 MTTR 超过 120 分钟。',
    weight: 12,
    minLength: 40,
    hint: '需包含：谁 / 在什么场景 / 遇到什么困难 / 造成什么后果',
  },
  {
    key: 'current_situation',
    label: 'Current Situation',
    cn: '现状描述',
    placeholder: '当前是怎么做的',
    value:
      '监控班从 8000+ 日均告警中人工筛选有效告警，诊断班登录 NMS 查拓扑、翻 Confluence 找历史案例，凭经验判断根因后填写工单交派单班。全流程无系统联动，知识沉淀在个人经验中。',
    weight: 8,
    minLength: 40,
    hint: '描述现有流程、系统与人力投入',
  },
  {
    key: 'target_user',
    label: 'Target User',
    cn: '目标用户',
    placeholder: '谁会直接使用这个系统',
    value: '主要用户：诊断班工程师（12 人）、监控班值班员（24 人）；次要用户：运维中心值班经理（审批角色）。',
    weight: 8,
    minLength: 20,
    hint: '区分主要用户与次要用户，给出规模',
  },
  {
    key: 'pain_points',
    label: 'Pain Points',
    cn: '关键痛点',
    placeholder: '列出经过验证的痛点',
    value:
      '1) 告警噪声大，有效率不足 6%；2) 跨系统查询需 5 次以上人工切换；3) 新人工单错派率 23%；4) 重大故障复盘知识无法复用。',
    weight: 8,
    minLength: 30,
    hint: '痛点应来自访谈证据，避免主观臆测',
  },
  {
    key: 'root_cause',
    label: 'Root Cause',
    cn: '根本原因',
    placeholder: '为什么会出现这些痛点',
    value:
      '告警平台、网管系统、工单系统、知识库四套系统数据未打通，缺少统一的业务对象模型；故障判断逻辑依赖个人经验，未被显性化为可复用规则。',
    weight: 10,
    minLength: 30,
    hint: '区分表象与根因，根因通常指向流程或结构性缺陷',
  },
  {
    key: 'desired_outcome',
    label: 'Desired Outcome',
    cn: '期望结果',
    placeholder: '成功后的状态是什么',
    value:
      '告警自动聚合收敛后由 Diagnosis Agent 生成带证据的根因判断与处理建议，值班经理一键审批后自动创建 ITSM 工单，定位时长压缩至 20 分钟内。',
    weight: 8,
    minLength: 30,
    hint: '描述可观察的目标状态而非技术方案',
  },
  {
    key: 'business_value',
    label: 'Business Value',
    cn: '业务价值',
    placeholder: '量化业务收益',
    value:
      '按年 1400 起重大故障计算，单次节省 27 分钟定位时间，年节约 630 工时；错派率下降 13 个百分点，减少二次派单成本约 82 万元/年。',
    weight: 8,
    minLength: 25,
    hint: '尽量给出可计算的口径与假设',
  },
  {
    key: 'ai_opportunity',
    label: 'AI Opportunity',
    cn: 'AI 机会点',
    placeholder: 'AI 在哪一步创造增量价值',
    value:
      '告警语义聚类与噪声过滤、跨系统信息自动汇聚、基于历史工单与知识库的根因推理、结构化诊断报告生成。',
    weight: 8,
    minLength: 25,
    hint: '说明为什么必须用 AI 而非规则引擎',
  },
  {
    key: 'data_availability',
    label: 'Data Availability',
    cn: '数据可得性',
    placeholder: '有哪些数据、质量如何',
    value:
      '可得：30 天告警记录 24 万条、拓扑快照 1863 网元、两年工单 9.6 万条、知识文档 412 篇。风险：知识库 60% 超两年未更新，需标注时效性并过滤。',
    weight: 10,
    minLength: 30,
    hint: '必须同时说明数据质量与缺口',
  },
  {
    key: 'constraints',
    label: 'Constraints',
    cn: '约束条件',
    placeholder: '技术、合规、组织约束',
    value:
      '数据不出内网，须私有化部署模型；设备变更类操作必须双人确认；ITSM 接口限流 20 次/分钟；一期预算 300 万；需与现有 ITSM 集成。',
    weight: 10,
    minLength: 30,
    hint: '合规与组织约束往往比技术约束更致命',
  },
  {
    key: 'kpi',
    label: 'KPI',
    cn: '衡量指标',
    placeholder: '可量化的验收指标',
    value:
      '定位时长 47min → ≤20min；工单错派率 23% → ≤10%；告警噪声过滤率 ≥80%；诊断结论证据可溯源率 100%；SLA 达成率不低于 99.5%。',
    weight: 6,
    minLength: 25,
    hint: '每个 KPI 需有基线值与目标值',
  },
  {
    key: 'out_of_scope',
    label: 'Out of Scope',
    cn: '不做什么',
    placeholder: '明确排除项',
    value:
      '本期不做：设备配置自动下发、现场作业调度排班、客户侧主动通知（二期）、多省份数据打通。',
    weight: 4,
    minLength: 15,
    hint: '明确边界能显著提高项目可交付性',
  },
];

export interface CriticCheck {
  key: string;
  name: string;
  desc: string;
  relatedFields: string[];
}

export const criticChecks: CriticCheck[] = [
  { key: 'scope', name: '问题是否过宽', desc: '问题边界是否清晰、是否明确了 Out of Scope', relatedFields: ['problem_statement', 'out_of_scope'] },
  { key: 'specific', name: '是否具体', desc: '是否指明具体场景、角色与流程环节', relatedFields: ['problem_statement', 'target_user', 'current_situation'] },
  { key: 'measurable', name: '是否可衡量', desc: 'KPI 是否有基线值与目标值', relatedFields: ['kpi', 'business_value'] },
  { key: 'actionable', name: '是否可执行', desc: '期望结果是否落在团队能力与周期范围内', relatedFields: ['desired_outcome', 'constraints'] },
  { key: 'data', name: '是否有数据', desc: '关键数据是否可得、质量是否评估', relatedFields: ['data_availability'] },
  { key: 'ai_fit', name: '是否适合 AI', desc: 'AI 相比规则引擎是否有增量价值', relatedFields: ['ai_opportunity', 'root_cause'] },
  { key: 'deployable', name: '是否可部署', desc: '是否考虑集成方式与运行环境约束', relatedFields: ['constraints'] },
  { key: 'evaluable', name: '是否可评估', desc: '是否能在 POC 周期内验证效果', relatedFields: ['kpi'] },
];

export const criticSuggestions: Record<string, string> = {
  scope: '建议在 Out of Scope 中进一步明确"是否包含无线侧告警"，当前表述可能被理解为覆盖全网。',
  specific: '目标用户已区分主次，建议补充值班经理审批环节的日均处理量，用于估算审批负载。',
  measurable: 'KPI 基线与目标齐备。建议补充"审批平均耗时"指标，避免人工审批成为新瓶颈。',
  actionable: '期望结果依赖 ITSM 写接口，建议确认 POC 阶段是否可获得测试环境写权限。',
  data: '知识库时效性风险已识别，建议明确过滤策略（如仅检索 24 个月内文档）并写入 Project Memory。',
  ai_fit: '根因推理场景确有 AI 价值。建议说明纯规则引擎在告警聚合上的失效边界，强化论证。',
  deployable: '数据不出内网的约束已记录，建议在 Solution Canvas 中明确模型私有化部署形态。',
  evaluable: '建议准备 50 条历史故障作为回归评测集，用于 L2 Agent 层任务成功率验证。',
};
