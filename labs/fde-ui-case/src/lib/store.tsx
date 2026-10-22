'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { criticChecks, DEFAULT_PROJECT_ID, getDataset, projectList, users } from '@/mock';
import type { ProjectDataset, RunStep } from '@/mock';
import type {
  ApprovalItem,
  ExtractItem,
  ExtractStatus,
  InterviewTurn,
  MemoryCandidate,
  MemoryItem,
  OntologyAction,
  OntologyCandidate,
  OntologyObject,
  OntologyRelation,
  OntologyRule,
  Permission,
  RoleKey,
  TraceSpan,
  User,
} from '@/mock';

export type DeployStatus = 'idle' | 'building' | 'running' | 'stopped';

interface LiveRun {
  id: string;
  status:
    | 'CREATED'
    | 'RUNNING'
    | 'WAITING_APPROVAL'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'FAILED';
  spans: TraceSpan[];
  logs: string[];
  startedAt: string;
  approval: ApprovalItem | null;
  score: number | null;
  elapsedMs: number;
  tokens: number;
  cost: number;
}

const emptyRun: LiveRun = {
  id: 'run-live',
  status: 'CREATED',
  spans: [],
  logs: [],
  startedAt: '',
  approval: null,
  score: null,
  elapsedMs: 0,
  tokens: 0,
  cost: 0,
};

interface ProjectState {
  extracts: ExtractItem[];
  interviewLogs: Record<string, InterviewTurn[]>;
  askedQuestions: Record<string, string[]>;
  canvas: Record<string, string>;
  psf: { score: number; checks: { key: string; pass: boolean; score: number }[] } | null;
  objects: OntologyObject[];
  relations: OntologyRelation[];
  actions: OntologyAction[];
  rules: OntologyRule[];
  candidates: OntologyCandidate[];
  permissions: Record<string, Record<string, Permission>>;
  memories: MemoryItem[];
  memoryCandidates: MemoryCandidate[];
  run: LiveRun;
  runHistoryExtra: LiveRun[];
  deployStatus: DeployStatus;
  deployStep: number;
  deployLogs: string[];
}

function seedState(ds: ProjectDataset): ProjectState {
  return {
    extracts: ds.discover.initialExtracts,
    interviewLogs: {},
    askedQuestions: {},
    canvas: Object.fromEntries(ds.define.canvasFields.map((f) => [f.key, f.value])),
    psf: null,
    objects: ds.ontology.objects,
    relations: ds.ontology.relations,
    actions: ds.ontology.actions,
    rules: ds.ontology.rules,
    candidates: ds.ontology.candidates,
    permissions: ds.tools.permissions,
    memories: ds.memory.items,
    memoryCandidates: ds.memory.candidates,
    run: emptyRun,
    runHistoryExtra: [],
    deployStatus: 'idle',
    deployStep: 0,
    deployLogs: [],
  };
}

interface StoreValue extends ProjectState {
  user: User;
  setRole: (role: RoleKey) => void;

  projectId: string;
  project: ProjectDataset['project'];
  projects: ProjectDataset['project'][];
  dataset: ProjectDataset;
  setProject: (id: string) => void;

  addExtracts: (items: ExtractItem[]) => void;
  setExtractStatus: (id: string, status: ExtractStatus) => void;
  updateExtract: (id: string, content: string) => void;

  pushTurn: (personaId: string, turn: InterviewTurn) => void;
  markAsked: (personaId: string, question: string) => void;

  setCanvasField: (key: string, value: string) => void;
  runCritic: () => void;

  decideCandidate: (id: string, accept: boolean) => void;
  toggleRule: (id: string) => void;

  setPermission: (agentId: string, toolId: string, value: Permission) => void;

  decideMemoryCandidate: (id: string, store: boolean) => void;
  togglePin: (id: string) => void;
  forgetMemory: (id: string) => void;

  startRun: () => void;
  decideApproval: (approved: boolean, comment: string) => void;
  resetRun: () => void;

  startDeploy: () => void;
  stopDeploy: () => void;

  copilotOpen: boolean;
  setCopilotOpen: (v: boolean) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(
    d.getSeconds(),
  ).padStart(2, '0')}`;
};

function projectIdFromPath(pathname: string | null): string | null {
  const m = /^\/project\/([^/]+)/.exec(pathname ?? '');
  return m ? m[1] : null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const routeProjectId = projectIdFromPath(pathname);
  const initialProjectId = getDataset(routeProjectId).project.id;

  const [user, setUser] = useState<User>(users.student);
  const [projectId, setProjectId] = useState(initialProjectId);
  const dataset = useMemo(() => getDataset(projectId), [projectId]);

  const [state, setState] = useState<ProjectState>(() => seedState(getDataset(initialProjectId)));
  const [copilotOpen, setCopilotOpen] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  const patch = useCallback((fn: (prev: ProjectState) => Partial<ProjectState>) => {
    setState((prev) => ({ ...prev, ...fn(prev) }));
  }, []);

  const setProject = useCallback(
    (id: string) => {
      setProjectId((prev) => {
        if (prev === id || !getDataset(id) || getDataset(id).project.id !== id) return prev;
        clearTimers();
        setState(seedState(getDataset(id)));
        return id;
      });
    },
    [clearTimers],
  );

  useEffect(() => {
    if (routeProjectId) setProject(routeProjectId);
  }, [routeProjectId, setProject]);

  const setRole = useCallback((role: RoleKey) => setUser(users[role]), []);

  const addExtracts = useCallback(
    (items: ExtractItem[]) => {
      patch((prev) => {
        const ids = new Set(prev.extracts.map((p) => p.id));
        return { extracts: [...prev.extracts, ...items.filter((i) => !ids.has(i.id))] };
      });
    },
    [patch],
  );

  const setExtractStatus = useCallback(
    (id: string, status: ExtractStatus) => {
      patch((prev) => ({ extracts: prev.extracts.map((e) => (e.id === id ? { ...e, status } : e)) }));
    },
    [patch],
  );

  const updateExtract = useCallback(
    (id: string, content: string) => {
      patch((prev) => ({
        extracts: prev.extracts.map((e) => (e.id === id ? { ...e, content, status: 'accepted' } : e)),
      }));
    },
    [patch],
  );

  const pushTurn = useCallback(
    (personaId: string, turn: InterviewTurn) => {
      patch((prev) => ({
        interviewLogs: { ...prev.interviewLogs, [personaId]: [...(prev.interviewLogs[personaId] ?? []), turn] },
      }));
    },
    [patch],
  );

  const markAsked = useCallback(
    (personaId: string, question: string) => {
      patch((prev) => ({
        askedQuestions: {
          ...prev.askedQuestions,
          [personaId]: [...(prev.askedQuestions[personaId] ?? []), question],
        },
      }));
    },
    [patch],
  );

  const setCanvasField = useCallback(
    (key: string, value: string) => {
      patch((prev) => ({ canvas: { ...prev.canvas, [key]: value }, psf: null }));
    },
    [patch],
  );

  const runCritic = useCallback(() => {
    const fieldMap = new Map(dataset.define.canvasFields.map((f) => [f.key, f]));
    patch((prev) => {
      let total = 0;
      const checks = criticChecks.map((c) => {
        const scores = c.relatedFields.map((fk) => {
          const field = fieldMap.get(fk);
          const val = (prev.canvas[fk] ?? '').trim();
          if (!field || !val) return 0;
          return Math.min(1, val.length / field.minLength);
        });
        const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
        const score = Math.round(avg * 12.5);
        total += score;
        return { key: c.key, pass: avg >= 0.85, score };
      });
      return { psf: { score: Math.min(100, total), checks } };
    });
  }, [dataset, patch]);

  const decideCandidate = useCallback(
    (id: string, accept: boolean) => {
      patch((prev) => {
        const target = prev.candidates.find((c) => c.id === id);
        const next: Partial<ProjectState> = {
          candidates: prev.candidates.map((c) =>
            c.id === id ? { ...c, status: accept ? 'accepted' : 'rejected' } : c,
          ),
        };
        if (!target || !accept) return next;

        if (target.kind === 'Object') {
          next.objects = [
            ...prev.objects,
            {
              id: `obj-${id}`,
              name: target.name.split('（')[0],
              cn: target.payload?.cn ?? '',
              description: target.payload?.description ?? target.reason,
              source: target.payload?.source ?? 'AI Copilot',
              x: 700 + Math.random() * 40,
              y: 640 + prev.objects.length * 8,
              properties: [
                { name: 'id', type: 'string', required: true, pk: true, desc: '唯一标识' },
                { name: 'name', type: 'string', required: true, desc: '名称' },
              ],
            },
          ];
        } else if (target.kind === 'Relation' && target.payload?.from && target.payload?.to) {
          next.relations = [
            ...prev.relations,
            {
              id: `rel-${id}`,
              from: target.payload.from,
              to: target.payload.to,
              type: target.payload.type ?? 'related_to',
              cardinality: 'N:M',
            },
          ];
        } else if (target.kind === 'Action') {
          next.actions = [
            ...prev.actions,
            {
              id: `act-${id}`,
              name: target.name.split('（')[0],
              target: dataset.ontology.acceptedActionTarget,
              executorType: 'MCP Tool',
              endpoint: dataset.ontology.acceptedActionEndpoint,
              risk: 'low',
              desc: target.reason,
            },
          ];
        } else if (target.kind === 'Rule') {
          next.rules = [
            ...prev.rules,
            {
              id: `rule-${id}`,
              name: target.name,
              ifExpr: dataset.ontology.acceptedRule.ifExpr,
              thenExpr: dataset.ontology.acceptedRule.thenExpr,
              enabled: true,
            },
          ];
        }
        return next;
      });
    },
    [dataset, patch],
  );

  const toggleRule = useCallback(
    (id: string) => {
      patch((prev) => ({ rules: prev.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) }));
    },
    [patch],
  );

  const setPermission = useCallback(
    (agentId: string, toolId: string, value: Permission) => {
      patch((prev) => ({
        permissions: { ...prev.permissions, [agentId]: { ...prev.permissions[agentId], [toolId]: value } },
      }));
    },
    [patch],
  );

  const decideMemoryCandidate = useCallback(
    (id: string, store: boolean) => {
      patch((prev) => {
        const target = prev.memoryCandidates.find((c) => c.id === id);
        const next: Partial<ProjectState> = {
          memoryCandidates: prev.memoryCandidates.map((c) =>
            c.id === id ? { ...c, status: store ? 'stored' : 'rejected' } : c,
          ),
        };
        if (target && store) {
          next.memories = [
            {
              id: `mem-${id}`,
              type: target.type,
              content: target.content,
              summary: target.content.slice(0, 28) + '…',
              source: target.source,
              importance: target.importance,
              confidence: target.confidence,
              createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              lastUsedAt: '—',
              pinned: false,
            },
            ...prev.memories,
          ];
        }
        return next;
      });
    },
    [patch],
  );

  const togglePin = useCallback(
    (id: string) => {
      patch((prev) => ({ memories: prev.memories.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)) }));
    },
    [patch],
  );

  const forgetMemory = useCallback(
    (id: string) => {
      patch((prev) => ({ memories: prev.memories.filter((m) => m.id !== id) }));
    },
    [patch],
  );

  const playSteps = useCallback(
    (steps: RunStep[], approval: Omit<ApprovalItem, 'status'>, onDone?: () => void) => {
      let acc = 0;
      steps.forEach((step) => {
        acc += step.delay;
        const t = setTimeout(() => {
          patch((prev) => {
            const spans = [...prev.run.spans.filter((s) => s.id !== step.span.id), step.span];
            const tokens = spans.reduce((sum, s) => sum + (s.tokens ? s.tokens.input + s.tokens.output : 0), 0);
            const cost = spans.reduce((sum, s) => sum + (s.cost ?? 0), 0);
            const elapsed = spans.reduce((max, s) => Math.max(max, s.startMs + s.durationMs), 0);
            return {
              run: {
                ...prev.run,
                spans,
                logs: [...prev.run.logs, `${nowTime()} ${step.log}`],
                tokens,
                cost: Number(cost.toFixed(3)),
                elapsedMs: elapsed,
                status: step.pauseForApproval ? 'WAITING_APPROVAL' : prev.run.status,
                approval: step.pauseForApproval ? { ...approval, status: 'pending' as const } : prev.run.approval,
              },
            };
          });
        }, acc);
        timers.current.push(t);
      });
      if (onDone) {
        const t = setTimeout(onDone, acc + 400);
        timers.current.push(t);
      }
    },
    [patch],
  );

  const startRun = useCallback(() => {
    clearTimers();
    patch(() => ({
      run: {
        ...emptyRun,
        status: 'RUNNING',
        startedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        logs: [`${nowTime()} [Harness] Run 已创建，状态 CREATED → RUNNING`],
      },
    }));
    playSteps(dataset.run.liveSteps, dataset.run.pendingApproval);
  }, [clearTimers, dataset, patch, playSteps]);

  const decideApproval = useCallback(
    (approved: boolean, comment: string) => {
      const { approvalSpanId, approver } = dataset.run;
      patch((prev) => ({
        run: {
          ...prev.run,
          status: 'RUNNING',
          approval: prev.run.approval
            ? {
                ...prev.run.approval,
                status: approved ? 'approved' : 'rejected',
                decidedBy: approver,
                comment,
              }
            : null,
          logs: [
            ...prev.run.logs,
            `${nowTime()} [Approval] ${approved ? '已批准' : '已拒绝'}${comment ? ` · ${comment}` : ''}`,
          ],
          spans: prev.run.spans.map((s) =>
            s.id === approvalSpanId
              ? {
                  ...s,
                  status: approved ? 'success' : 'error',
                  durationMs: 37000,
                  output:
                    (approved ? '审批通过 · ' : '审批拒绝 · ') + approver + (comment ? ` · ${comment}` : ''),
                }
              : s,
          ),
        },
      }));

      const steps = approved ? dataset.run.postApprovalSteps : dataset.run.rejectedSteps;
      playSteps(steps, dataset.run.pendingApproval, () => {
        patch((prev) => {
          const finished: LiveRun = {
            ...prev.run,
            status: approved ? 'COMPLETED' : 'CANCELLED',
            score: approved ? dataset.run.successScore : dataset.run.rejectedScore,
          };
          const next: Partial<ProjectState> = {
            run: finished,
            runHistoryExtra: [finished, ...prev.runHistoryExtra],
          };
          if (approved) {
            const existing = new Set(prev.memoryCandidates.map((c) => c.id));
            next.memoryCandidates = [
              ...dataset.memory.runCandidates.filter((c) => !existing.has(c.id)),
              ...prev.memoryCandidates,
            ];
          }
          return next;
        });
      });
    },
    [dataset, patch, playSteps],
  );

  const resetRun = useCallback(() => {
    clearTimers();
    patch(() => ({ run: emptyRun }));
  }, [clearTimers, patch]);

  const startDeploy = useCallback(() => {
    clearTimers();
    patch(() => ({ deployStatus: 'building', deployStep: 0, deployLogs: [] }));
    const steps = dataset.deploy.buildSteps;
    let acc = 0;
    steps.forEach((step, idx) => {
      step.logs.forEach((line, li) => {
        const t = setTimeout(
          () => patch((prev) => ({ deployLogs: [...prev.deployLogs, line] })),
          acc + (li + 1) * (step.duration / (step.logs.length + 1)),
        );
        timers.current.push(t);
      });
      acc += step.duration;
      const t = setTimeout(() => {
        patch(() => ({
          deployStep: idx + 1,
          ...(idx === steps.length - 1 ? { deployStatus: 'running' as DeployStatus } : {}),
        }));
      }, acc);
      timers.current.push(t);
    });
  }, [clearTimers, dataset, patch]);

  const stopDeploy = useCallback(() => {
    clearTimers();
    patch(() => ({ deployStatus: 'stopped' }));
  }, [clearTimers, patch]);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      user,
      setRole,
      projectId,
      project: dataset.project,
      projects: projectList,
      dataset,
      setProject,
      addExtracts,
      setExtractStatus,
      updateExtract,
      pushTurn,
      markAsked,
      setCanvasField,
      runCritic,
      decideCandidate,
      toggleRule,
      setPermission,
      decideMemoryCandidate,
      togglePin,
      forgetMemory,
      startRun,
      decideApproval,
      resetRun,
      startDeploy,
      stopDeploy,
      copilotOpen,
      setCopilotOpen,
    }),
    [
      state,
      user,
      setRole,
      projectId,
      dataset,
      setProject,
      addExtracts,
      setExtractStatus,
      updateExtract,
      pushTurn,
      markAsked,
      setCanvasField,
      runCritic,
      decideCandidate,
      toggleRule,
      setPermission,
      decideMemoryCandidate,
      togglePin,
      forgetMemory,
      startRun,
      decideApproval,
      resetRun,
      startDeploy,
      stopDeploy,
      copilotOpen,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
