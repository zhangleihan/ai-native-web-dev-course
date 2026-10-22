import type { EvalL1Item, EvalL2Item, EvalL3Item, EvalL4Item } from './datasets/schema';

export const evalL1: EvalL1Item[] = [
  { name: 'Accuracy', cn: '根因判断准确率', value: 0.93, target: 0.9, unit: '', desc: '50 条回归集上根因判断与专家标注一致率' },
  { name: 'Faithfulness', cn: '证据忠实度', value: 0.96, target: 0.95, unit: '', desc: '结论中每条论断均可回溯到引用文档' },
  { name: 'Hallucination', cn: '幻觉率', value: 0.02, target: 0.05, unit: '', desc: '出现无依据事实陈述的比例（越低越好）', lower: true },
];

export const evalL2: EvalL2Item[] = [
  { name: 'Task Success', cn: '任务成功率', value: 0.91, target: 0.85, desc: '完整走通诊断到工单草稿的比例' },
  { name: 'Tool Success', cn: '工具调用成功率', value: 0.97, target: 0.95, desc: '工具调用返回有效结果的比例' },
  { name: 'Action Accuracy', cn: '动作正确率', value: 0.89, target: 0.85, desc: '选择了正确工具与参数的比例' },
  { name: 'Avg Steps', cn: '平均步数', value: 6.2, target: 8, desc: '单次任务平均执行步骤数（越少越好）', lower: true },
  { name: 'Intervention Rate', cn: '人工干预率', value: 0.18, target: 0.25, desc: '需要人工复核或纠正的比例（越低越好）', lower: true },
];

export const evalL3: EvalL3Item[] = [
  { name: 'P50 Latency', cn: '中位时延', value: 14.8, unit: 's', target: 20, lower: true },
  { name: 'P95 Latency', cn: 'P95 时延', value: 28.4, unit: 's', target: 35, lower: true },
  { name: 'Avg Cost', cn: '单次成本', value: 0.31, unit: '$', target: 0.5, lower: true },
  { name: 'Availability', cn: '可用性', value: 99.2, unit: '%', target: 99 },
  { name: 'Error Rate', cn: '错误率', value: 2.8, unit: '%', target: 5, lower: true },
];

export const evalL4: EvalL4Item[] = [
  {
    name: 'Time Saved',
    cn: '定位时长缩短',
    before: '47 分钟',
    after: '19.4 分钟',
    delta: '-58.7%',
    positive: true,
    note: '基于 50 条回归集与 12 次灰度实测的加权结果',
  },
  {
    name: 'Cost Saved',
    cn: '年化人力成本节约',
    before: '—',
    after: '约 82 万元',
    delta: '+82万',
    positive: true,
    note: '630 工时 + 二次派单减少，按运维人力单价折算',
  },
  {
    name: 'Process Reduction',
    cn: '流程环节压缩',
    before: '6 个环节',
    after: '4 个环节',
    delta: '-2',
    positive: true,
    note: '合并了监控班筛选与诊断班定位环节',
  },
  {
    name: 'KPI Improvement',
    cn: '工单错派率',
    before: '23%',
    after: '9.6%',
    delta: '-13.4pp',
    positive: true,
    note: '达成 ≤10% 的目标',
  },
  {
    name: 'ROI',
    cn: '投资回报',
    before: '—',
    after: '1.9 年回本',
    delta: 'ROI 152%',
    positive: true,
    note: '按一期投入 300 万、三年收益折算',
  },
];

export const fdeScore = [
  { name: 'Problem Understanding', cn: '问题理解', weight: 20, score: 17, comment: 'Problem Canvas 完整，PSF 86 分，访谈证据充分' },
  { name: 'Business/Ontology Model', cn: '业务/Ontology 建模', weight: 15, score: 12, comment: '7 个对象覆盖核心流程，检修窗口候选尚未确认' },
  { name: 'Solution Design', cn: '方案设计', weight: 15, score: 13, comment: 'Workflow+Agent 选型论证清晰，风险缓解措施到位' },
  { name: 'Prototype', cn: '原型实现', weight: 15, score: 11, comment: '主流程可运行，客户通知模块为 Mock' },
  { name: 'Agent/Harness Quality', cn: 'Agent/Harness 质量', weight: 10, score: 9, comment: '权限矩阵、审批链路、Guardrail 均已落地' },
  { name: 'Deployment', cn: '部署', weight: 10, score: 8, comment: '沙箱部署成功并分配 URL，缺少压测数据' },
  { name: 'Evaluation', cn: '评测', weight: 10, score: 8, comment: 'L1-L4 四层齐备，灰度样本量偏小' },
  { name: 'Business Value', cn: '业务价值', weight: 5, score: 4, comment: 'ROI 测算口径合理，假设需业务方确认' },
];

export const teamComparison = [
  { team: 'MEM 第三组', score: 82, psf: 86, ontology: 7, runs: 38, deploy: true, current: true },
  { team: 'MEM 第一组', score: 76, psf: 81, ontology: 6, runs: 29, deploy: true },
  { team: 'MEM 第五组', score: 74, psf: 78, ontology: 9, runs: 45, deploy: false },
  { team: 'MEM 第二组', score: 69, psf: 72, ontology: 5, runs: 22, deploy: true },
  { team: 'MEM 第四组', score: 61, psf: 64, ontology: 4, runs: 17, deploy: false },
];

export const teacherFeedback = [
  {
    author: '陈老师',
    role: '教师',
    time: '2026-08-26 09:20',
    content:
      '问题定义质量很高，特别是把"设备变更双人确认"这条组织约束提前识别出来并固化为 Project Memory，这是很成熟的 FDE 思维。建议在 Ontology 中尽快确认 MaintenanceWindow，否则误报工单的风险无法闭环。',
    tags: ['优点', '待改进'],
  },
  {
    author: '赵工',
    role: '企业导师',
    time: '2026-08-25 20:44',
    content:
      '从运维实践看，诊断结论带证据引用这一点做得对，一线才会信。但推荐处理人只看技能和在班状态还不够，实际派单还要考虑当前手头工单数量，建议补充负载因子。',
    tags: ['实践建议'],
  },
  {
    author: '陈老师',
    role: '教师',
    time: '2026-08-24 16:10',
    content: 'Trace 记录完整，Run #0031 的失败复盘写得好，把"拓扑查询前置"沉淀成 Episodic Memory 是加分项。',
    tags: ['优点'],
  },
];

export const portfolioSections = [
  {
    key: 'summary',
    title: '项目摘要',
    content:
      '本项目面向省级核心网运维场景，构建了一套"告警收敛—根因诊断—审批派单"的智能运维 Agent 系统。通过 Ontology 打通告警、拓扑、业务、工单四类业务对象，以 Workflow + Agent 的确定性编排替代自由多智能体，在保留人工控制权的前提下将故障定位时长从 47 分钟压缩至 19.4 分钟。',
  },
  {
    key: 'problem',
    title: '问题定义',
    content:
      '核心问题：诊断班在告警发生后需跨 3 套系统人工查询定位根因，平均耗时 47 分钟，导致重大故障 MTTR 超过 120 分钟。根因在于四套系统数据未打通、故障判断逻辑未显性化。PSF 评分 86/100。',
  },
  {
    key: 'model',
    title: '业务建模',
    content:
      '构建 7 个业务对象（NetworkElement、Alarm、Service、Customer、WorkOrder、Engineer、Location）、6 组关系、5 个 Action、5 条业务规则。其中"低置信度转人工"与"设备变更双人确认"两条规则直接对应组织约束。',
  },
  {
    key: 'solution',
    title: '解决方案',
    content:
      'Triage Agent 分诊 → Diagnosis Agent 根因推理（RAG + 拓扑 + 历史工单）→ 置信度门控 → 风险门控 → 人工审批 → Operations Agent 创建工单。所有模型私有化部署，数据不出内网。',
  },
  {
    key: 'harness',
    title: '工程底座',
    content:
      'Harness 提供 Context Builder（9 个上下文块、Token 预算管理）、权限矩阵（ALLOW/DENY/APPROVAL_REQUIRED）、人工审批、沙箱执行、完整 Trace 与 Eval Hook。create_work_order 等高风险工具强制审批，execute_device_command 全面 DENY。',
  },
  {
    key: 'result',
    title: '交付成果',
    content:
      '部署 URL：https://p-2024-07.sandbox.fde-lab.internal；38 次 Agent Run，任务成功率 91%；L1-L4 四层评测齐备；FDE 综合评分 82/100。',
  },
  {
    key: 'lesson',
    title: '复盘与沉淀',
    content:
      '三条关键教训已写入 Episodic Memory：① 拓扑查询应前置于知识检索；② 批量写操作需串行化并退避；③ 必须启用文档时效过滤。两条关键决策写入 Decision Memory：采用 Workflow+Agent 编排、置信度阈值定为 0.8。',
  },
];
