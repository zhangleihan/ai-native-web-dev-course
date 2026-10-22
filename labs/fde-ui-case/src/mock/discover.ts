import type { ExtractItem, InterviewScript, Stakeholder } from './types';

export const stakeholders: Stakeholder[] = [
  {
    id: 'sh-1',
    name: '周维明',
    role: 'CIO',
    department: '信息技术部',
    goal: '两年内把运维自动化率提升到 60%，降低人力成本',
    painPoint: '各系统数据孤岛，投入产出难以量化',
    influence: 95,
    interest: 80,
    attitude: '积极推动自动化',
    avatarColor: '#1677ff',
  },
  {
    id: 'sh-2',
    name: '赵国栋',
    role: 'Operations Manager',
    department: '网络运维中心',
    goal: '把重大故障平均恢复时长压到 30 分钟以内',
    painPoint: '定位慢、跨系统查询繁琐、夜班人手紧张',
    influence: 85,
    interest: 95,
    attitude: '保守，担心失去控制权',
    avatarColor: '#13c2c2',
  },
  {
    id: 'sh-3',
    name: '刘敏',
    role: 'Business User',
    department: '监控班',
    goal: '减少无效告警的人工筛选负担',
    painPoint: '一个班次要看 2000 多条告警，眼睛都花了',
    influence: 40,
    interest: 90,
    attitude: '期待但担心被替代',
    avatarColor: '#52c41a',
  },
  {
    id: 'sh-4',
    name: '陈锐',
    role: 'Engineer',
    department: '诊断班',
    goal: '拿到工单时已有清晰的故障判断依据',
    painPoint: '工单描述模糊，到现场才发现是误派',
    influence: 55,
    interest: 85,
    attitude: '务实，只信有证据的结论',
    avatarColor: '#722ed1',
  },
  {
    id: 'sh-5',
    name: '孙丽华',
    role: 'CEO',
    department: '总经办',
    goal: 'SLA 达成率保持 99.5% 以上，同时控制运维预算',
    painPoint: '重大故障带来的客户投诉与监管压力',
    influence: 100,
    interest: 50,
    attitude: '关注结果与风险，不关心技术细节',
    avatarColor: '#fa541c',
  },
  {
    id: 'sh-6',
    name: '客户代表 · 郑先生',
    role: 'Customer',
    department: '政企客户',
    goal: '专线业务中断能被主动告知与快速恢复',
    painPoint: '经常是自己先发现故障再打电话投诉',
    influence: 30,
    interest: 70,
    attitude: '不满，要求透明',
    avatarColor: '#eb2f96',
  },
];

export const interviewScripts: Record<string, InterviewScript[]> = {
  'sh-2': [
    {
      question: '目前一次典型的重大故障，从告警到恢复的完整流程是怎样的？',
      answer:
        '告警先进 FaultCenter，监控班在大屏上筛，确认是有效告警后电话通知诊断班。诊断班要登录网管系统查拓扑、翻知识库找历史案例，判断根因后填工单交给派单班。平均下来光定位就 47 分钟，加上派单和现场处理，重大故障恢复常常要 2 小时以上。最难受的是夜班，一个人要盯三块屏。',
      extracts: [
        { id: 'ex-1', type: 'PainPoint', content: '故障定位平均耗时 47 分钟，跨 3 套系统人工切换', confidence: 0.94, source: '赵国栋访谈 · 第 1 轮' },
        { id: 'ex-2', type: 'DataSource', content: 'FaultCenter 告警平台 / NMS 网管系统 / Confluence 知识库', confidence: 0.91, source: '赵国栋访谈 · 第 1 轮' },
        { id: 'ex-3', type: 'KPI', content: '重大故障平均恢复时长 MTTR > 120 分钟', confidence: 0.88, source: '赵国栋访谈 · 第 1 轮' },
      ],
    },
    {
      question: '如果 AI 可以自动生成诊断结论并派单，您最担心什么？',
      answer:
        '（沉默几秒）说实话我最担心的是担责问题。去年有个脚本误操作把一台核心路由器重启了，影响了三个地市，事后定的规矩是任何设备变更必须双人确认。AI 要是自动派单派错了，出了事算谁的？我不反对 AI 给建议，但真正动设备、开工单这种事，必须有人点头。而且我要能看到它为什么这么判断，光给个结论我不敢信。',
      extracts: [
        { id: 'ex-4', type: 'Constraint', content: '任何设备变更类操作必须双人确认（去年事故后的硬性规定）', confidence: 0.97, source: '赵国栋访谈 · 第 2 轮' },
        { id: 'ex-5', type: 'Requirement', content: '高风险动作（派单、设备操作）必须人工审批后执行', confidence: 0.95, source: '赵国栋访谈 · 第 2 轮' },
        { id: 'ex-6', type: 'Requirement', content: '诊断结论必须附带推理依据与证据来源，可追溯', confidence: 0.92, source: '赵国栋访谈 · 第 2 轮' },
        { id: 'ex-7', type: 'Conflict', content: 'CIO 推动全自动化，运维中心要求保留人工控制权', confidence: 0.86, source: '赵国栋访谈 · 第 2 轮' },
      ],
    },
    {
      question: '知识库的内容质量如何？可以直接给 AI 用吗？',
      answer:
        '这个……你问到点子上了。知识库有 400 多篇文档，但说实话有六成两年没更新过了。设备换代了，里面写的处理步骤还是老型号的。你们要是直接拿去训练或者检索，AI 给出来的可能是过时的方案，那比没有还危险。真要用得先做一轮清洗，至少标一下时效性。',
      extracts: [
        { id: 'ex-8', type: 'Constraint', content: '知识库 60% 文档超过两年未更新，存在过时结论风险', confidence: 0.93, source: '赵国栋访谈 · 第 3 轮' },
        { id: 'ex-9', type: 'Requirement', content: 'RAG 检索结果需标注文档时效性并过滤过期内容', confidence: 0.89, source: '赵国栋访谈 · 第 3 轮' },
        { id: 'ex-10', type: 'Assumption', content: '假设可获取知识库文档的最后更新时间元数据', confidence: 0.62, source: 'AI 推断' },
      ],
    },
    {
      question: '什么样的效果算是这个项目成功了？',
      answer:
        '定位时间能砍一半我就很满意了，从 47 分钟降到 20 分钟以内。误派率现在新人有 23%，能压到 10% 以下。还有一点，监控班那 2000 多条告警的筛选量，AI 能帮着过滤掉八成噪声，让人只看真正要紧的，那对一线是实打实的减负。',
      extracts: [
        { id: 'ex-11', type: 'KPI', content: '故障定位时长目标：47 分钟 → 20 分钟以内（降幅 57%）', confidence: 0.96, source: '赵国栋访谈 · 第 4 轮' },
        { id: 'ex-12', type: 'KPI', content: '工单错派率目标：23% → 10% 以下', confidence: 0.94, source: '赵国栋访谈 · 第 4 轮' },
        { id: 'ex-13', type: 'KPI', content: '告警噪声过滤率目标 ≥ 80%', confidence: 0.9, source: '赵国栋访谈 · 第 4 轮' },
      ],
    },
  ],
  'sh-1': [
    {
      question: '您对这个 AI 运维项目的期望是什么？',
      answer:
        '我的目标很明确，两年内运维自动化率到 60%。现在 NOC 有 68 个人，人力成本一年小两千万。我不是要裁人，是要把人从重复劳动里解放出来。但我也清楚，运维中心那边阻力不小，他们觉得自动化就是要抢他们的活。你们做方案的时候要考虑这个，别搞成技术上很牛但推不下去。',
      extracts: [
        { id: 'ex-20', type: 'Requirement', content: '两年内运维自动化率达到 60%', confidence: 0.95, source: '周维明访谈' },
        { id: 'ex-21', type: 'Conflict', content: '一线担心自动化替代岗位，方案需考虑组织接受度', confidence: 0.88, source: '周维明访谈' },
      ],
    },
    {
      question: '预算和技术选型上有什么约束吗？',
      answer:
        '一期预算 300 万以内。数据不能出内网，这是红线，运营商的网络数据外传是要出大事的。所以要么私有化部署模型，要么用信创名录里的。另外我们已经买了 ITSM 系统，别再搞一套，做集成。',
      extracts: [
        { id: 'ex-22', type: 'Constraint', content: '数据不出内网，模型需私有化部署或使用信创合规模型', confidence: 0.98, source: '周维明访谈' },
        { id: 'ex-23', type: 'Constraint', content: '一期预算上限 300 万', confidence: 0.93, source: '周维明访谈' },
        { id: 'ex-24', type: 'Requirement', content: '与现有 ITSM 系统集成，不新建工单系统', confidence: 0.91, source: '周维明访谈' },
      ],
    },
  ],
  'sh-3': [
    {
      question: '您一个班次大概要处理多少告警？',
      answer:
        '一个班八小时，少说两千多条。真正有用的可能就一百来条，剩下都是重复告警、抖动告警。有时候一个光模块闪一下，能刷出来几十条。我们就是靠经验看，哪些是同一个根因引起的。眼睛盯久了真的会漏，上个月就漏了一条，后来被通报了。',
      extracts: [
        { id: 'ex-30', type: 'PainPoint', content: '单班次需人工筛选 2000+ 条告警，有效率不足 6%', confidence: 0.95, source: '刘敏访谈' },
        { id: 'ex-31', type: 'PainPoint', content: '同一根因产生数十条重复告警，缺乏自动关联收敛', confidence: 0.92, source: '刘敏访谈' },
        { id: 'ex-32', type: 'Evidence', content: '上月因人工漏检导致故障升级并被通报', confidence: 0.85, source: '刘敏访谈' },
      ],
    },
  ],
  'sh-4': [
    {
      question: '您拿到工单时，最希望上面有什么信息？',
      answer:
        '最起码告诉我是哪个网元、什么类型的故障、影响了哪些业务。现在很多工单就写"XX 站点告警，请处理"，我到现场才知道是电源问题还是传输问题，带的备件都不对。如果 AI 能把根因判断、影响范围、建议处理步骤都写清楚，还能告诉我它是根据什么判断的，那我信它。',
      extracts: [
        { id: 'ex-40', type: 'Requirement', content: '工单需包含网元标识、故障类型、影响业务范围、建议处理步骤', confidence: 0.94, source: '陈锐访谈' },
        { id: 'ex-41', type: 'Requirement', content: '诊断结论需给出判断依据以建立现场工程师信任', confidence: 0.9, source: '陈锐访谈' },
        { id: 'ex-42', type: 'PainPoint', content: '工单描述模糊导致备件准备错误、二次往返', confidence: 0.91, source: '陈锐访谈' },
      ],
    },
  ],
  'sh-5': [
    {
      question: '从公司层面看，这个项目最关键的价值是什么？',
      answer:
        '我只看三件事：SLA 达没达标、客户投诉多不多、监管有没有找上门。技术上怎么实现我不关心。但有一条，别给我搞出新的风险。AI 出错导致大面积断网，那损失比现在这点效率问题大得多。',
      extracts: [
        { id: 'ex-50', type: 'KPI', content: 'SLA 达成率保持 99.5% 以上', confidence: 0.96, source: '孙丽华访谈' },
        { id: 'ex-51', type: 'Constraint', content: 'AI 引入不得带来新的大面积业务中断风险', confidence: 0.97, source: '孙丽华访谈' },
      ],
    },
  ],
  'sh-6': [
    {
      question: '作为客户，您希望故障处理有什么改进？',
      answer:
        '最基本的，别让我先发现。上个月专线断了 40 分钟，我打电话过去他们才知道。能不能主动通知？告诉我预计多久恢复？这比事后赔偿有意义多了。',
      extracts: [
        { id: 'ex-60', type: 'Requirement', content: '故障发生时主动通知受影响客户并提供预计恢复时间', confidence: 0.89, source: '客户访谈' },
        { id: 'ex-61', type: 'PainPoint', content: '客户先于运维发现故障，被动响应损害客户信任', confidence: 0.93, source: '客户访谈' },
      ],
    },
  ],
};

export const initialExtracts: ExtractItem[] = [
  {
    id: 'ex-seed-1',
    type: 'PainPoint',
    content: '日均告警 8000+ 条，有效告警不足 6%',
    confidence: 0.96,
    source: '案例背景资料',
    status: 'accepted',
  },
  {
    id: 'ex-seed-2',
    type: 'DataSource',
    content: '告警数据样本.csv（近 30 天 24 万条记录）',
    confidence: 0.99,
    source: '案例数据沙盒',
    status: 'accepted',
  },
];

export const extractTypeMeta: Record<string, { color: string; label: string }> = {
  PainPoint: { color: 'red', label: '痛点' },
  Requirement: { color: 'blue', label: '需求' },
  Constraint: { color: 'orange', label: '约束' },
  KPI: { color: 'green', label: 'KPI' },
  DataSource: { color: 'cyan', label: '数据源' },
  Assumption: { color: 'purple', label: '假设' },
  Conflict: { color: 'magenta', label: '冲突' },
  Evidence: { color: 'geekblue', label: '证据' },
};

export const personaHints: Record<string, string[]> = {
  'sh-1': ['您对这个 AI 运维项目的期望是什么？', '预算和技术选型上有什么约束吗？'],
  'sh-2': [
    '目前一次典型的重大故障，从告警到恢复的完整流程是怎样的？',
    '如果 AI 可以自动生成诊断结论并派单，您最担心什么？',
    '知识库的内容质量如何？可以直接给 AI 用吗？',
    '什么样的效果算是这个项目成功了？',
  ],
  'sh-3': ['您一个班次大概要处理多少告警？'],
  'sh-4': ['您拿到工单时，最希望上面有什么信息？'],
  'sh-5': ['从公司层面看，这个项目最关键的价值是什么？'],
  'sh-6': ['作为客户，您希望故障处理有什么改进？'],
};
