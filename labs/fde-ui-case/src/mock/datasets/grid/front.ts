import type { CanvasField } from '../../define';
import type { ArchNode, SolutionField } from '../../design';
import type {
  ExtractItem,
  InterviewScript,
  OntologyAction,
  OntologyCandidate,
  OntologyObject,
  OntologyRelation,
  OntologyRule,
  Stage,
  Stakeholder,
} from '../../types';
import type { ArchitectSuggestion, CaseDetailData, GraphEdge, ProjectMeta } from '../schema';

export const gridProject: ProjectMeta = {
  id: 'p-2024-11',
  name: '电网设备巡检报告自动化',
  industry: '能源电力 / 输变电运维',
  caseId: 'case-006',
  caseName: '电网设备巡检报告自动化',
  accent: '#faad14',
  team: 'MEM 第五组',
  teamMembers: [
    { name: '沈立群', role: 'FDE Lead', color: '#faad14' },
    { name: '崔明轩', role: 'Business Analyst', color: '#52c41a' },
    { name: '孟晓', role: 'Agent Engineer', color: '#722ed1' },
    { name: '范志远', role: 'Vision / Data', color: '#13c2c2' },
    { name: '许琳', role: 'Eval / QA', color: '#eb2f96' },
  ],
  teacher: '陈老师',
  mentor: '王工（国电华东运维检修部）',
  currentStage: 'Deploy',
  deadline: '2026-09-05',
  daysLeft: 10,
  overallScore: 74,
  createdAt: '2026-08-15',
  stats: { runs: 45, successRate: 0.86, avgLatency: 42.6, totalCost: 26.1 },
};

export const gridStages: Stage[] = [
  { key: 'discover', name: 'Discover', cn: '业务发现', status: 'done', progress: 100, owner: '崔明轩', route: 'discover' },
  { key: 'define', name: 'Define', cn: '问题定义', status: 'done', progress: 100, owner: '崔明轩', route: 'define' },
  { key: 'model', name: 'Model', cn: '业务建模', status: 'done', progress: 100, owner: '范志远', route: 'ontology' },
  { key: 'design', name: 'Design', cn: '方案设计', status: 'done', progress: 100, owner: '沈立群', route: 'design' },
  { key: 'build', name: 'Build', cn: 'Agent 构建', status: 'done', progress: 100, owner: '孟晓', route: 'agents' },
  { key: 'deploy', name: 'Deploy', cn: '沙箱部署', status: 'active', progress: 70, owner: '孟晓', route: 'deploy' },
  { key: 'evaluate', name: 'Evaluate', cn: '效果评测', status: 'todo', progress: 35, owner: '许琳', route: 'eval' },
  { key: 'evolve', name: 'Evolve', cn: '复盘沉淀', status: 'todo', progress: 0, owner: '全组', route: 'eval' },
];

export const gridCaseDetail: CaseDetailData = {
  id: 'case-006',
  background: {
    company: '国电华东电力运维分公司',
    industry: '能源电力 / 输变电运维检修',
    organization: '运维检修部下设 6 个巡检班组共 92 人，负责 220kV 及以下变电站 148 座',
    businessModel: '承接省公司输变电设备运维检修业务，按巡检覆盖率、缺陷发现率与报告及时率三项指标考核',
    currentSystem: '移动巡检 APP（拍照/录音）、PMS 生产管理系统（缺陷工单）、Excel 报告模板、班组微信群，四者之间靠人工搬运',
    businessProcess: '现场巡检 → 拍照记录 → 回站整理 → Excel 填报 → 班长审核 → 上传 PMS → 月度汇总',
    knownProblems: [
      '一次站内巡检产生 200-400 张照片，回站整理报告平均耗时 3.5 小时，比巡检本身还久',
      '缺陷描述靠个人经验撰写，同一类缺陷不同人写法差异极大，无法做统计与趋势分析',
      '约 30% 照片缺少设备标识，与台账对不上，事后无法追溯到具体设备',
      '报告普遍滞后 2-3 天才上传 PMS，紧急缺陷的响应被人为延迟',
    ],
  },
  hiddenFacts: [
    '变电站内 4G 信号差，APP 常离线缓存，照片延迟上传导致"上传时间"与"拍摄时间"严重错位，不能用上传时间做判断',
    '去年发生过一起漏报导致主变故障的事故，之后硬性规定所有"危急缺陷"必须班长现场复核签字才能上报',
    'PMS 缺陷分类字典有 187 项，实际常用不到 35 项，其余是历史遗留，直接让模型在 187 项里选会大幅降低准确率',
    '部分巡检员为赶进度存在补拍、凑数行为，照片 EXIF 时间戳能够验证，但目前无人核查',
    '省公司正在推"无人机 + AI 识别"，班组普遍担心 AI 误判反而增加复核工作量，抵触情绪明显',
  ],
  resources: [
    { name: '巡检照片样本.zip', type: 'Images', size: '4.2 GB', desc: '近半年 18 座站巡检照片 3.7 万张，含 EXIF' },
    { name: '设备台账.csv', type: 'CSV', size: '6.8 MB', desc: '148 座变电站 2.1 万台设备的位置、型号、投运日期' },
    { name: '历史缺陷记录.csv', type: 'CSV', size: '11.3 MB', desc: '三年缺陷记录 4.6 万条，含定级与处理结果' },
    { name: '缺陷定级标准.pdf', type: 'Documents', size: '18 MB', desc: '《输变电一次设备缺陷定级标准》等 6 份规程' },
    { name: '巡检报告模板.docx', type: 'Documents', size: '2.4 MB', desc: '现行 Excel/Word 报告模板 5 套' },
    { name: 'PMS Mock Service', type: 'Mock Service', size: '—', desc: '缺陷单创建 / 报告上传模拟服务' },
  ],
  deliverables: [
    'Problem Canvas 与 PSF 评分 ≥ 70',
    'Ontology 至少 6 个 Object、5 组 Relation、3 个 Action',
    '可运行的缺陷识别与报告生成 Workflow',
    '危急缺陷的班长复核审批链路',
    '照片有效性校验（时间戳 / GPS / 重复）机制',
    '完整 Trace 与 L1-L4 评测报告',
  ],
  evaluation: [
    { name: '问题理解', weight: 20 },
    { name: '业务/Ontology建模', weight: 15 },
    { name: '方案设计', weight: 15 },
    { name: '原型实现', weight: 15 },
    { name: 'Agent/Harness 质量', weight: 10 },
    { name: '部署', weight: 10 },
    { name: '评测', weight: 10 },
    { name: '业务价值', weight: 5 },
  ],
};

export const gridStakeholders: Stakeholder[] = [
  {
    id: 'gsh-1',
    name: '韩志远',
    role: 'Department Head',
    department: '运维检修部',
    goal: '报告及时率做到 100%，缺陷发现率再提升 20%',
    painPoint: '92 个人管 148 座站，人力已经到极限，还要应付省公司考核',
    influence: 90,
    interest: 85,
    attitude: '积极，但要求不能增加班组负担',
    avatarColor: '#faad14',
  },
  {
    id: 'gsh-2',
    name: '马国庆',
    role: 'Team Leader',
    department: '第三巡检班组',
    goal: '让班员少加班，自己少熬夜审报告',
    painPoint: '整理报告比巡检还累，一个班 8 个人的报告我一晚上审不完',
    influence: 75,
    interest: 98,
    attitude: '保守，担心 AI 误判最后要他签字背锅',
    avatarColor: '#fa541c',
  },
  {
    id: 'gsh-3',
    name: '李婷',
    role: 'Business User',
    department: '第三巡检班组',
    goal: '巡检完能早点下班',
    painPoint: '一天拍三百多张照片，回来对着照片写报告要写到晚上九点',
    influence: 35,
    interest: 95,
    attitude: '期待，但不信任 AI 能看懂现场照片',
    avatarColor: '#52c41a',
  },
  {
    id: 'gsh-4',
    name: '郑海涛',
    role: 'Equipment Engineer',
    department: '设备专责组',
    goal: '拿到规范化的缺陷数据，做设备劣化趋势分析',
    painPoint: '缺陷描述五花八门，同一个"渗油"能有十几种写法，根本没法统计',
    influence: 60,
    interest: 88,
    attitude: '务实，最关心数据规范性',
    avatarColor: '#722ed1',
  },
  {
    id: 'gsh-5',
    name: '周雪梅',
    role: 'Vice President',
    department: '分公司领导班子',
    goal: '安全零事故，迎检不被点名',
    painPoint: '监管检查时报告质量参差被通报过，压力很大',
    influence: 100,
    interest: 55,
    attitude: '只看结果与合规，不关心技术路线',
    avatarColor: '#1677ff',
  },
  {
    id: 'gsh-6',
    name: '省公司运检部 · 吴主管',
    role: 'Regulator',
    department: '省公司运维检修部',
    goal: '各分公司缺陷数据格式统一、按时上报',
    painPoint: '收上来的报告口径不一，汇总分析要人工二次加工',
    influence: 85,
    interest: 45,
    attitude: '强调标准符合性',
    avatarColor: '#13c2c2',
  },
];

export const gridInterviewScripts: Record<string, InterviewScript[]> = {
  'gsh-2': [
    {
      question: '一次完整的站内巡检，从出发到报告上传 PMS，流程是怎么走的？',
      answer:
        '早上八点出发，一个 220kV 的站走完大概四五个小时，边走边拍，主变、断路器、隔离开关、避雷器挨个看。回来是下午了，然后开始整理——把手机里两三百张照片导出来，对着照片回忆哪张是哪个设备，填 Excel 模板，写缺陷描述。这一步平均要三个半小时，比巡检本身还久。写完我这个班长要审，八个人的报告我一晚上审不完，经常拖到第二天。审完再手工录进 PMS。整体下来报告滞后两三天是常态。',
      extracts: [
        { id: 'gex-1', type: 'PainPoint', content: '回站整理报告平均耗时 3.5 小时，长于巡检作业本身', confidence: 0.95, source: '马国庆访谈 · 第 1 轮' },
        { id: 'gex-2', type: 'PainPoint', content: '班长需逐份人工审核 8 人报告，成为流程瓶颈', confidence: 0.92, source: '马国庆访谈 · 第 1 轮' },
        { id: 'gex-3', type: 'KPI', content: '报告上传 PMS 时延 2-3 天', confidence: 0.9, source: '马国庆访谈 · 第 1 轮' },
        { id: 'gex-4', type: 'DataSource', content: '移动巡检 APP 照片 / Excel 报告模板 / PMS 生产管理系统', confidence: 0.94, source: '马国庆访谈 · 第 1 轮' },
      ],
    },
    {
      question: '如果 AI 能自动识别照片里的缺陷并生成报告，您最担心什么？',
      answer:
        '（停顿）我担心的是签字这件事。去年隔壁班组漏报了一个主变套管的油位问题，后来主变出了故障，追责下来很难看。事故之后定了规矩：凡是"危急缺陷"，必须班长到现场复核，签字确认才能上报。现在你让 AI 来定级，它说这个是危急，我信不信？它说这个不是危急，结果出事了，签字的是我。所以我的底线很清楚——AI 可以帮我看、帮我写，但危急这一档必须我自己到现场确认，这个不能省。',
      extracts: [
        { id: 'gex-5', type: 'Constraint', content: '危急缺陷必须班长现场复核签字后才能上报（去年漏报事故后的硬性规定）', confidence: 0.98, source: '马国庆访谈 · 第 2 轮' },
        { id: 'gex-6', type: 'Requirement', content: 'AI 不得自动完成危急级缺陷的定级与上报，必须人工审批', confidence: 0.96, source: '马国庆访谈 · 第 2 轮' },
        { id: 'gex-7', type: 'Conflict', content: '部门要求提效与班组担心 AI 误判担责之间存在张力', confidence: 0.87, source: '马国庆访谈 · 第 2 轮' },
      ],
    },
    {
      question: '照片和设备台账对不上这个问题，具体是怎么发生的？',
      answer:
        '站里 4G 信号特别差，尤其是主变区域基本没信号。APP 拍完存本地，等出了站有信号才批量上传。问题就出在这——上传时间全挤在一起，你根本分不清哪张是几点拍的。而且拍的时候要是忘了先扫设备铭牌的二维码，这张照片就是"孤儿"，回来只能靠印象猜。三成左右的照片都有这个毛病。哦对了，还有个事儿……有的人赶进度，会拿上次的照片凑数。这个其实照片里的拍摄时间能看出来，但没人去查。',
      extracts: [
        { id: 'gex-8', type: 'Constraint', content: '站内 4G 信号差导致照片离线缓存后批量上传，上传时间不可用于时序判断，须以 EXIF 拍摄时间为准', confidence: 0.94, source: '马国庆访谈 · 第 3 轮' },
        { id: 'gex-9', type: 'PainPoint', content: '约 30% 照片未关联设备标识，事后无法追溯', confidence: 0.93, source: '马国庆访谈 · 第 3 轮' },
        { id: 'gex-10', type: 'Evidence', content: '存在以历史照片凑数的补拍行为，可通过 EXIF 时间戳识别', confidence: 0.81, source: '马国庆访谈 · 第 3 轮' },
        { id: 'gex-11', type: 'Requirement', content: '需对照片做时间戳与 GPS 有效性校验，疑似补拍不计入巡检覆盖率', confidence: 0.88, source: 'AI 推断' },
      ],
    },
    {
      question: '什么样的效果，您会认为这个东西真的有用？',
      answer:
        '整理报告的时间能砍到半小时以内，我就认。还有一点，别让我多干活——如果 AI 识别出来一堆东西还都要我一条条确认，那还不如不用。真正需要我签字的，就危急那一档，其他的它自己写完我抽查就行。',
      extracts: [
        { id: 'gex-12', type: 'KPI', content: '报告整理时长目标：3.5 小时 → ≤0.5 小时', confidence: 0.95, source: '马国庆访谈 · 第 4 轮' },
        { id: 'gex-13', type: 'Requirement', content: '人工确认范围应限于危急缺陷与低置信度识别结果，避免全量复核', confidence: 0.91, source: '马国庆访谈 · 第 4 轮' },
      ],
    },
  ],
  'gsh-1': [
    {
      question: '从部门层面看，您希望这个项目解决什么？',
      answer:
        '省公司对我们的考核就三条：巡检覆盖率、缺陷发现率、报告及时率。及时率现在是我们的短板，因为报告老是滞后。我不指望 AI 帮我多发现缺陷，我要的是把整理和上报这段时间压下来，让班组把精力放在现场。但有个前提——不能给班组增加新的活儿，他们已经很紧张了，92 个人管 148 座站。',
      extracts: [
        { id: 'gex-20', type: 'KPI', content: '报告及时率目标 100%（当日上传 PMS）', confidence: 0.94, source: '韩志远访谈' },
        { id: 'gex-21', type: 'Constraint', content: '方案不得增加一线班组的额外操作负担', confidence: 0.92, source: '韩志远访谈' },
        { id: 'gex-22', type: 'PainPoint', content: '92 人负责 148 座变电站，人力接近饱和', confidence: 0.96, source: '韩志远访谈' },
      ],
    },
    {
      question: '系统集成和数据安全上有什么要求？',
      answer:
        '缺陷数据必须回到 PMS，这是省公司的统一系统，不能另起炉灶。数据都在电力内网，不能出网，模型要么本地部署要么用集团批过的。还有 PMS 的缺陷分类字典，你们直接对接就行，别自己造一套分类。',
      extracts: [
        { id: 'gex-23', type: 'Constraint', content: '数据不出电力内网，模型需本地化部署', confidence: 0.98, source: '韩志远访谈' },
        { id: 'gex-24', type: 'Requirement', content: '缺陷单与报告必须回写 PMS，不新建工单系统', confidence: 0.95, source: '韩志远访谈' },
        { id: 'gex-25', type: 'Constraint', content: '缺陷分类必须使用 PMS 现有字典，不得自定义', confidence: 0.9, source: '韩志远访谈' },
      ],
    },
  ],
  'gsh-3': [
    {
      question: '您一次巡检大概拍多少照片？整理的时候最费劲的是什么？',
      answer:
        '两百到四百张吧，看站的大小。最费劲的是想不起来哪张对应哪个设备。断路器长得都一样，A 相 B 相 C 相拍出来我自己都分不清。还有写描述，"套管有渗油痕迹"这句话我要斟酌半天，写轻了怕被说漏报，写重了又要走危急流程。我们班每个人写法都不一样。',
      extracts: [
        { id: 'gex-30', type: 'PainPoint', content: '单次巡检产生 200-400 张照片，人工回忆设备归属极易出错', confidence: 0.94, source: '李婷访谈' },
        { id: 'gex-31', type: 'PainPoint', content: '缺陷描述措辞缺乏统一口径，个人间差异大', confidence: 0.92, source: '李婷访谈' },
        { id: 'gex-32', type: 'Requirement', content: '缺陷描述需引用标准条款，形成统一表述', confidence: 0.87, source: 'AI 推断' },
      ],
    },
  ],
  'gsh-4': [
    {
      question: '您做设备趋势分析时，现在的数据有什么问题？',
      answer:
        '最大的问题是不可统计。PMS 里缺陷描述是自由文本，"渗油""油迹""有油渗出""密封不良渗漏"，其实说的是一回事，但机器归不到一类。我想看某型号套管三年内的渗油趋势，得人工翻。还有一点，PMS 那个分类字典有一百八十多项，实际大家常用的就三十来项，剩下都是历史遗留，选起来眼花，很多人就随便选一个"其他"。',
      extracts: [
        { id: 'gex-40', type: 'PainPoint', content: '缺陷描述为自由文本，同义表述无法归并统计', confidence: 0.95, source: '郑海涛访谈' },
        { id: 'gex-41', type: 'Constraint', content: 'PMS 缺陷字典 187 项中实际常用仅约 35 项，需先做子集映射', confidence: 0.89, source: '郑海涛访谈' },
        { id: 'gex-42', type: 'KPI', content: '缺陷描述规范化率目标 ≥90%', confidence: 0.86, source: '郑海涛访谈' },
        { id: 'gex-43', type: 'Requirement', content: '缺陷记录需关联设备台账，支持按型号/投运年限做趋势分析', confidence: 0.9, source: '郑海涛访谈' },
      ],
    },
  ],
  'gsh-5': [
    {
      question: '从分公司层面，这个项目的底线是什么？',
      answer:
        '安全。我不要求它多智能，我要求它不能漏。监管来检查，报告写得好看没用，关键是有没有把该发现的问题发现出来、该上报的有没有上报。AI 要是把一个危急缺陷判成一般，那就是安全事故的口子。宁可它多报几个让人去核实，也不能少报一个。',
      extracts: [
        { id: 'gex-50', type: 'Constraint', content: '漏报风险不可接受，宁可提高误报率也不得降低召回', confidence: 0.97, source: '周雪梅访谈' },
        { id: 'gex-51', type: 'Requirement', content: '缺陷识别应偏向高召回策略，低置信度一律转人工确认', confidence: 0.93, source: '周雪梅访谈' },
      ],
    },
  ],
  'gsh-6': [
    {
      question: '省公司对分公司报告有哪些硬性要求？',
      answer:
        '格式统一、字段完整、定级引用标准条款编号。现在各分公司报上来的东西口径不一，我们汇总还要人工加工一遍。定级这块尤其乱，很多报告只写"严重"两个字，不写依据哪一条判的，我们没法复核。',
      extracts: [
        { id: 'gex-60', type: 'Requirement', content: '缺陷定级必须引用《输变电设备缺陷定级标准》具体条款编号', confidence: 0.95, source: '吴主管访谈' },
        { id: 'gex-61', type: 'Requirement', content: '报告字段与格式需符合省公司统一模板', confidence: 0.92, source: '吴主管访谈' },
      ],
    },
  ],
};

export const gridPersonaHints: Record<string, string[]> = {
  'gsh-1': ['从部门层面看，您希望这个项目解决什么？', '系统集成和数据安全上有什么要求？'],
  'gsh-2': [
    '一次完整的站内巡检，从出发到报告上传 PMS，流程是怎么走的？',
    '如果 AI 能自动识别照片里的缺陷并生成报告，您最担心什么？',
    '照片和设备台账对不上这个问题，具体是怎么发生的？',
    '什么样的效果，您会认为这个东西真的有用？',
  ],
  'gsh-3': ['您一次巡检大概拍多少照片？整理的时候最费劲的是什么？'],
  'gsh-4': ['您做设备趋势分析时，现在的数据有什么问题？'],
  'gsh-5': ['从分公司层面，这个项目的底线是什么？'],
  'gsh-6': ['省公司对分公司报告有哪些硬性要求？'],
};

export const gridInitialExtracts: ExtractItem[] = [
  {
    id: 'gex-seed-1',
    type: 'PainPoint',
    content: '单次巡检 200-400 张照片，报告整理平均 3.5 小时',
    confidence: 0.96,
    source: '案例背景资料',
    status: 'accepted',
  },
  {
    id: 'gex-seed-2',
    type: 'DataSource',
    content: '巡检照片样本.zip（18 座站 3.7 万张，含 EXIF）',
    confidence: 0.99,
    source: '案例数据沙盒',
    status: 'accepted',
  },
];

export const gridCanvasFields: CanvasField[] = [
  {
    key: 'problem_statement',
    label: 'Problem Statement',
    cn: '问题陈述',
    placeholder: '一句话说明要解决的核心问题',
    value:
      '变电站巡检员在完成现场作业后，需人工从 200-400 张照片中回忆设备归属并逐条撰写缺陷描述，平均耗时 3.5 小时，导致报告滞后 2-3 天上传 PMS、紧急缺陷响应被延迟。',
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
      '巡检员用移动 APP 拍照录音，回站后导出照片、凭记忆匹配设备、手工填写 Excel 模板并撰写缺陷描述，班长逐份审核后再人工录入 PMS。APP、Excel、PMS 三者之间靠人工搬运，无任何系统联动。',
    weight: 8,
    minLength: 40,
    hint: '描述现有流程、系统与人力投入',
  },
  {
    key: 'target_user',
    label: 'Target User',
    cn: '目标用户',
    placeholder: '谁会直接使用这个系统',
    value: '主要用户：巡检员（92 人，6 个班组）；次要用户：巡检班长（6 人，复核签字角色）、设备专责工程师（4 人，消费缺陷数据）。',
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
      '1) 报告整理 3.5 小时，长于巡检本身；2) 约 30% 照片无设备标识，事后无法追溯；3) 缺陷描述自由文本、同义表述无法统计；4) 班长逐份审核成为瓶颈，报告滞后 2-3 天。',
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
      '照片在采集环节就与设备台账脱钩（站内无信号、依赖人工扫码），缺陷判定标准未被显性化为可执行规则，导致后续所有结构化工作都只能由人在记忆与经验中完成。',
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
      '照片上传后自动完成有效性校验与设备匹配，多模态模型识别缺陷并按标准条款定级，系统生成符合省公司模板的报告草稿；班长仅需对危急缺陷现场复核签字，当日即可上传 PMS。',
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
      '按 6 个班组年均 2960 次站内巡检计算，单次节省 2.9 小时整理时间，年释放约 8580 工时；报告当日上报使紧急缺陷响应提前约 2.2 天，降低设备劣化扩大的风险敞口。',
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
      '多模态视觉识别照片中的渗油、锈蚀、破损、异物、油位异常等缺陷形态；结合台账与 GPS 做照片-设备匹配；依据定级标准生成引用条款的规范化缺陷描述。这三步都无法用固定规则表达。',
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
      '可得：巡检照片 3.7 万张（含 EXIF）、设备台账 2.1 万台、三年缺陷记录 4.6 万条、定级标准 6 份。风险：照片仅约 12% 有缺陷标注，夜间与逆光样本质量差；PMS 字典 187 项中仅约 35 项常用，需先做子集映射。',
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
      '危急缺陷必须班长现场复核签字，AI 不得自动定级上报；数据不出电力内网，模型本地化部署；缺陷分类必须使用 PMS 现有字典；照片时序判断只能用 EXIF 拍摄时间；不得增加一线额外操作负担。',
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
      '报告整理时长 3.5h → ≤0.5h；照片-设备关联率 70% → ≥95%；缺陷描述规范化率 → ≥90%；报告上传时延 2-3 天 → 当日；缺陷漏检率 ≤3%（高召回优先）。',
    weight: 6,
    minLength: 25,
    hint: '每个 KPI 需有基线值与目标值',
  },
  {
    key: 'out_of_scope',
    label: 'Out of Scope',
    cn: '不做什么',
    placeholder: '明确排除项',
    value: '本期不做：无人机巡检数据接入、红外测温图谱分析、检修工单排程、设备寿命预测模型。',
    weight: 4,
    minLength: 15,
    hint: '明确边界能显著提高项目可交付性',
  },
];

export const gridCriticSuggestions: Record<string, string> = {
  scope: 'Out of Scope 已排除无人机与红外，边界清晰。建议补充说明"是否覆盖 110kV 以下站点"，当前只写了 220kV 及以下，容易被理解为全覆盖。',
  specific: '目标用户区分了主次，但班长的复核工作量没有量化。建议补充"预计每次巡检产生多少条危急缺陷"，用于估算签字负载。',
  measurable: 'KPI 基线与目标齐备，且明确了高召回优先。建议补充"误报率上限"，否则为了保召回可能把误报推到不可用的程度。',
  actionable: '期望结果依赖 PMS 写接口，建议确认 POC 阶段能否拿到测试环境的缺陷单创建权限，否则只能停留在报告草稿。',
  data: '照片标注率仅 12% 是最大风险，建议明确冷启动策略：是先用规程文本做零样本识别，还是先人工标注一批种子集。',
  ai_fit: '视觉识别与规范化描述确有 AI 价值。建议补充说明为什么不能只用目标检测模型——多模态模型的优势在于能结合台账上下文生成描述。',
  deployable: '数据不出内网已记录。建议在 Solution Canvas 中明确视觉模型的显存需求与并发能力，287 张照片的批量识别对推理资源要求不低。',
  evaluable: '建议准备 200 张已标注照片作为回归集，并按缺陷类型分层，避免整体准确率掩盖某类缺陷的系统性漏检。',
};

export const gridOntologyObjects: OntologyObject[] = [
  {
    id: 'gobj-substation',
    name: 'Substation',
    cn: '变电站',
    description: '巡检作业的物理场所单元',
    source: '设备台账系统',
    x: 60,
    y: 40,
    properties: [
      { name: 'station_id', type: 'string', required: true, pk: true, desc: '变电站编号' },
      { name: 'name', type: 'string', required: true, desc: '站名' },
      { name: 'voltage_level', type: 'enum', required: true, desc: '220kV / 110kV / 35kV' },
      { name: 'region', type: 'string', required: true, desc: '所属供电区域' },
      { name: 'gps', type: 'geo', required: false, desc: '站址坐标（用于照片 GPS 校验）' },
    ],
  },
  {
    id: 'gobj-equipment',
    name: 'Equipment',
    cn: '设备',
    description: '站内受巡视的一次设备',
    source: '设备台账系统',
    x: 380,
    y: 40,
    properties: [
      { name: 'equipment_id', type: 'string', required: true, pk: true, desc: '设备唯一编号' },
      { name: 'station_id', type: 'ref', required: true, desc: '所属变电站' },
      { name: 'category', type: 'enum', required: true, desc: '主变 / 断路器 / 隔离开关 / 避雷器 / 互感器' },
      { name: 'model', type: 'string', required: true, desc: '设备型号' },
      { name: 'phase', type: 'enum', required: false, desc: 'A / B / C 相' },
      { name: 'commission_date', type: 'date', required: true, desc: '投运日期' },
      { name: 'qr_code', type: 'string', required: false, desc: '铭牌二维码标识' },
    ],
  },
  {
    id: 'gobj-defect',
    name: 'Defect',
    cn: '缺陷',
    description: '设备上被发现的异常状态',
    source: 'PMS + AI 识别',
    x: 700,
    y: 40,
    properties: [
      { name: 'defect_id', type: 'string', required: true, pk: true, desc: '缺陷编号' },
      { name: 'equipment_id', type: 'ref', required: true, desc: '所属设备' },
      { name: 'catalog_code', type: 'enum', required: true, desc: 'PMS 缺陷字典编码（常用子集 35 项）' },
      { name: 'level', type: 'enum', required: true, desc: '危急 / 严重 / 一般' },
      { name: 'standard_clause', type: 'string', required: true, desc: '定级依据条款编号' },
      { name: 'description', type: 'text', required: true, desc: '规范化缺陷描述' },
      { name: 'confidence', type: 'number', required: true, desc: 'AI 识别置信度' },
      { name: 'reviewed_by', type: 'ref', required: false, desc: '复核签字人（危急缺陷必填）' },
    ],
  },
  {
    id: 'gobj-task',
    name: 'InspectionTask',
    cn: '巡检任务',
    description: '一次针对某变电站的巡视作业',
    source: '移动巡检 APP',
    x: 60,
    y: 250,
    properties: [
      { name: 'task_id', type: 'string', required: true, pk: true, desc: '任务编号' },
      { name: 'station_id', type: 'ref', required: true, desc: '目标变电站' },
      { name: 'inspector_id', type: 'ref', required: true, desc: '执行巡检员' },
      { name: 'planned_at', type: 'datetime', required: true, desc: '计划开始时间' },
      { name: 'started_at', type: 'datetime', required: true, desc: '实际开始时间' },
      { name: 'finished_at', type: 'datetime', required: false, desc: '结束时间' },
      { name: 'coverage_rate', type: 'number', required: false, desc: '点位覆盖率' },
    ],
  },
  {
    id: 'gobj-record',
    name: 'InspectionRecord',
    cn: '巡检记录',
    description: '任务下针对单个设备点位的记录',
    source: '移动巡检 APP',
    x: 380,
    y: 250,
    properties: [
      { name: 'record_id', type: 'string', required: true, pk: true, desc: '记录编号' },
      { name: 'task_id', type: 'ref', required: true, desc: '所属任务' },
      { name: 'equipment_id', type: 'ref', required: false, desc: '关联设备（可能待匹配）' },
      { name: 'note', type: 'text', required: false, desc: '现场文字/语音记录' },
      { name: 'result', type: 'enum', required: true, desc: '正常 / 异常 / 未巡视' },
    ],
  },
  {
    id: 'gobj-photo',
    name: 'Photo',
    cn: '巡检照片',
    description: '现场采集的设备照片及其元数据',
    source: '移动巡检 APP',
    x: 700,
    y: 250,
    properties: [
      { name: 'photo_id', type: 'string', required: true, pk: true, desc: '照片标识' },
      { name: 'record_id', type: 'ref', required: false, desc: '所属巡检记录' },
      { name: 'equipment_id', type: 'ref', required: false, desc: '匹配到的设备' },
      { name: 'exif_time', type: 'datetime', required: true, desc: 'EXIF 拍摄时间（时序判断唯一依据）' },
      { name: 'upload_time', type: 'datetime', required: true, desc: '上传时间（离线缓存后批量上传，不可用于时序）' },
      { name: 'gps', type: 'geo', required: false, desc: '拍摄坐标' },
      { name: 'validity', type: 'enum', required: true, desc: '有效 / 缺GPS / 疑似补拍 / 重复' },
    ],
  },
  {
    id: 'gobj-report',
    name: 'InspectionReport',
    cn: '巡检报告',
    description: '面向 PMS 上报的结构化巡检报告',
    source: '报告生成服务',
    x: 380,
    y: 470,
    properties: [
      { name: 'report_id', type: 'string', required: true, pk: true, desc: '报告编号' },
      { name: 'task_id', type: 'ref', required: true, desc: '对应巡检任务' },
      { name: 'defect_count', type: 'number', required: true, desc: '缺陷总数' },
      { name: 'status', type: 'enum', required: true, desc: 'Draft / Reviewed / Uploaded' },
      { name: 'reviewer_id', type: 'ref', required: false, desc: '审核班长' },
      { name: 'uploaded_at', type: 'datetime', required: false, desc: 'PMS 上传时间' },
    ],
  },
  {
    id: 'gobj-inspector',
    name: 'Inspector',
    cn: '巡检人员',
    description: '执行巡检与复核的班组成员',
    source: 'HR / 排班系统',
    x: 60,
    y: 470,
    properties: [
      { name: 'inspector_id', type: 'string', required: true, pk: true, desc: '工号' },
      { name: 'name', type: 'string', required: true, desc: '姓名' },
      { name: 'team', type: 'string', required: true, desc: '所属班组' },
      { name: 'is_leader', type: 'boolean', required: true, desc: '是否班长（危急缺陷签字资格）' },
      { name: 'qualification', type: 'array', required: false, desc: '持证资质' },
    ],
  },
];

export const gridOntologyRelations: OntologyRelation[] = [
  { id: 'grel-1', from: 'gobj-substation', to: 'gobj-equipment', type: 'contains', cardinality: '1:N' },
  { id: 'grel-2', from: 'gobj-task', to: 'gobj-substation', type: 'covers', cardinality: 'N:1' },
  { id: 'grel-3', from: 'gobj-inspector', to: 'gobj-task', type: 'performs', cardinality: '1:N' },
  { id: 'grel-4', from: 'gobj-record', to: 'gobj-task', type: 'belongs_to', cardinality: 'N:1' },
  { id: 'grel-5', from: 'gobj-photo', to: 'gobj-record', type: 'attached_to', cardinality: 'N:1' },
  { id: 'grel-6', from: 'gobj-record', to: 'gobj-defect', type: 'identifies', cardinality: '1:N' },
  { id: 'grel-7', from: 'gobj-equipment', to: 'gobj-defect', type: 'has', cardinality: '1:N' },
  { id: 'grel-8', from: 'gobj-defect', to: 'gobj-report', type: 'reported_in', cardinality: 'N:1' },
];

export const gridOntologyActions: OntologyAction[] = [
  {
    id: 'gact-1',
    name: 'ValidatePhoto',
    target: 'Photo',
    executorType: 'Python Function',
    endpoint: 'photo_utils.validate(exif, gps, phash)',
    risk: 'low',
    desc: '校验 EXIF 拍摄时间是否落在任务时间窗内、GPS 是否在站址范围、是否与历史照片重复',
  },
  {
    id: 'gact-2',
    name: 'MatchEquipment',
    target: 'Equipment',
    executorType: 'Python Function',
    endpoint: 'ledger.match(photo, gps, qr, ocr)',
    risk: 'low',
    desc: '结合二维码、铭牌 OCR、GPS 与巡视路线顺序，把照片关联到台账设备',
  },
  {
    id: 'gact-3',
    name: 'RecognizeDefect',
    target: 'Defect',
    executorType: 'MCP Tool',
    endpoint: 'vision-mcp://defect/recognize',
    risk: 'low',
    desc: '多模态模型识别照片中的渗油、锈蚀、破损、异物、油位异常等缺陷形态',
  },
  {
    id: 'gact-4',
    name: 'GradeDefect',
    target: 'Defect',
    executorType: 'Agent',
    endpoint: 'agent://defect-grading',
    risk: 'high',
    desc: '依据定级标准条款判定危急/严重/一般，危急级不得自动上报，须班长现场复核',
  },
  {
    id: 'gact-5',
    name: 'CreateDefectOrder',
    target: 'Defect',
    executorType: 'API',
    endpoint: 'POST /pms/defect/create',
    risk: 'high',
    desc: '在 PMS 创建缺陷单，属业务写操作，需人工审批',
  },
  {
    id: 'gact-6',
    name: 'GenerateReport',
    target: 'InspectionReport',
    executorType: 'Workflow',
    endpoint: 'wf://report/generate',
    risk: 'medium',
    desc: '按省公司统一模板渲染结构化巡检报告草稿',
  },
];

export const gridOntologyRules: OntologyRule[] = [
  {
    id: 'grule-1',
    name: '危急缺陷强制现场复核',
    ifExpr: ['Defect.level == "危急"'],
    thenExpr: 'DENY 自动上报，必须 Inspector.is_leader == true 现场复核签字（事故后硬性规定）',
    enabled: true,
  },
  {
    id: 'grule-2',
    name: '照片时间戳有效性校验',
    ifExpr: ['Photo.exif_time NOT BETWEEN Task.started_at AND Task.finished_at'],
    thenExpr: 'Photo.validity = "疑似补拍"，不计入 Task.coverage_rate 且不参与缺陷识别',
    enabled: true,
  },
  {
    id: 'grule-3',
    name: '低置信度转人工确认',
    ifExpr: ['Defect.confidence < 0.75'],
    thenExpr: 'Handoff → 人工确认（宁可多报不可漏报，不得直接丢弃）',
    enabled: true,
  },
  {
    id: 'grule-4',
    name: '设备匹配失败转人工标注',
    ifExpr: ['Photo.equipment_id IS NULL', 'AND MatchEquipment() 返回候选数 == 0'],
    thenExpr: '标记为待人工标注，不阻塞其余照片的识别流程',
    enabled: true,
  },
  {
    id: 'grule-5',
    name: '重复缺陷升级为隐患',
    ifExpr: ['same(Defect.equipment_id, Defect.catalog_code)', 'AND count(最近 3 次巡检) >= 3'],
    thenExpr: 'Defect.level 升一级并标记为设备隐患项，纳入专责趋势分析',
    enabled: true,
  },
  {
    id: 'grule-6',
    name: '定级必须引用标准条款',
    ifExpr: ['Defect.standard_clause IS NULL'],
    thenExpr: 'Guardrail 拦截，报告不得进入审核环节（省公司上报要求）',
    enabled: true,
  },
];

export const gridOntologyCandidates: OntologyCandidate[] = [
  {
    id: 'gcand-1',
    kind: 'Object',
    name: 'DefectCatalog（缺陷分类字典）',
    reason: 'PMS 字典 187 项中实际常用仅约 35 项，必须显式建模并维护"全集—常用子集"的映射，否则模型在 187 项里选会大幅掉准确率。',
    evidence: '郑海涛访谈：「一百八十多项，常用就三十来项，很多人随便选个其他」；历史缺陷记录中 22% 落在"其他"分类。',
    confidence: 0.91,
    status: 'pending',
    payload: {
      cn: '缺陷分类字典',
      description: 'PMS 缺陷编码全集及其常用子集映射，含每项对应的定级标准条款',
      source: 'PMS 生产管理系统',
    },
  },
  {
    id: 'gcand-2',
    kind: 'Object',
    name: 'MaintenanceHistory（检修履历）',
    reason: '缺陷定级与趋势分析需要知道该设备近期是否已检修，否则会把已处理缺陷重复上报。',
    evidence: '规则「重复缺陷升级为隐患」依赖历史比对；郑海涛要求按型号与投运年限做劣化趋势。',
    confidence: 0.84,
    status: 'pending',
    payload: {
      cn: '检修履历',
      description: '设备历次检修、消缺记录与处理结果',
      source: 'PMS 检修模块',
    },
  },
  {
    id: 'gcand-3',
    kind: 'Relation',
    name: 'Defect similar_to Defect',
    reason: '同义缺陷描述需要显式聚合关系才能支撑统计，当前仅靠 catalog_code 无法表达"渗油/油迹/密封不良渗漏"之间的同类关系。',
    evidence: '郑海涛访谈：同一回事有十几种写法；历史缺陷记录聚类后 4.6 万条可归并到约 1900 个语义簇。',
    confidence: 0.88,
    status: 'pending',
    payload: { from: 'gobj-defect', to: 'gobj-defect', type: 'similar_to' },
  },
  {
    id: 'gcand-4',
    kind: 'Action',
    name: 'ValidatePhotoTimestamp（时间戳核验）',
    reason: '补拍识别目前散落在校验函数内部，应提升为一等 Action 以便单独授权与追踪，避免被绕过。',
    evidence: '马国庆访谈提到补拍凑数行为；ValidatePhoto 当前把三类校验揉在一起，无法单独审计。',
    confidence: 0.76,
    status: 'pending',
  },
  {
    id: 'gcand-5',
    kind: 'Rule',
    name: '夜间/逆光照片降权规则',
    reason: '若照片拍摄时间在日落后或曝光异常，识别置信度应整体降权并优先转人工，避免低质量样本产生误判。',
    evidence: 'Run #0017 教训：夜间照片置信度普遍低于 0.6；训练集中夜间样本仅占 6%。',
    confidence: 0.72,
    status: 'pending',
  },
  {
    id: 'gcand-6',
    kind: 'Object',
    name: 'WeatherCondition（拍摄环境）',
    reason: '雨雾天气会显著影响渗油与锈蚀的视觉判别，建模后可作为置信度校正因子。',
    evidence: '识别失败样本中 31% 集中在雨天；但气象数据当前需外部接口，内网可得性未确认。',
    confidence: 0.58,
    status: 'pending',
    payload: { cn: '拍摄环境', description: '拍摄时段的天气、光照条件', source: '气象接口（可得性待确认）' },
  },
];

export const gridSolutionCanvas: SolutionField[] = [
  {
    key: 'business_problem',
    label: 'Business Problem',
    cn: '业务问题',
    value: '巡检报告整理平均 3.5 小时且滞后 2-3 天上传，30% 照片无法追溯设备，缺陷描述无法统计。',
    icon: 'problem',
  },
  {
    key: 'user',
    label: 'User',
    cn: '使用者',
    value: '巡检员（上传照片、确认低置信度缺陷）、巡检班长（危急缺陷现场复核签字）、设备专责（消费规范化缺陷数据）。',
    icon: 'user',
  },
  {
    key: 'input',
    label: 'Input',
    cn: '输入',
    value: '巡检照片及 EXIF/GPS、现场语音与文字记录、设备台账、历史缺陷记录、缺陷定级标准与运维规程。',
    icon: 'input',
  },
  {
    key: 'ai_capability',
    label: 'AI Capability',
    cn: 'AI 能力',
    value: '多模态缺陷视觉识别、照片-设备语义匹配（二维码+OCR+GPS+路线）、依据条款的规范化描述生成、报告结构化撰写。',
    icon: 'ai',
  },
  {
    key: 'knowledge',
    label: 'Knowledge',
    cn: '知识',
    value: 'RAG 检索 6 份定级标准与运维规程（按条款切分）+ 4.6 万条历史缺陷记录向量化 + PMS 常用字典 35 项映射表。',
    icon: 'knowledge',
  },
  {
    key: 'agent',
    label: 'Agent',
    cn: 'Agent 结构',
    value: 'Deterministic Workflow 编排 + 三个专家 Agent：VisionInspectionAgent（识别）、DefectGradingAgent（定级）、ReportWriterAgent（撰写）。',
    icon: 'agent',
  },
  {
    key: 'tools',
    label: 'Tools',
    cn: '工具',
    value: 'validate_photo(Function)、match_equipment(Function)、recognize_defect(MCP 视觉)、search_standard(RAG)、query_defect_history(DB)、create_defect_order(API,审批)、upload_pms(API,审批)。',
    icon: 'tool',
  },
  {
    key: 'output',
    label: 'Output',
    cn: '输出',
    value: '结构化巡检报告草稿（含缺陷清单、定级与条款引用、照片证据、设备关联）+ PMS 缺陷单 + 照片有效性核验清单。',
    icon: 'output',
  },
  {
    key: 'human_role',
    label: 'Human Role',
    cn: '人的角色',
    value: '班长对危急缺陷现场复核签字（不可省略）；巡检员确认置信度 <0.75 的识别结果；设备专责对字典映射做季度校准。',
    icon: 'human',
  },
  {
    key: 'integration',
    label: 'Integration',
    cn: '集成方式',
    value: '电力内网私有化部署，视觉模型本地 GPU 推理；台账与缺陷历史经 MCP 只读接入；PMS 通过 REST 写接口回写缺陷单与报告。',
    icon: 'integration',
  },
  {
    key: 'evaluation',
    label: 'Evaluation',
    cn: '评估方式',
    value: '200 张分层标注照片回归集测缺陷召回与准确率；20 份历史报告做人机对照，比较整理时长与描述规范化率。',
    icon: 'eval',
  },
  {
    key: 'risk',
    label: 'Risk',
    cn: '风险',
    value: '漏检危急缺陷（缓解：高召回阈值 0.75 + 强制人工确认）；夜间样本不足导致系统性误判（缓解：降权转人工）；班组抵触（缓解：只在危急环节要签字）。',
    icon: 'risk',
  },
];

export const gridArchitectureNodes: ArchNode[] = [
  { id: 'ga-user', type: 'User', label: '巡检员 / 班长', sub: 'User', x: 20, y: 210 },
  { id: 'ga-app', type: 'App', label: '巡检报告工作台', sub: 'Next.js App', x: 200, y: 210 },
  { id: 'ga-vision', type: 'Agent', label: 'VisionInspectionAgent', sub: '缺陷识别', x: 400, y: 80 },
  { id: 'ga-grade', type: 'Agent', label: 'DefectGradingAgent', sub: '缺陷定级', x: 400, y: 210 },
  { id: 'ga-writer', type: 'Agent', label: 'ReportWriterAgent', sub: '报告撰写', x: 400, y: 340 },
  { id: 'ga-vlm', type: 'LLM', label: 'Qwen2.5-VL-72B', sub: '本地 GPU 推理', x: 630, y: 30 },
  { id: 'ga-rag', type: 'RAG', label: '标准规程检索', sub: '按条款切分 · pgvector', x: 630, y: 140 },
  { id: 'ga-onto', type: 'Ontology', label: 'Ontology Service', sub: '8 Objects / 8 Relations', x: 630, y: 250 },
  { id: 'ga-approval', type: 'Human Approval', label: '班长现场复核', sub: 'HITL · 危急缺陷', x: 630, y: 360 },
  { id: 'ga-mcp', type: 'MCP', label: 'MCP Gateway', sub: 'vision / ledger / file', x: 860, y: 140 },
  { id: 'ga-db', type: 'Database', label: 'PostgreSQL', sub: '台账 / 缺陷历史', x: 860, y: 250 },
  { id: 'ga-pms', type: 'External System', label: 'PMS 生产管理系统', sub: '缺陷单 / 报告回写', x: 860, y: 360 },
];

export const gridArchitectureEdges: GraphEdge[] = [
  { id: 'gae-1', source: 'ga-user', target: 'ga-app' },
  { id: 'gae-2', source: 'ga-app', target: 'ga-vision' },
  { id: 'gae-3', source: 'ga-vision', target: 'ga-grade', label: 'handoff' },
  { id: 'gae-4', source: 'ga-grade', target: 'ga-writer', label: 'handoff' },
  { id: 'gae-5', source: 'ga-vision', target: 'ga-vlm' },
  { id: 'gae-6', source: 'ga-grade', target: 'ga-rag' },
  { id: 'gae-7', source: 'ga-vision', target: 'ga-onto' },
  { id: 'gae-8', source: 'ga-grade', target: 'ga-approval', label: '危急' },
  { id: 'gae-9', source: 'ga-rag', target: 'ga-db' },
  { id: 'gae-10', source: 'ga-onto', target: 'ga-mcp' },
  { id: 'gae-11', source: 'ga-approval', target: 'ga-pms', label: '签字后' },
  { id: 'gae-12', source: 'ga-vision', target: 'ga-mcp' },
  { id: 'gae-13', source: 'ga-writer', target: 'ga-pms', label: '报告上传' },
];

export const gridArchitectSuggestions: ArchitectSuggestion[] = [
  {
    title: 'GradeDefect 对危急级必须设为 APPROVAL_REQUIRED',
    detail:
      '对应访谈约束「危急缺陷必须班长现场复核签字」，这是去年漏报事故后的硬性制度。该动作不得配置为 ALLOW，且审批人资格需校验 Inspector.is_leader。',
    level: 'must',
  },
  {
    title: '置信度阈值应低于通信案例，建议 0.75',
    detail:
      '现场照片质量参差，且业务方明确「宁可多报不可漏报」。阈值取 0.85 会把大量真实缺陷筛掉，取 0.75 配合人工确认更符合安全底线。',
    level: 'must',
  },
  {
    title: '照片时序判断只能使用 EXIF 时间',
    detail:
      '站内 4G 信号差导致离线缓存批量上传，upload_time 完全不可信。Run #0022 已经因为用上传时间误判 23 张正常照片，这条必须写进 Guardrail。',
    level: 'must',
  },
  {
    title: '缺陷分类先做 187 → 35 项子集映射',
    detail:
      '让模型直接在 187 项字典里做选择会显著掉准确率。建议先用历史数据统计出常用子集，模型只在子集内选择，罕见项走人工。',
    level: 'recommend',
  },
  {
    title: '推荐 Workflow 编排而非自由 Multi-Agent',
    detail:
      '巡检流程本身是线性的（校验→匹配→识别→定级→报告），且每一步都有明确的合规检查点。确定性 Workflow 更容易通过安全评审，也更便于逐张照片归因。',
    level: 'recommend',
  },
  {
    title: '识别到的风险：夜间与逆光样本严重不足',
    detail:
      '训练与回归集中夜间样本仅占 6%，但实际巡检有约 15% 在光照不佳条件下完成。当前架构没有对拍摄环境做区分，存在系统性漏检风险。',
    level: 'risk',
  },
  {
    title: '运行底座增加「灵畿科研平台」作为第三选项',
    detail:
      '巡检照片与 PMS 数据不出域。学校若无 GPU 机房，优先评估中国移动灵畿科研平台：视觉模型走专线网关，控制面（Harness / 审批 / Eval）仍留在本平台。',
    level: 'recommend',
  },
  {
    title: 'VisionInspectionAgent 允许在外部 AI IDE 中实现',
    detail:
      '视觉 Agent 的后处理与 bbox 对齐用 Studio 表单表达力不够。建议用 Cursor / VS Code 实现，平台下发 AGENTS.md 与 Guardrail；识别结果仍必须经 Harness 才能定级和创建缺陷单。',
    level: 'recommend',
  },
];
