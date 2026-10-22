'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  Modal,
  Row,
  Segmented,
  Space,
  Statistic,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  AudioOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ConfidenceTag, PageHead } from '@/components/ui';
import { useStore } from '@/lib/store';
import { extractTypeMeta } from '@/mock';
import type { ExtractItem, InterviewTurn } from '@/mock';

export default function DiscoverPage() {
  const {
    extracts,
    addExtracts,
    setExtractStatus,
    updateExtract,
    interviewLogs,
    pushTurn,
    askedQuestions,
    markAsked,
    dataset,
  } = useStore();
  const { stakeholders, interviewScripts, personaHints } = dataset.discover;
  const caseDetail = dataset.caseDetail;
  const defaultPersona = Object.keys(personaHints).sort(
    (a, b) => (personaHints[b]?.length ?? 0) - (personaHints[a]?.length ?? 0),
  )[0];
  const [persona, setPersona] = useState(defaultPersona);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [tab, setTab] = useState('访谈');
  const [editing, setEditing] = useState<ExtractItem | null>(null);
  const [editText, setEditText] = useState('');
  const [msg, ctx] = message.useMessage();
  const chatRef = useRef<HTMLDivElement>(null);

  const sh = stakeholders.find((s) => s.id === persona) ?? stakeholders[0];
  const log = useMemo(() => interviewLogs[persona] ?? [], [interviewLogs, persona]);
  const asked = askedQuestions[persona] ?? [];
  const hints = (personaHints[persona] ?? []).filter((h) => !asked.includes(h));

  useEffect(() => {
    setPersona(defaultPersona);
  }, [defaultPersona]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [log, typing]);

  const ask = (question: string) => {
    if (!question.trim() || typing) return;
    const scripts = interviewScripts[persona] ?? [];
    const hit = scripts.find((s) => s.question === question) ?? scripts.find((s) => !asked.includes(s.question));

    pushTurn(persona, {
      id: `t-${Date.now()}`,
      from: 'student',
      text: question,
      time: new Date().toTimeString().slice(0, 5),
    });
    setInput('');
    setTyping(true);

    setTimeout(() => {
      if (hit) {
        markAsked(persona, hit.question);
        pushTurn(persona, {
          id: `t-${Date.now()}-a`,
          from: 'persona',
          text: hit.answer,
          time: new Date().toTimeString().slice(0, 5),
          extracts: hit.extracts.map((e) => e.id),
        });
        const items: ExtractItem[] = hit.extracts.map((e) => ({ ...e, status: 'pending' }));
        addExtracts(items);
        msg.info(`AI 从本轮回答中提取到 ${items.length} 条候选信息，请在右侧确认`);
      } else {
        pushTurn(persona, {
          id: `t-${Date.now()}-a`,
          from: 'persona',
          text: `（${sh.name}沉吟片刻）这个问题我一时说不上来。你要是问具体的流程或者数据，我倒能讲得清楚些。不如换个角度，从我们平时怎么干活开始问？`,
          time: new Date().toTimeString().slice(0, 5),
        });
      }
      setTyping(false);
    }, 1200);
  };

  const pending = extracts.filter((e) => e.status === 'pending');
  const accepted = extracts.filter((e) => e.status === 'accepted');
  const rejected = extracts.filter((e) => e.status === 'rejected');
  const shown = tab === '访谈' ? extracts : extracts;

  const byType = Object.keys(extractTypeMeta).map((t) => ({
    type: t,
    count: accepted.filter((e) => e.type === t).length,
  }));

  return (
    <div className="fde-page">
      {ctx}
      <PageHead
        title="Discover · 业务发现中心"
        desc="通过 AI 角色扮演访谈挖掘真实痛点、隐藏约束与组织冲突，AI 自动提取结构化洞察供人工确认"
        extra={
          <Space size={18}>
            <Statistic title="待确认" value={pending.length} valueStyle={{ fontSize: 18, color: '#fa8c16' }} />
            <Statistic title="已采纳" value={accepted.length} valueStyle={{ fontSize: 18, color: '#52c41a' }} />
            <Statistic title="已否决" value={rejected.length} valueStyle={{ fontSize: 18, color: '#8c8c8c' }} />
          </Space>
        }
      />

      <Row gutter={16}>
        <Col span={5}>
          <Card size="small" bordered={false} title="访谈对象" style={{ marginBottom: 14 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {stakeholders.map((s) => {
                const count = (interviewLogs[s.id] ?? []).filter((t) => t.from === 'persona').length;
                return (
                  <div
                    key={s.id}
                    onClick={() => setPersona(s.id)}
                    style={{
                      padding: '9px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: `1px solid ${persona === s.id ? '#91caff' : 'transparent'}`,
                      background: persona === s.id ? '#eaf3ff' : '#fafbfd',
                      transition: 'all .15s',
                    }}
                  >
                    <Space size={9}>
                      <Avatar size={30} style={{ background: s.avatarColor, fontSize: 12 }}>
                        {s.name.slice(0, 1)}
                      </Avatar>
                      <div style={{ lineHeight: 1.35 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)' }}>{s.role}</div>
                      </div>
                      {count > 0 && (
                        <Tag color="green" style={{ margin: 0, fontSize: 10 }}>
                          {count}
                        </Tag>
                      )}
                    </Space>
                  </div>
                );
              })}
            </Space>
          </Card>

          <Card size="small" bordered={false} title="Business Context">
            <div style={{ fontSize: 11.5, lineHeight: 1.85, color: '#4a5b76' }}>
              <div style={{ marginBottom: 8 }}>
                <b>Company</b>
                <br />
                {caseDetail.background.company}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Organization</b>
                <br />
                {caseDetail.background.organization}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Current System</b>
                <br />
                {caseDetail.background.currentSystem}
              </div>
              <div>
                <b>Business Process</b>
                <br />
                {caseDetail.background.businessProcess}
              </div>
            </div>
          </Card>
        </Col>

        <Col span={11}>
          <Card
            size="small"
            bordered={false}
            title={
              <Space>
                <Avatar size={26} style={{ background: sh.avatarColor, fontSize: 11 }}>
                  {sh.name.slice(0, 1)}
                </Avatar>
                <span>
                  AI Interview Simulator · {sh.name}（{sh.role}）
                </span>
              </Space>
            }
            extra={
              <Tooltip title="AI 依据 Case Background + Role Persona + Hidden Information + Business Constraints 进行角色扮演">
                <Tag color="purple" style={{ margin: 0 }}>
                  Persona 驱动
                </Tag>
              </Tooltip>
            }
            styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: 560 } }}
          >
            <div ref={chatRef} style={{ flex: 1, overflow: 'auto', padding: '16px 18px', background: '#fafbfd' }}>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--fde-text-dim)',
                  background: '#fff',
                  border: '1px dashed #e6ebf3',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 16,
                  lineHeight: 1.8,
                }}
              >
                <b>{sh.name}</b> · {sh.department} · 态度：{sh.attitude}
                <br />
                目标：{sh.goal}
                <br />
                <span style={{ color: '#fa8c16' }}>提示：这位受访者持有部分隐藏信息，需要通过追问逐步挖掘。</span>
              </div>

              {log.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span style={{ fontSize: 12 }}>从下方推荐问题开始你的第一轮访谈</span>}
                  style={{ marginTop: 60 }}
                />
              )}

              {log.map((t: InterviewTurn) => (
                <div key={t.id} className={`fde-chat ${t.from === 'student' ? 'me' : ''}`}>
                  <Avatar
                    size={30}
                    style={{ background: t.from === 'student' ? '#52c41a' : sh.avatarColor, flexShrink: 0 }}
                    icon={t.from === 'student' ? <UserOutlined /> : <AudioOutlined />}
                  />
                  <div>
                    <div className="fde-bubble">{t.text}</div>
                    {t.extracts && (
                      <div style={{ fontSize: 10.5, color: '#52c41a', marginTop: 4 }}>
                        ✓ AI 已提取 {t.extracts.length} 条候选洞察
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="fde-chat">
                  <Avatar size={30} style={{ background: sh.avatarColor }} icon={<AudioOutlined />} />
                  <div className="fde-bubble">
                    <span className="blink">{sh.name}正在回答…</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--fde-border)', padding: '10px 16px 14px', background: '#fff' }}>
              {hints.length > 0 && (
                <Space size={[6, 6]} wrap style={{ marginBottom: 9 }}>
                  {hints.map((h) => (
                    <Tag key={h} color="blue" style={{ cursor: 'pointer', margin: 0 }} onClick={() => ask(h)}>
                      {h}
                    </Tag>
                  ))}
                </Space>
              )}
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder={`向${sh.name}提问…`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPressEnter={() => ask(input)}
                />
                <Button type="primary" icon={<SendOutlined />} loading={typing} onClick={() => ask(input)}>
                  提问
                </Button>
              </Space.Compact>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            size="small"
            bordered={false}
            title="AI 自动提取的结构化洞察"
            extra={
              <Segmented
                size="small"
                options={['访谈', '汇总']}
                value={tab}
                onChange={(v) => setTab(v as string)}
              />
            }
            styles={{ body: { padding: 12, maxHeight: 560, overflow: 'auto' } }}
          >
            {tab === '汇总' && (
              <div style={{ marginBottom: 14 }}>
                <Row gutter={[8, 8]}>
                  {byType.map((b) => (
                    <Col span={12} key={b.type}>
                      <div
                        style={{
                          border: '1px solid var(--fde-border)',
                          borderRadius: 8,
                          padding: '8px 10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Tag color={extractTypeMeta[b.type].color} style={{ margin: 0, fontSize: 10 }}>
                          {extractTypeMeta[b.type].label}
                        </Tag>
                        <b style={{ fontSize: 15 }}>{b.count}</b>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {shown.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="尚无提取内容" style={{ padding: '40px 0' }} />
            )}

            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {shown.map((e) => (
                <div
                  key={e.id}
                  style={{
                    border: '1px solid var(--fde-border)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    background: e.status === 'rejected' ? '#fafafa' : '#fff',
                    opacity: e.status === 'rejected' ? 0.55 : 1,
                  }}
                >
                  <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                    <Space size={6}>
                      <Tag color={extractTypeMeta[e.type].color} style={{ margin: 0, fontSize: 10 }}>
                        {extractTypeMeta[e.type].label}
                      </Tag>
                      <ConfidenceTag value={e.confidence} />
                    </Space>
                    {e.status === 'accepted' && (
                      <Tag color="success" style={{ margin: 0, fontSize: 10 }}>
                        已采纳
                      </Tag>
                    )}
                    {e.status === 'rejected' && (
                      <Tag style={{ margin: 0, fontSize: 10 }}>已否决</Tag>
                    )}
                  </Space>
                  <div style={{ fontSize: 12.5, lineHeight: 1.8, color: '#22314d' }}>{e.content}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--fde-text-dim)', marginTop: 5 }}>来源：{e.source}</div>
                  {e.status === 'pending' && (
                    <Space size={6} style={{ marginTop: 9 }}>
                      <Button
                        size="small"
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => setExtractStatus(e.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditing(e);
                          setEditText(e.content);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="small" danger icon={<CloseOutlined />} onClick={() => setExtractStatus(e.id, 'rejected')}>
                        Reject
                      </Button>
                    </Space>
                  )}
                </div>
              ))}
            </Space>
          </Card>

          <Card size="small" bordered={false} title="Stakeholder 影响力-关注度矩阵" style={{ marginTop: 14 }}>
            <div style={{ position: 'relative', height: 220, background: '#fafbfd', borderRadius: 8, border: '1px solid var(--fde-border)' }}>
              <div style={{ position: 'absolute', inset: 0 }}>
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '1px dashed #dfe6f0' }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed #dfe6f0' }} />
                <span style={{ position: 'absolute', left: 6, top: 5, fontSize: 10, color: '#b0bacb' }}>低关注·高影响</span>
                <span style={{ position: 'absolute', right: 6, top: 5, fontSize: 10, color: '#b0bacb' }}>重点管理</span>
                <span style={{ position: 'absolute', left: 6, bottom: 5, fontSize: 10, color: '#b0bacb' }}>最小投入</span>
                <span style={{ position: 'absolute', right: 6, bottom: 5, fontSize: 10, color: '#b0bacb' }}>保持知情</span>
              </div>
              {stakeholders.map((s) => (
                <Tooltip key={s.id} title={`${s.name} · 影响力 ${s.influence} / 关注度 ${s.interest}`}>
                  <div
                    onClick={() => setPersona(s.id)}
                    style={{
                      position: 'absolute',
                      left: `${s.interest * 0.86}%`,
                      bottom: `${s.influence * 0.82}%`,
                      transform: 'translate(-50%, 50%)',
                      cursor: 'pointer',
                    }}
                  >
                    <Avatar size={26} style={{ background: s.avatarColor, fontSize: 11, border: '2px solid #fff' }}>
                      {s.name.slice(0, 1)}
                    </Avatar>
                  </div>
                </Tooltip>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        open={!!editing}
        title="编辑提取内容"
        onCancel={() => setEditing(null)}
        onOk={() => {
          if (editing) updateExtract(editing.id, editText);
          setEditing(null);
          msg.success('已修改并采纳');
        }}
        okText="保存并采纳"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }} size={10}>
          {editing && (
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="类型">{extractTypeMeta[editing.type].label}</Descriptions.Item>
              <Descriptions.Item label="来源">{editing.source}</Descriptions.Item>
            </Descriptions>
          )}
          <Input.TextArea rows={4} value={editText} onChange={(e) => setEditText(e.target.value)} />
          <div style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>
            <RobotOutlined /> 学生的修改会作为纠正信号写入 Session Memory，后续同类提取会参考此偏好。
          </div>
        </Space>
      </Modal>
    </div>
  );
}
