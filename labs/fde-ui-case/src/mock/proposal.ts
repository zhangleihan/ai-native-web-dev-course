/** 一期项目预算书数据（教育信息化 / 产学研试点口径，万元，不含税） */

export const proposalMeta = {
  title: 'AI-FDE 工程管理实训平台一期建设',
  subtitle: '面向工程管理人才培养的「业务问题到 AI 系统交付」一体化工作环境',
  docNo: 'AIFDE-P1-2026',
  org: '工程管理学院（申报单位）',
  partner: '中国移动灵畿科研平台 / 国产大模型服务商（备选）',
  period: '2026 年 9 月 — 2027 年 7 月',
  durationNote: '软件开发 5 个月，试运行与试点教学 6 个月，合计 11 个月',
  scale: '50 名学生试点，4～6 人/团队',
  cases: '通信网络故障处理、电网设备巡检报告自动化',
  recommended: 'A' as 'A' | 'B',
  currency: '人民币万元（不含税）',
};

export const proposalGoals = [
  {
    no: 'G1',
    name: '平台可上课',
    metric: '学生团队可在 2～8 小时内跑通 Discover→Eval 闭环，并获得可访问的沙箱 URL',
  },
  {
    no: 'G2',
    name: '受控执行',
    metric: '高风险工具 100% 经人工审批；全部 Run 具备 Trace（Who/When/Tool/Token/Cost）',
  },
  {
    no: 'G3',
    name: '行业案例',
    metric: '交付 2 个 Golden Case（通信、电网），含访谈脚本、Ontology、Agent、评测集',
  },
  {
    no: 'G4',
    name: '知识与实现开放',
    metric: 'RAG 知识库可挂载；Agent 可在云 AI-IDE 或外部 IDE 实现，运行必须走 Harness',
  },
];

export const proposalScope = [
  {
    module: '教学控制面',
    do: '登录与角色、课程、案例库、FDE 8D 项目工作区',
    dont: '全校统一身份深度对接、学分系统',
  },
  {
    module: 'Agent / Harness',
    do: 'Studio、权限矩阵、人工审批、Trace、评测回写',
    dont: '完全自治 Multi-Agent、生产级多租户隔离',
  },
  {
    module: '知识与实现',
    do: 'RAG（pgvector）、云 AI-IDE 精简版、外部 IDE 脚手架',
    dont: '完整多人协同云 IDE、Skill 市场',
  },
  {
    module: '运行与交付',
    do: 'Docker 沙箱、可访问 URL、L1–L4 基础评测',
    dont: 'K8s 大规模调度、A100/H100 训练集群',
  },
  {
    module: '示范案例',
    do: '通信故障处理、电网巡检报告自动化',
    dont: '制造、供应链等其余案例深化',
  },
];

export const laborItems = [
  { name: '项目管理', months: 2.5, rate: 4.2, amount: 10.5, subject: '软件开发费' },
  { name: '产品 / FDE 顾问', months: 2.0, rate: 4.5, amount: 9.0, subject: '专家咨询费' },
  { name: '前端（工作区 / 课程 / Studio / 评测）', months: 7.5, rate: 3.5, amount: 26.3, subject: '软件开发费' },
  { name: '后端控制面（账号、案例、项目、Git）', months: 10.0, rate: 4.0, amount: 40.0, subject: '软件开发费' },
  { name: 'Harness / Agent 运行底座', months: 7.5, rate: 4.8, amount: 36.0, subject: '软件开发费' },
  { name: 'RAG 知识库', months: 3.0, rate: 4.5, amount: 13.5, subject: '软件开发费' },
  { name: '云 AI-IDE 精简版', months: 2.5, rate: 4.0, amount: 10.0, subject: '软件开发费' },
  { name: '案例内容（通信 + 电网）', months: 3.0, rate: 3.0, amount: 9.0, subject: '软件开发费' },
  { name: '测试', months: 2.5, rate: 2.2, amount: 5.5, subject: '软件开发费' },
  { name: '实施与运维', months: 2.0, rate: 3.0, amount: 6.0, subject: '软件开发费' },
  { name: 'UI 设计', months: 1.5, rate: 2.8, amount: 4.2, subject: '软件开发费' },
];

export const laborSubtotal = 170;
export const laborReserve = 17;
export const laborTotal = 187;

export const schemeA = {
  id: 'A',
  name: '方案甲',
  title: '中国移动灵畿科研平台为运行底座',
  laborExtra: 6.8,
  extraMonths: 1.5,
  laborTotal: 194,
  infraMid: 13.5,
  totalMid: 208,
  totalLow: 192,
  totalHigh: 232,
  summary: '不采购 GPU、不新建机房。模型与智算走灵畿；账号、案例、Harness、评测仍由本校控制面管理。',
  infra: [
    { name: '控制面云资源（ECS×2、RDS+pgvector、Redis、OSS、SLB）', low: 4.0, mid: 5.5, high: 7.5, subject: '云服务费', note: '试运行 6 个月，按量' },
    { name: '专线 / VPN / 教育网对接', low: 1.0, mid: 3.0, high: 8.0, subject: '网络与专线费', note: '视机房条件' },
    { name: '灵畿算力与模型额度', low: 0, mid: 5.0, high: 15.0, subject: '智算与模型费', note: '合作赠送取低；无额度按量取高' },
    { name: 'GPU 服务器 / 机房配套', low: 0, mid: 0, high: 0, subject: '设备费', note: '一期不列支' },
  ],
};

export const schemeB = {
  id: 'B',
  name: '方案乙',
  title: '第三方大模型 API + 必要本地云与 GPU',
  laborExtra: 4.5,
  extraMonths: 1.0,
  laborTotal: 192,
  infraMid: 20.7,
  totalMid: 213,
  totalLow: 198,
  totalHigh: 239,
  summary: '推理以国产 API 为主，少量高质量模型作对照；租 1 张云 GPU，本地 4090 为可选项，覆盖 Embedding、断网演示与视觉识别。',
  infra: [
    { name: '控制面云资源', low: 4.0, mid: 5.5, high: 7.5, subject: '云服务费', note: '与方案甲同规格' },
    { name: '学生沙箱 ECS（16C32G）', low: 1.2, mid: 1.8, high: 2.5, subject: '云服务费', note: 'Docker 沙箱 6 个月' },
    { name: '云 GPU A10 ×1（租 6 个月）', low: 1.8, mid: 2.4, high: 3.6, subject: '智算与模型费', note: '约 3–4 千元/月' },
    { name: '本地 RTX 4090 一台', low: 0, mid: 4.5, high: 12.0, subject: '设备费', note: '低=不买；中=工作站；高=1U 推理机' },
    { name: '第三方模型 API', low: 3.0, mid: 5.0, high: 12.0, subject: '智算与模型费', note: '国产为主；高档含对照模型' },
    { name: '带宽 / 防火墙 / 证书', low: 0.8, mid: 1.5, high: 2.5, subject: '网络与专线费', note: '' },
  ],
};

export type SchemeKey = 'A' | 'B';

export function schemeSubjects(scheme: typeof schemeA | typeof schemeB) {
  const expert = 9.0;
  const reserve = laborReserve;
  const device = scheme.infra.filter((i) => i.subject === '设备费').reduce((s, i) => s + i.mid, 0);
  const cloud = scheme.infra.filter((i) => i.subject === '云服务费').reduce((s, i) => s + i.mid, 0);
  const compute = scheme.infra.filter((i) => i.subject === '智算与模型费').reduce((s, i) => s + i.mid, 0);
  const network = scheme.infra.filter((i) => i.subject === '网络与专线费').reduce((s, i) => s + i.mid, 0);
  const rows = [
    {
      subject: '一、软件开发费（委托业务费）',
      amount: Number((scheme.laborTotal - expert - reserve).toFixed(1)),
      note: '平台研发、Harness、RAG、云 IDE、案例、测试、实施及底座适配',
    },
    { subject: '二、专家咨询费', amount: expert, note: 'FDE 方法与行业案例顾问' },
    { subject: '三、设备费', amount: Number(device.toFixed(1)), note: scheme.id === 'A' ? '一期不采购 GPU' : '可选本地 RTX 4090 工作站' },
    { subject: '四、云服务费', amount: Number(cloud.toFixed(1)), note: '控制面与学生沙箱，试运行 6 个月' },
    {
      subject: '五、智算与模型费',
      amount: Number(compute.toFixed(1)),
      note: scheme.id === 'A' ? '灵畿算力与模型额度（合作或按量）' : '云 GPU 租赁 + 第三方大模型 API',
    },
    { subject: '六、网络与专线费', amount: Number(network.toFixed(1)), note: scheme.id === 'A' ? '专线 / VPN / 教育网对接' : '公网带宽、防火墙与证书' },
    { subject: '七、预备费', amount: reserve, note: '按共用开发成本 10% 计提，覆盖需求变更与联调风险' },
  ];
  const gap = Number((scheme.totalMid - rows.reduce((s, r) => s + r.amount, 0)).toFixed(1));
  if (gap !== 0) rows[0].amount = Number((rows[0].amount + gap).toFixed(1));
  return rows;
}

export const milestones = [
  { time: '2026-09', title: '立项与方案冻结', desc: '确定底座（甲/乙）、签署合作或云账号、组建联合开发组' },
  { time: '2026-10', title: '控制面可登录', desc: '账号角色、课程案例、项目工作区骨架联调' },
  { time: '2026-11', title: 'Harness 闭环', desc: 'Agent Run、权限、审批、Trace 在通信案例跑通' },
  { time: '2026-12', title: 'RAG 与云 IDE', desc: '知识库挂载、云 AI-IDE 精简版、外部 IDE 脚手架' },
  { time: '2027-01', title: '双案例验收', desc: '电网案例接入；沙箱部署与 L1–L4 评测可用' },
  { time: '2027-02', title: '试点开课', desc: '50 人小班试运行，收集 Trace 与教学反馈' },
  { time: '2027-07', title: '一期结题', desc: '试点报告、经费决算、二期建设建议' },
];

export const outcomes = [
  { name: '软件系统 1 套', desc: 'AI-FDE Lab 一期可部署版本（含教学控制面与 Harness）' },
  { name: 'Golden Case 2 个', desc: '通信网络故障处理、电网设备巡检报告自动化' },
  { name: '课程标准 1 套', desc: '含 RAG 知识库、AI Coding 在内的 Build 模块课纲与实验指导' },
  { name: '试点报告 1 份', desc: '50 人试运行数据、评测结果、成本与合规结论' },
  { name: '接口规范 1 份', desc: 'Model Router / Harness Adapter，支持灵畿与第三方 API 切换' },
];

export const risks = [
  {
    risk: '灵畿合作额度或周期不确定',
    level: '高',
    mitigation: '控制面与 Adapter 解耦；3 个月内未锁定额度则切换方案乙，不返工平台代码',
  },
  {
    risk: '行业数据经公有云 API 出域',
    level: '高',
    mitigation: '通信/电网案例默认内网或灵畿专线；方案乙视觉识别走本地 GPU',
  },
  {
    risk: '工期压缩导致只能演示不能上课',
    level: '中',
    mitigation: '考核以「50 人可上课」为准；3 个月只承诺可演示，不减人月只减范围',
  },
  {
    risk: '视觉模型费用超预算',
    level: '中',
    mitigation: '一期不将境外 VL 作主力；电网案例限流并预留 4090/A10',
  },
];

export const exclusions = [
  '增值税及软件外包税费（通常另计 6%–13%）',
  '学校现有机房改造、UPS、精密空调',
  '二期 Milvus、K8s、A100/H100、Skill 市场及其余行业案例',
  '商业 IDE 席位（Cursor 等由教学方自行采购）',
];
