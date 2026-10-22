import type { CanvasField } from '../define';
import type { ArchNode, SolutionField } from '../design';
import type { BuildStep } from '../deploy';
import type { RunStep } from '../trace';
import type { WfNode } from '../workflow';
import type {
  AgentDef,
  AgentRun,
  ApprovalItem,
  ContextBlock,
  ExtractItem,
  InterviewScript,
  McpServer,
  MemoryCandidate,
  MemoryItem,
  OntologyAction,
  OntologyCandidate,
  OntologyObject,
  OntologyRelation,
  OntologyRule,
  Permission,
  Stage,
  Stakeholder,
  ToolDef,
} from '../types';

export interface ProjectMeta {
  id: string;
  name: string;
  industry: string;
  caseId: string;
  caseName: string;
  accent: string;
  team: string;
  teamMembers: { name: string; role: string; color: string }[];
  teacher: string;
  mentor: string;
  currentStage: string;
  deadline: string;
  daysLeft: number;
  overallScore: number;
  createdAt: string;
  stats: { runs: number; successRate: number; avgLatency: number; totalCost: number };
}

export interface CaseBackground {
  company: string;
  industry: string;
  organization: string;
  businessModel: string;
  currentSystem: string;
  businessProcess: string;
  knownProblems: string[];
}

export interface CaseDetailData {
  id: string;
  background: CaseBackground;
  hiddenFacts: string[];
  resources: { name: string; type: string; size: string; desc: string }[];
  deliverables: string[];
  evaluation: { name: string; weight: number }[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ArchitectSuggestion {
  title: string;
  detail: string;
  level: string;
}

export interface EvalL1Item {
  name: string;
  cn: string;
  value: number;
  target: number;
  unit?: string;
  desc: string;
  lower?: boolean;
}

export interface EvalL2Item {
  name: string;
  cn: string;
  value: number;
  target: number;
  desc: string;
  lower?: boolean;
}

export interface EvalL3Item {
  name: string;
  cn: string;
  value: number;
  unit: string;
  target: number;
  lower?: boolean;
}

export interface EvalL4Item {
  name: string;
  cn: string;
  before: string;
  after: string;
  delta: string;
  positive: boolean;
  note: string;
}

export interface ProjectDataset {
  project: ProjectMeta;
  stages: Stage[];
  caseDetail: CaseDetailData;

  discover: {
    stakeholders: Stakeholder[];
    interviewScripts: Record<string, InterviewScript[]>;
    personaHints: Record<string, string[]>;
    initialExtracts: ExtractItem[];
  };

  define: {
    canvasFields: CanvasField[];
    criticSuggestions: Record<string, string>;
  };

  ontology: {
    objects: OntologyObject[];
    relations: OntologyRelation[];
    actions: OntologyAction[];
    rules: OntologyRule[];
    candidates: OntologyCandidate[];
    acceptedRule: { ifExpr: string[]; thenExpr: string };
    acceptedActionTarget: string;
    acceptedActionEndpoint: string;
  };

  design: {
    solutionCanvas: SolutionField[];
    architectureNodes: ArchNode[];
    architectureEdges: GraphEdge[];
    suggestions: ArchitectSuggestion[];
  };

  agents: AgentDef[];

  workflow: {
    title: string;
    currentVersion: string;
    nodes: WfNode[];
    edges: GraphEdge[];
    versions: { version: string; time: string; author: string; note: string; current?: boolean }[];
    checks: { item: string; ok: boolean }[];
    warning: string;
  };

  memory: {
    items: MemoryItem[];
    candidates: MemoryCandidate[];
    contextBlocks: ContextBlock[];
    trimmedContent: { name: string; reason: string; tokens: number }[];
    runCandidates: MemoryCandidate[];
  };

  tools: {
    registry: ToolDef[];
    permissions: Record<string, Record<string, Permission>>;
    mcpServers: McpServer[];
    mcpDiscoveredTools: Record<string, { name: string; desc: string; enabled: boolean }[]>;
    callLogs: { time: string; tool: string; agent: string; status: string; latency: number; permission: string }[];
  };

  run: {
    input: string;
    entryAgentId: string;
    approvalSpanId: string;
    approver: string;
    liveSteps: RunStep[];
    postApprovalSteps: RunStep[];
    rejectedSteps: RunStep[];
    pendingApproval: Omit<ApprovalItem, 'status'>;
    approvalHistory: ApprovalItem[];
    historyRuns: AgentRun[];
    successScore: number;
    rejectedScore: number;
  };

  deploy: {
    templateId: string;
    generatedFiles: { path: string; desc: string; lines: number }[];
    buildSteps: BuildStep[];
    info: {
      url: string;
      image: string;
      container: string;
      cpu: string;
      memory: string;
      disk: string;
      network: string;
      createdAt: string;
    };
    runtimeLogs: string[];
    history: { version: string; time: string; status: string; author: string; note: string }[];
    resourceUsage: { time: string; cpu: number; memory: number }[];
  };

  evaluation: {
    l1: EvalL1Item[];
    l2: EvalL2Item[];
    l3: EvalL3Item[];
    l4: EvalL4Item[];
    fdeScore: { name: string; cn: string; weight: number; score: number; comment: string }[];
    teamComparison: {
      team: string;
      score: number;
      psf: number;
      ontology: number;
      runs: number;
      deploy: boolean;
      current?: boolean;
    }[];
    feedback: { author: string; role: string; time: string; content: string; tags: string[] }[];
    portfolioSections: { key: string; title: string; content: string }[];
  };

  copilotAnswers: { keywords: string[]; role: string; text: string }[];
  copilotQuickAsks: string[];
}
