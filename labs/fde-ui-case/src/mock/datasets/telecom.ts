import { caseDetail, stages } from '../base';
import { initialExtracts, interviewScripts, personaHints, stakeholders } from '../discover';
import { criticSuggestions, problemCanvasFields } from '../define';
import {
  ontologyActions,
  ontologyCandidates,
  ontologyObjects,
  ontologyRelations,
  ontologyRules,
} from '../ontology';
import {
  architectSuggestions,
  architectureEdges,
  architectureNodes,
  solutionCanvas,
} from '../design';
import { agents } from '../agents';
import { workflowEdges, workflowNodes, workflowVersions } from '../workflow';
import { contextBlocks, memories, memoryCandidates, trimmedContent } from '../memory';
import { defaultPermissions, mcpDiscoveredTools, mcpServers, toolCallLogs, tools } from '../tools';
import {
  approvalHistory,
  historyRuns,
  liveRunSteps,
  pendingApproval,
  postApprovalSteps,
  rejectedSteps,
  runInput,
} from '../trace';
import {
  buildSteps,
  deployHistory,
  deploymentInfo,
  generatedFiles,
  resourceUsage,
  runtimeLogs,
} from '../deploy';
import {
  evalL1,
  evalL2,
  evalL3,
  evalL4,
  fdeScore,
  portfolioSections,
  teacherFeedback,
  teamComparison,
} from '../evaluation';
import type { ProjectDataset } from './schema';

export const telecomDataset: ProjectDataset = {
  project: {
    id: 'p-2024-07',
    name: '通信网络智能运维 Agent',
    industry: '通信 / 网络运维',
    caseId: 'case-001',
    caseName: '通信网络故障处理',
    accent: '#1677ff',
    team: 'MEM 第三组',
    teamMembers: [
      { name: '林知远', role: 'FDE Lead', color: '#1677ff' },
      { name: '苏未然', role: 'Business Analyst', color: '#52c41a' },
      { name: '周衡', role: 'Agent Engineer', color: '#722ed1' },
      { name: '何佳', role: 'Data / Ontology', color: '#eb2f96' },
      { name: '吴迪', role: 'Eval / QA', color: '#fa8c16' },
    ],
    teacher: '陈老师',
    mentor: '赵工（中通信网络科技）',
    currentStage: 'Build',
    deadline: '2026-09-12',
    daysLeft: 17,
    overallScore: 78,
    createdAt: '2026-08-18',
    stats: { runs: 38, successRate: 0.91, avgLatency: 14.8, totalCost: 11.8 },
  },
  stages,
  caseDetail,

  discover: { stakeholders, interviewScripts, personaHints, initialExtracts },

  define: { canvasFields: problemCanvasFields, criticSuggestions },

  ontology: {
    objects: ontologyObjects,
    relations: ontologyRelations,
    actions: ontologyActions,
    rules: ontologyRules,
    candidates: ontologyCandidates,
    acceptedRule: {
      ifExpr: ['NetworkElement.in_maintenance_window == true', 'AND Alarm.type IN expected_types'],
      thenExpr: 'SuppressAlarm()（不生成工单）',
    },
    acceptedActionTarget: 'KnowledgeArticle',
    acceptedActionEndpoint: 'rag://knowledge/search',
  },

  design: {
    solutionCanvas,
    architectureNodes,
    architectureEdges,
    suggestions: architectSuggestions,
  },

  agents,

  workflow: {
    title: '通信案例告警处理流程',
    currentVersion: 'v1.3',
    nodes: workflowNodes,
    edges: workflowEdges,
    versions: workflowVersions,
    checks: [
      { item: '所有分支均有终点', ok: true },
      { item: '高风险动作前置审批节点', ok: true },
      { item: '存在低置信度兜底路径', ok: true },
      { item: '外部接口配置了重试策略', ok: true },
      { item: '循环节点设置了最大轮次', ok: true },
      { item: '人工节点配置了超时升级', ok: false },
    ],
    warning:
      '人工审批节点当前没有超时升级配置。夜班审批平均耗时 8 分钟，建议设置 15 分钟超时后升级至运维经理，避免流程卡死。',
  },

  memory: {
    items: memories,
    candidates: memoryCandidates,
    contextBlocks,
    trimmedContent,
    runCandidates: [
      {
        id: 'mc-live-1',
        type: 'EPISODIC',
        content:
          '任务：诊断 NE-CORE-0872 光路中断。动作：correlate_alarms → query_topology → search_knowledge → 生成结论 → 审批 → 创建工单。结果：置信度 0.92，14.9 秒完成，创建 P1 工单 WO-20260826-0417。教训：拓扑前置 + 时效过滤的组合有效，可固化为标准诊断流程。',
        importance: 0.9,
        confidence: 0.93,
        reusability: 0.88,
        safety: 1.0,
        source: 'Run #run-live 自动总结',
        status: 'pending',
      },
      {
        id: 'mc-live-2',
        type: 'SEMANTIC',
        content:
          'NE-CORE-0872 为华东汇聚层核心路由器，上游唯一链路来自 OLT-HZ-0031，承载 12 条政企专线（金牌 5 条）。',
        importance: 0.82,
        confidence: 0.95,
        reusability: 0.76,
        safety: 1.0,
        source: 'Run #run-live 拓扑查询结果',
        status: 'pending',
      },
    ],
  },

  tools: {
    registry: tools,
    permissions: defaultPermissions,
    mcpServers,
    mcpDiscoveredTools,
    callLogs: toolCallLogs,
  },

  run: {
    input: runInput,
    entryAgentId: 'agt-diag',
    approvalSpanId: 'sp-11',
    approver: '张明（值班经理）',
    liveSteps: liveRunSteps,
    postApprovalSteps,
    rejectedSteps,
    pendingApproval,
    approvalHistory,
    historyRuns,
    successScore: 92,
    rejectedScore: 48,
  },

  deploy: {
    templateId: 'tpl-ops',
    generatedFiles,
    buildSteps,
    info: deploymentInfo,
    runtimeLogs,
    history: deployHistory,
    resourceUsage,
  },

  evaluation: {
    l1: evalL1,
    l2: evalL2,
    l3: evalL3,
    l4: evalL4,
    fdeScore,
    teamComparison,
    feedback: teacherFeedback,
    portfolioSections,
  },

  copilotAnswers: [
    {
      keywords: ['problem', '问题定义', '定义有什么问题', 'psf'],
      role: 'Critic',
      text: `我看了你们的 Problem Canvas，整体质量不错（PSF 86），但有三点值得再推敲：

1. 「Out of Scope」没有说明是否包含无线侧告警。运维中心的告警源里无线占 38%，这个边界不说清楚，验收时容易扯皮。
2. KPI 里缺少「审批平均耗时」。你们把高风险动作全设成人工审批是对的，但夜班审批平均要 8 分钟——这可能让端到端时长的收益被吃掉一半。
3. 「Data Availability」提到知识库 60% 过期，但没写清过滤后还剩多少可用文档。268 篇够不够覆盖主要故障类型？建议做一次覆盖度盘点。

要我帮你把这三条转成 Project Memory 的待确认条目吗？`,
    },
    {
      keywords: ['ontology', '本体', '对象', '缺少哪些'],
      role: 'Reviewer',
      text: `当前 Ontology 有 7 个 Object、6 组 Relation，覆盖了主流程。对照访谈记录，我认为还缺两块：

· MaintenanceWindow（检修窗口）——这是最要紧的。告警数据里 12% 落在检修时段，不建模就没法抑制，误报工单会一直存在。候选队列里已经有了，建议尽快确认。
· KnowledgeArticle（知识文档）——你们要求「证据可溯源」，但引用的文档现在只是 RAG 返回的字符串，不是一等对象，没法管理时效性和引用关系。

另外提醒一点：Alarm 之间的 correlated_with 关系目前只用 root_alarm_id 字段表达，这在查询"某根告警衍生了哪些告警"时会很别扭，建议显式建成关系。`,
    },
    {
      keywords: ['agent', '方案', '过度复杂', '架构'],
      role: 'Reviewer',
      text: `不算过度复杂，但有一个地方我要提醒你。

你们现在是 Triage → Diagnosis → Operations 三个 Agent 的 Handoff 链。TriageAgent 目前用的是 7B 模型，只做「抑制/记录/诊断」三分类——这个任务其实规则引擎就能做，而且更快更稳。用 LLM 反而引入了不确定性。

建议：把 TriageAgent 降级成 Workflow 里的 Condition 节点 + correlate_alarms 函数，省下来的延迟和成本都很可观（当前 1.4s / 次）。真正需要 LLM 的是 Diagnosis 这一步。

判断原则：如果一个环节的输入输出都是结构化的、规则明确的，就不要用 Agent。`,
    },
    {
      keywords: ['审批', 'approval', '人工', 'hitl'],
      role: 'Coach',
      text: `判断哪些动作要审批，我建议你们用三个问题过一遍：

1. 这个动作是否会改变外部系统状态？（create_work_order 会 → 需要审批）
2. 出错后能否自动回滚？（工单派出去人已经在路上了，回滚不了 → 需要审批）
3. 错误的代价是否可接受？（误派一次工单 = 一个工程师白跑一趟 → 代价不低）

按这个标准，你们现在的配置基本正确。但 recommend_engineer 设为 ALLOW 我觉得可以再想想——它本身不改变外部状态，ALLOW 没问题，不过它的输出直接决定了工单指派给谁，建议在审批卡片里把推荐理由一并展示，让审批人有判断依据。

另外 send_customer_notice 你们设成了 APPROVAL_REQUIRED，但本期不上线，建议直接 DENY，避免误触发。`,
    },
    {
      keywords: ['memory', '记忆', '上下文', 'context'],
      role: 'Guide',
      text: `Memory 这块你们做得比大多数组扎实，特别是把「设备变更双人确认」这条组织约束固化成 pinned 的 Project Memory，这是很成熟的做法。

两个可以改进的点：

· Session Memory 现在是全量自动写入，但里面有大量无价值的寒暄和重复追问。建议加一个最小重要性阈值（比如 0.4），低于阈值的不落库。
· Episodic Memory 的三条教训质量很高，但都还没有被「用起来」。建议在 Context Builder 里给 Episodic 单独留一个检索槽位，而不是和 Semantic 混在一起竞争 Token 预算。

顺便说，你们当前上下文 3632 tokens 里，Retrieved Knowledge 占了 1240（34%），这个比例偏高。如果 RAG 召回质量足够好，top_k 从 6 降到 4 通常不会掉准确率。`,
    },
    {
      keywords: ['部署', 'deploy', '沙箱'],
      role: 'Guide',
      text: `部署这一步在 POC 里最容易被低估。给你们三个检查项：

1. 健康检查不能只查进程活着，要查依赖：数据库、Redis、MCP Server 都得探通。你们现在的 /health 已经这么做了，很好。
2. 资源限制要写死。2 core / 4GB 对这个应用够用，但要确认 Python 沙箱的子进程也受 cgroup 约束，否则一个死循环脚本能把整个容器拖垮。
3. 部署 URL 要能被答辩现场访问。内网地址在演示时是个常见的坑，提前确认评委网络环境。`,
    },
    {
      keywords: ['评测', 'eval', '指标', 'roi'],
      role: 'Critic',
      text: `你们的 L1-L4 四层评测结构是完整的，但我要挑一个方法论上的问题。

L4 的「年化节约 82 万元」这个数字，是用 630 工时 × 单价算出来的。这里有个隐含假设：省下来的时间会被转化成其他产出，或者真的减少了人力。但运维是三班倒的排班制，你砍掉 27 分钟定位时间，值班的人还是那些人，工资照发——这笔钱实际上没有省下来。

更站得住脚的口径是：① 故障恢复提前带来的 SLA 违约赔付减少；② 错派率下降节省的差旅与工时成本（这部分是真实的）；③ 把节省的人力折算成「可承接的额外业务量」。

建议在汇报时主动说明口径与假设，评委最欣赏的是知道自己数字边界在哪里的团队。`,
    },
  ],

  copilotQuickAsks: [
    '我的 Problem 定义有什么问题？',
    '这个 Ontology 缺少哪些对象？',
    '这个 Agent 方案是否过度复杂？',
    '哪些动作应该设置人工审批？',
  ],
};
