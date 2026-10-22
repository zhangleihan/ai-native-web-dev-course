'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Space, Tag } from 'antd';
import {
  BugOutlined,
  CaretRightFilled,
  CloudOutlined,
  FileOutlined,
  FolderOpenOutlined,
  MessageOutlined,
  RobotOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { AgentDef } from '@/mock';

interface CloudFile {
  path: string;
  language: string;
  content: string;
}

function buildFiles(agent: AgentDef, projectId: string): CloudFile[] {
  const moduleName = agent.name.replace(/Agent$/, '').toLowerCase() || 'agent';
  return [
    {
      path: 'AGENTS.md',
      language: 'markdown',
      content: `# ${agent.name}

> 本文件由 Agent Studio 规格生成，供云 AI-IDE / Cursor 读取。运行必须走 Harness。

## Role
${agent.role}

## Goal
${agent.goal}

## Guardrails
${agent.guardrails.map((g) => `- ${g}`).join('\n')}

## Tools
${agent.tools.map((t) => `- \`${t}\`（经 MCP Gateway，禁止直连）`).join('\n')}

## Output Schema
\`\`\`json
${agent.outputSchema}
\`\`\`
`,
    },
    {
      path: 'harness.config.yaml',
      language: 'yaml',
      content: `project: ${projectId}
agent_id: ${agent.id}
entry: src/agents/${moduleName}.py
runtime: harness
model:
  router: capability-based
  fallback: true
policy:
  direct_model_call: deny
  tool_permission: from_studio
  approval_required_tools:
    - create_work_order
    - create_defect_order
    - upload_to_pms
eval:
  on_complete: true
  suite: regression-50
`,
    },
    {
      path: `src/agents/${moduleName}.py`,
      language: 'python',
      content: `from fde_harness import Agent, mcp, GuardrailError

# 规格来自 Studio，实现写在这里。不要 import openai / anthropic。
agent = Agent.load("${agent.id}")
agent.bind_tools(mcp.gateway("${projectId}"))


async def handle(event: dict) -> dict:
    """${agent.goal}"""
    ctx = await agent.context.build(event)

    # TODO: 按 AGENTS.md 补全检索 / 推理
    result = await agent.run(ctx)

    for rule in agent.guardrails:
        if not result.satisfies(rule):
            raise GuardrailError(rule)

    return result.to_dict()
`,
    },
    {
      path: 'src/harness_client.py',
      language: 'python',
      content: `"""Harness SDK 客户端。云 AI-IDE 内的 Run 按钮调用此入口。"""

from fde_harness import Harness

harness = Harness.from_env()


def run_agent(agent_id: str, payload: dict):
    session = harness.session(agent_id)
    return session.run(
        payload,
        stream=True,
        on_approval=harness.pause,
        on_span=harness.trace.append,
    )
`,
    },
    {
      path: 'tests/test_guardrail.py',
      language: 'python',
      content: `def test_no_direct_model_import():
    src = open("src/agents/${moduleName}.py").read()
    assert "import openai" not in src
    assert "anthropic" not in src


def test_tools_go_through_mcp():
    src = open("src/agents/${moduleName}.py").read()
    assert "mcp.gateway" in src
`,
    },
    {
      path: '.fde/rules.md',
      language: 'markdown',
      content: `# Cloud AI-IDE 规则

1. 补全代码时必须使用 \`fde_harness.Agent.run\`。
2. 禁止建议用户把 API Key 写入源码或 Prompt。
3. 高风险工具保持 APPROVAL_REQUIRED。
4. 保存后可在 IDE 内点「Harness Run」，Trace 回写平台。
`,
    },
  ];
}

const chatReplies: { keys: string[]; text: string }[] = [
  {
    keys: ['审批', 'approval', '工单', '高风险'],
    text: `高风险工具不能在 IDE 里直接调用。正确写法：

\`\`\`python
order = await agent.tools.create_work_order.draft(...)
await agent.harness.request_approval(order)  # 暂停 Run，等值班经理
\`\`\`

我会帮你在 \`${'{file}'}\` 里补上这段，并加一条 Guardrail 测试。`,
  },
  {
    keys: ['测试', 'test', 'guardrail'],
    text: `已根据 AGENTS.md 的 Guardrail 草拟 tests/test_guardrail.py：
1. 禁止 import openai / anthropic
2. 必须 bind_tools(mcp.gateway)
3. 输出必须含 evidence / standard_clause（按案例）

点编辑器里的 test_guardrail.py 即可查看。终端可跑 \`pytest tests/\`。`,
  },
  {
    keys: ['直连', 'openai', '模型'],
    text: `不要在云 IDE 里写 \`openai.ChatCompletion\`。Model Router（自建 / 公有云 / 灵畿）由 Harness 注入。

你只需要 \`await agent.run(ctx)\`。这样评测、成本、审批才能记到 Trace。`,
  },
  {
    keys: ['补全', '实现', 'todo', 'handle'],
    text: `我按 AGENTS.md 补了 handle() 的检索步骤：先 context.build → 调知识库 → 再 agent.run。置信度不足时设 need_human_review=True，不要自行派单。

保存后点右上角「Harness Run」走平台受控执行。`,
  },
];

const fallbackReply = `我是绑定 Harness 的云 IDE Copilot，只能改实现、不能改运行入口。

可以问我：
· 按 Guardrail 补全 handle()
· 给高风险工具加审批
· 生成 test_guardrail.py
· 为什么不能直连模型`;

export default function CloudIde({
  agent,
  projectId,
  projectName,
  variant = 'cloud',
  onRun,
}: {
  agent: AgentDef;
  projectId: string;
  projectName: string;
  variant?: 'cloud' | 'lingji';
  onRun: () => void;
}) {
  const files = useMemo(() => buildFiles(agent, projectId), [agent, projectId]);
  const [activePath, setActivePath] = useState(files[2]?.path ?? files[0].path);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [chat, setChat] = useState<{ from: 'me' | 'ai'; text: string }[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [termLines, setTermLines] = useState<string[]>([
    `FDE Cloud AI-IDE  ·  ${projectId}`,
    'Harness SDK connected. Direct model calls are blocked.',
    '$',
  ]);
  const [dirty, setDirty] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContents(Object.fromEntries(files.map((f) => [f.path, f.content])));
    setActivePath(files[2]?.path ?? files[0].path);
    setDirty(false);
    setChat([]);
  }, [files]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat, typing]);

  const file = files.find((f) => f.path === activePath) ?? files[0];
  const accent = variant === 'lingji' ? '#722ed1' : '#1677ff';
  const brand = variant === 'lingji' ? '灵畿云研发空间' : 'FDE Cloud AI-IDE';

  const folders = useMemo(() => {
    const tree: { folder: string; items: CloudFile[] }[] = [];
    const map = new Map<string, CloudFile[]>();
    files.forEach((f) => {
      const i = f.path.lastIndexOf('/');
      const folder = i === -1 ? '/' : f.path.slice(0, i);
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder)!.push(f);
    });
    map.forEach((items, folder) => tree.push({ folder, items }));
    return tree;
  }, [files]);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    setChat((p) => [...p, { from: 'me', text }]);
    setDraft('');
    setTyping(true);
    const lower = text.toLowerCase();
    const hit = chatReplies.find((r) => r.keys.some((k) => lower.includes(k)));
    const reply = (hit ? hit.text : fallbackReply).replace('{file}', activePath);
    setTimeout(() => {
      setChat((p) => [...p, { from: 'ai', text: reply }]);
      setTyping(false);
    }, 700);
  };

  const runTerm = (cmd: string) => {
    if (cmd === 'pytest') {
      setTermLines((p) => [
        ...p.slice(0, -1),
        '$ pytest tests/test_guardrail.py -q',
        'tests/test_guardrail.py ..                                 [100%]',
        '2 passed in 0.18s',
        '$',
      ]);
    } else {
      setTermLines((p) => [
        ...p.slice(0, -1),
        `$ fde run --agent ${agent.id}`,
        '[Harness] CREATED → RUNNING  (cloud-ide session)',
        '[Harness] context.build ok · guardrails injected',
        '[Policy] direct_model_call=deny · tools via MCP',
        '→ 转到平台 Run Console / Trace',
        '$',
      ]);
      onRun();
    }
  };

  return (
    <div
      style={{
        border: '1px solid #1b2436',
        borderRadius: 10,
        overflow: 'hidden',
        background: '#0e1525',
        color: '#d6deeb',
        minHeight: 720,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          background: '#121a2c',
          borderBottom: '1px solid #243049',
        }}
      >
        <Space size={8}>
          <CloudOutlined style={{ color: accent }} />
          <span style={{ fontSize: 12.5, fontWeight: 620 }}>{brand}</span>
          <Tag style={{ margin: 0, fontSize: 10, background: '#1c2740', color: '#9db4d8', border: 'none' }}>
            {projectName}
          </Tag>
          <span style={{ fontSize: 11, color: '#7f8da8' }} className="fde-mono">
            {agent.name}
          </span>
        </Space>
        <Space size={8}>
          <Button
            size="small"
            onClick={() => {
              setDirty(false);
            }}
            disabled={!dirty}
          >
            保存
          </Button>
          <Button size="small" icon={<BugOutlined />} onClick={() => runTerm('pytest')}>
            运行测试
          </Button>
          <Button size="small" type="primary" icon={<CaretRightFilled />} onClick={() => runTerm('run')}>
            Harness Run
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ width: 200, borderRight: '1px solid #243049', background: '#101827', padding: '10px 0', overflow: 'auto' }}>
          <div style={{ fontSize: 10, letterSpacing: 0.6, color: '#6d7c96', padding: '0 12px 8px' }}>EXPLORER</div>
          {folders.map((g) => (
            <div key={g.folder} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#8ea0bd', padding: '2px 12px' }}>
                <FolderOpenOutlined style={{ marginRight: 6 }} />
                {g.folder === '/' ? projectId : g.folder}
              </div>
              {g.items.map((f) => {
                const name = f.path.split('/').pop()!;
                const on = f.path === activePath;
                return (
                  <div
                    key={f.path}
                    onClick={() => setActivePath(f.path)}
                    style={{
                      padding: '4px 12px 4px 28px',
                      fontSize: 12,
                      cursor: 'pointer',
                      background: on ? '#1b2a48' : 'transparent',
                      color: on ? '#fff' : '#c5d0e3',
                    }}
                  >
                    <FileOutlined style={{ marginRight: 6, color: on ? accent : '#6d7c96' }} />
                    {name}
                    {dirty && on ? ' ·' : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', background: '#0b1220', borderBottom: '1px solid #243049' }}>
            {files.slice(0, 4).map((f) => {
              const on = f.path === activePath;
              return (
                <div
                  key={f.path}
                  onClick={() => setActivePath(f.path)}
                  style={{
                    padding: '7px 12px',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    background: on ? '#0e1525' : 'transparent',
                    borderRight: '1px solid #243049',
                    color: on ? '#fff' : '#7f8da8',
                  }}
                  className="fde-mono"
                >
                  {f.path.split('/').pop()}
                </div>
              );
            })}
          </div>
          <div style={{ padding: '8px 14px', fontSize: 11, color: '#6d7c96', borderBottom: '1px solid #1b2436' }}>
            {file.path}
            <Tag style={{ marginLeft: 8, fontSize: 10, background: '#1c2740', color: '#9db4d8', border: 'none' }}>
              {file.language}
            </Tag>
            {dirty && (
              <Tag color="gold" style={{ marginLeft: 6, fontSize: 10 }}>
                未保存
              </Tag>
            )}
          </div>
          <Input.TextArea
            className="fde-ide-editor"
            value={contents[activePath] ?? ''}
            onChange={(e) => {
              setContents((p) => ({ ...p, [activePath]: e.target.value }));
              setDirty(true);
            }}
            style={{
              flex: 1,
              background: '#0e1525',
              color: '#d6deeb',
              border: 'none',
              borderRadius: 0,
              fontFamily: "'SF Mono', Menlo, Consolas, monospace",
              fontSize: 12.5,
              lineHeight: 1.7,
              resize: 'none',
              padding: 14,
            }}
          />
          <div style={{ height: 150, borderTop: '1px solid #243049', background: '#0b1220', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '4px 12px', fontSize: 10, color: '#6d7c96', letterSpacing: 0.6 }}>
              TERMINAL · bash
            </div>
            <div className="fde-terminal" style={{ flex: 1, borderRadius: 0, padding: '4px 14px 10px', background: 'transparent' }}>
              {termLines.map((l, i) => (
                <div key={i} style={{ color: l.startsWith('$') ? '#9fe8b5' : '#c5d0e3' }}>
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            width: 280,
            borderLeft: '1px solid #243049',
            background: '#101827',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #243049', fontSize: 12, fontWeight: 620 }}>
            <MessageOutlined style={{ marginRight: 6, color: accent }} />
            IDE Copilot
            <div style={{ fontSize: 10.5, fontWeight: 400, color: '#6d7c96', marginTop: 2 }}>绑定 Harness · 不会替你绕过审批</div>
          </div>
          <div ref={chatRef} style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {chat.length === 0 && (
              <div style={{ fontSize: 12, color: '#7f8da8', lineHeight: 1.8 }}>
                当前文件 <span className="fde-mono">{file.path}</span>。
                <br />
                规格来自 Studio，我只改实现。
              </div>
            )}
            {chat.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: m.from === 'me' ? '#1b2a48' : '#162033',
                  fontSize: 12,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                <Space size={6} style={{ marginBottom: 4, color: '#8ea0bd', fontSize: 10 }}>
                  {m.from === 'me' ? <ThunderboltOutlined /> : <RobotOutlined />}
                  {m.from === 'me' ? '你' : 'Copilot'}
                </Space>
                <div>{m.text}</div>
              </div>
            ))}
            {typing && <div style={{ fontSize: 12, color: '#7f8da8' }}>正在补全…</div>}
          </div>
          <div style={{ padding: 10, borderTop: '1px solid #243049' }}>
            <Space size={[4, 4]} wrap style={{ marginBottom: 8 }}>
              {['补全 handle()', '加审批检查', '生成 Guardrail 测试'].map((q) => (
                <Tag key={q} style={{ cursor: 'pointer', margin: 0, fontSize: 10 }} onClick={() => send(q)}>
                  {q}
                </Tag>
              ))}
            </Space>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                size="small"
                value={draft}
                placeholder="向云 IDE Copilot 提问…"
                onChange={(e) => setDraft(e.target.value)}
                onPressEnter={() => send(draft)}
              />
              <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => send(draft)} />
            </Space.Compact>
          </div>
        </div>
      </div>

      <div
        style={{
          height: 26,
          background: accent,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          fontSize: 11,
        }}
      >
        <span>UTF-8  ·  {file.language}  ·  Harness connected</span>
        <span>direct_model_call = deny</span>
      </div>
    </div>
  );
}
