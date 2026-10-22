'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, Button, Drawer, Empty, Input, Space, Tag } from 'antd';
import { BulbOutlined, RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { useStore } from '@/lib/store';

interface Msg {
  from: 'me' | 'ai';
  text: string;
}

const fallback = `这个问题我需要更多上下文才能给出有价值的判断。

你可以试着问我：
· 我的 Problem 定义有什么问题？
· 这个 Ontology 缺少哪些对象？
· 这个 Agent 方案是否过度复杂？
· 哪些动作应该设置人工审批？
· Memory 和 Context 怎么优化？

提醒一下：我是你的教练和评审，不会替你把作业做完。方案的判断和取舍要由你们团队自己完成。`;

export default function CopilotDrawer() {
  const { copilotOpen, setCopilotOpen, dataset, project } = useStore();
  const pathname = usePathname();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  useEffect(() => {
    setMsgs([]);
  }, [dataset]);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    setMsgs((p) => [...p, { from: 'me', text }]);
    setInput('');
    setTyping(true);
    const lower = text.toLowerCase();
    const hit = dataset.copilotAnswers.find((a) => a.keywords.some((k) => lower.includes(k.toLowerCase())));
    setTimeout(() => {
      setMsgs((p) => [...p, { from: 'ai', text: hit ? hit.text : fallback }]);
      setTyping(false);
    }, 900);
  };

  return (
    <Drawer
      title={
        <Space>
          <Avatar size={26} style={{ background: '#1677ff' }} icon={<BulbOutlined />} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>FDE Copilot</div>
            <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>Coach · Reviewer · Critic · Guide</div>
          </div>
        </Space>
      }
      placement="right"
      width={480}
      open={copilotOpen}
      onClose={() => setCopilotOpen(false)}
      styles={{ body: { display: 'flex', flexDirection: 'column', padding: 0 } }}
    >
      <div ref={bodyRef} style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
        {msgs.length === 0 && (
          <div style={{ paddingTop: 40 }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ fontSize: 12.5, color: 'var(--fde-text-dim)', lineHeight: 1.8 }}>
                  我是贯穿平台的教学辅助 Agent，会结合你当前的项目与所在页面
                  <br />
                  <Tag color={project.accent} style={{ marginTop: 6 }}>
                    {project.name}
                  </Tag>
                  <Tag style={{ marginTop: 6 }}>{pathname}</Tag>
                  <br />
                  给出教练式反馈。我不会替你完成作业。
                </div>
              }
            />
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`fde-chat ${m.from === 'me' ? 'me' : ''}`}>
            <Avatar
              size={28}
              style={{ background: m.from === 'me' ? '#52c41a' : '#1677ff', flexShrink: 0 }}
              icon={m.from === 'me' ? <UserOutlined /> : <RobotOutlined />}
            />
            <div className="fde-bubble">{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="fde-chat">
            <Avatar size={28} style={{ background: '#1677ff' }} icon={<RobotOutlined />} />
            <div className="fde-bubble">
              <span className="blink">正在思考…</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--fde-border)', padding: '12px 18px 16px' }}>
        <Space size={[6, 6]} wrap style={{ marginBottom: 10 }}>
          {dataset.copilotQuickAsks.map((q) => (
            <Tag key={q} style={{ cursor: 'pointer', margin: 0 }} color="blue" onClick={() => send(q)}>
              {q}
            </Tag>
          ))}
        </Space>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="向 FDE Copilot 提问…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={() => send(input)}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={() => send(input)} loading={typing} />
        </Space.Compact>
      </div>
    </Drawer>
  );
}
