export type StageKey =
  | 'discover'
  | 'define'
  | 'model'
  | 'design'
  | 'build'
  | 'deploy'
  | 'evaluate'
  | 'evolve';

export type StageStatus = 'done' | 'active' | 'todo';

export interface Stage {
  key: StageKey;
  name: string;
  cn: string;
  status: StageStatus;
  progress: number;
  owner: string;
  route: string;
}

export type RoleKey = 'student' | 'teacher' | 'mentor' | 'admin';

export interface User {
  id: string;
  name: string;
  role: RoleKey;
  roleName: string;
  org: string;
  avatarColor: string;
  title: string;
}

export interface CourseLesson {
  title: string;
  type: '讲授' | '案例' | '练习';
  minutes: number;
}

export interface Course {
  id: string;
  title: string;
  module: string;
  hours: number;
  progress: number;
  lessons: number;
  finished: number;
  tags: string[];
  summary: string;
  stage: StageKey;
  outline?: CourseLesson[];
  labLabel?: string;
  labPath?: string;
}

export interface CaseItem {
  id: string;
  title: string;
  industry: string;
  company: string;
  difficulty: '入门' | '进阶' | '挑战';
  duration: string;
  teams: number;
  rating: number;
  cover: string;
  tags: string[];
  summary: string;
  goldenCase?: boolean;
  status: '可领取' | '进行中' | '已完成';
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  goal: string;
  painPoint: string;
  influence: number;
  interest: number;
  attitude: string;
  avatarColor: string;
}

export type ExtractType =
  | 'PainPoint'
  | 'Requirement'
  | 'Constraint'
  | 'KPI'
  | 'DataSource'
  | 'Assumption'
  | 'Conflict'
  | 'Evidence';

export type ExtractStatus = 'pending' | 'accepted' | 'rejected';

export interface ExtractItem {
  id: string;
  type: ExtractType;
  content: string;
  confidence: number;
  source: string;
  status: ExtractStatus;
}

export interface InterviewTurn {
  id: string;
  from: 'student' | 'persona';
  text: string;
  time: string;
  extracts?: string[];
}

export interface InterviewScript {
  question: string;
  answer: string;
  extracts: Omit<ExtractItem, 'status'>[];
}

export interface OntologyObject {
  id: string;
  name: string;
  cn: string;
  description: string;
  source: string;
  x: number;
  y: number;
  properties: {
    name: string;
    type: string;
    required: boolean;
    pk?: boolean;
    desc: string;
  }[];
}

export interface OntologyRelation {
  id: string;
  from: string;
  to: string;
  type: string;
  cardinality: string;
}

export interface OntologyAction {
  id: string;
  name: string;
  target: string;
  executorType: 'API' | 'MCP Tool' | 'Python Function' | 'Workflow' | 'Agent' | 'Mock';
  endpoint: string;
  risk: 'low' | 'medium' | 'high';
  desc: string;
}

export interface OntologyRule {
  id: string;
  name: string;
  ifExpr: string[];
  thenExpr: string;
  enabled: boolean;
}

export interface OntologyCandidate {
  id: string;
  kind: 'Object' | 'Relation' | 'Action' | 'Rule';
  name: string;
  reason: string;
  evidence: string;
  confidence: number;
  status: 'pending' | 'accepted' | 'rejected';
  payload?: Partial<OntologyObject> & { from?: string; to?: string; type?: string };
}

export interface AgentDef {
  id: string;
  name: string;
  cn: string;
  role: string;
  goal: string;
  instructions: string;
  model: string;
  provider: string;
  temperature: number;
  outputSchema: string;
  tools: string[];
  knowledge: string[];
  memory: string[];
  guardrails: string[];
  status: 'ready' | 'draft';
  runs: number;
  successRate: number;
  avgLatency: number;
  avgCost: number;
}

export interface ToolDef {
  id: string;
  name: string;
  cn: string;
  type: 'Function' | 'API' | 'MCP' | 'Database' | 'RAG' | 'Ontology Action' | 'Code' | 'Browser' | 'Mock';
  description: string;
  inputSchema: string;
  outputSchema: string;
  risk: 'low' | 'medium' | 'high';
  timeout: number;
  calls: number;
  server?: string;
}

export type Permission = 'ALLOW' | 'DENY' | 'APPROVAL_REQUIRED';

export interface McpServer {
  id: string;
  name: string;
  endpoint: string;
  status: 'connected' | 'disabled' | 'error';
  tools: number;
  latency: number;
  desc: string;
}

export type MemoryType = 'SESSION' | 'PROJECT' | 'SEMANTIC' | 'EPISODIC' | 'DECISION';

export interface MemoryItem {
  id: string;
  type: MemoryType;
  content: string;
  summary: string;
  source: string;
  importance: number;
  confidence: number;
  createdAt: string;
  lastUsedAt: string;
  pinned: boolean;
  agent?: string;
}

export interface MemoryCandidate {
  id: string;
  type: MemoryType;
  content: string;
  importance: number;
  confidence: number;
  reusability: number;
  safety: number;
  source: string;
  status: 'pending' | 'stored' | 'rejected';
}

export type SpanType =
  | 'context'
  | 'model'
  | 'retrieval'
  | 'tool'
  | 'handoff'
  | 'memory_read'
  | 'memory_write'
  | 'approval'
  | 'output';

export interface TraceSpan {
  id: string;
  parentId?: string;
  name: string;
  type: SpanType;
  startMs: number;
  durationMs: number;
  status: 'success' | 'error' | 'waiting';
  tokens?: { input: number; output: number };
  cost?: number;
  input: string;
  output: string;
  error?: string;
  meta?: Record<string, string | number>;
}

export interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  status:
    | 'CREATED'
    | 'RUNNING'
    | 'WAITING_TOOL'
    | 'WAITING_APPROVAL'
    | 'RETRYING'
    | 'FAILED'
    | 'COMPLETED'
    | 'CANCELLED';
  input: string;
  output: string;
  startedAt: string;
  durationMs: number;
  tokens: number;
  cost: number;
  spans: TraceSpan[];
  evalScore: number;
}

export interface ApprovalItem {
  id: string;
  runId: string;
  agent: string;
  tool: string;
  reason: string;
  parameters: Record<string, string>;
  risk: 'low' | 'medium' | 'high';
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  decidedBy?: string;
  comment?: string;
}

export interface ContextBlock {
  key: string;
  name: string;
  tokens: number;
  content: string;
  source: string;
  trimmed?: boolean;
}
