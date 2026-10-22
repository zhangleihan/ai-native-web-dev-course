'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Col, Drawer, List, Progress, Row, Segmented, Space, Steps, Tag } from 'antd';
import {
  BookOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  PlayCircleOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { PageHead } from '@/components/ui';
import { useStore } from '@/lib/store';
import { courses } from '@/mock';
import type { Course, CourseLesson } from '@/mock';

const modules = ['全部', 'Foundation', 'Discover', 'Define', 'Model', 'Build', 'Deploy', 'Evaluate'];

const fallbackOutline = (lessons: number): CourseLesson[] =>
  Array.from({ length: lessons }, (_, i) => ({
    title: `${i + 1}. ${
      [
        '概念导入与行业背景',
        '方法框架讲解',
        '关键工具与模板',
        '案例拆解（上）',
        '案例拆解（下）',
        '常见误区与反模式',
        '动手练习',
        '小结与自测',
        '延伸阅读',
        '综合实战',
        '答疑复盘',
        '结课测评',
      ][i] ?? `进阶专题 ${i + 1}`
    }`,
    type: i % 3 === 2 ? '练习' : i % 3 === 1 ? '案例' : '讲授',
    minutes: 20 + (i % 4) * 10,
  }));

const lessonsOf = (c: Course) =>
  (c.outline ?? fallbackOutline(c.lessons)).map((l, i) => ({ ...l, done: i < c.finished }));

export default function LearnPage() {
  const router = useRouter();
  const { projectId } = useStore();
  const [module, setModule] = useState('全部');
  const [open, setOpen] = useState<Course | null>(null);

  const list = module === '全部' ? courses : courses.filter((c) => c.module === module);
  const totalHours = courses.reduce((s, c) => s + c.hours, 0);
  const done = courses.reduce((s, c) => s + c.finished, 0);
  const all = courses.reduce((s, c) => s + c.lessons, 0);

  return (
    <div className="fde-page">
      <PageHead
        title="课程与知识 Learn"
        desc="围绕 FDE 8D 组织的课程体系，覆盖业务发现到评测，并补齐 RAG 知识库与 AI Coding 两门工程课"
        extra={
          <Space size={20}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>总课时</div>
              <div style={{ fontSize: 18, fontWeight: 650 }}>{totalHours} 小时</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--fde-text-dim)' }}>完成进度</div>
              <div style={{ fontSize: 18, fontWeight: 650, color: '#1677ff' }}>
                {done}/{all}
              </div>
            </div>
          </Space>
        }
      />

      <Segmented
        options={modules}
        value={module}
        onChange={(v) => setModule(v as string)}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[14, 14]}>
        {list.map((c) => (
          <Col span={8} key={c.id}>
            <Card
              size="small"
              className="fde-card-hover"
              bordered={false}
              onClick={() => setOpen(c)}
              styles={{ body: { padding: 18 } }}
            >
              <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                <Tag color="blue" style={{ margin: 0 }}>
                  {c.module}
                </Tag>
                {c.progress === 100 ? (
                  <Tag color="success" icon={<CheckCircleFilled />} style={{ margin: 0 }}>
                    已完成
                  </Tag>
                ) : c.progress > 0 ? (
                  <Tag color="processing" style={{ margin: 0 }}>
                    学习中
                  </Tag>
                ) : (
                  <Tag style={{ margin: 0 }}>未开始</Tag>
                )}
              </Space>

              <div style={{ fontSize: 15, fontWeight: 630, color: '#16223a', marginBottom: 6 }}>{c.title}</div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--fde-text-dim)',
                  lineHeight: 1.8,
                  height: 43,
                  overflow: 'hidden',
                  marginBottom: 12,
                }}
              >
                {c.summary}
              </div>

              <Progress
                percent={c.progress}
                size="small"
                strokeColor={c.progress === 100 ? '#52c41a' : '#1677ff'}
                format={(p) => <span style={{ fontSize: 11 }}>{p}%</span>}
              />

              <Space size={12} style={{ marginTop: 10, fontSize: 11.5, color: 'var(--fde-text-dim)' }}>
                <span>
                  <ReadOutlined /> {c.lessons} 节
                </span>
                <span>
                  <ClockCircleOutlined /> {c.hours} 小时
                </span>
                {c.tags.map((t) => (
                  <Tag key={t} style={{ margin: 0, fontSize: 10 }}>
                    {t}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Drawer
        open={!!open}
        width={620}
        onClose={() => setOpen(null)}
        title={
          <Space>
            <BookOutlined style={{ color: '#1677ff' }} />
            {open?.title}
          </Space>
        }
      >
        {open && (
          <>
            <Card size="small" bordered={false} style={{ background: '#f7f9fc', marginBottom: 16 }}>
              <div style={{ fontSize: 13, lineHeight: 1.9, color: '#4a5b76' }}>{open.summary}</div>
              <Space size={16} style={{ marginTop: 12 }}>
                <span style={{ fontSize: 12 }}>
                  模块 <b>{open.module}</b>
                </span>
                <span style={{ fontSize: 12 }}>
                  课时 <b>{open.hours} 小时</b>
                </span>
                <span style={{ fontSize: 12 }}>
                  进度{' '}
                  <b style={{ color: '#1677ff' }}>
                    {open.finished}/{open.lessons}
                  </b>
                </span>
              </Space>
            </Card>

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>课程目录</div>
            <List
              size="small"
              dataSource={lessonsOf(open)}
              renderItem={(l) => (
                <List.Item
                  actions={[
                    <Button
                      key="p"
                      type={l.done ? 'text' : 'link'}
                      size="small"
                      icon={<PlayCircleOutlined />}
                    >
                      {l.done ? '重看' : '开始'}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      l.done ? (
                        <CheckCircleFilled style={{ color: '#52c41a' }} />
                      ) : (
                        <PlayCircleOutlined style={{ color: '#bfc7d4' }} />
                      )
                    }
                    title={<span style={{ fontSize: 13 }}>{l.title}</span>}
                    description={
                      <Space size={8} style={{ fontSize: 11 }}>
                        <Tag style={{ margin: 0, fontSize: 10 }}>{l.type}</Tag>
                        <span>{l.minutes} 分钟</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />

            <div style={{ fontSize: 13, fontWeight: 600, margin: '20px 0 10px' }}>与项目阶段的联动</div>
            <Steps
              size="small"
              direction="vertical"
              current={1}
              items={[
                { title: '学习本模块知识', description: '理解方法与工具' },
                { title: `在项目工作区应用`, description: `进入 ${open.stage} 阶段完成对应产出物` },
                { title: '教师与 Copilot 反馈', description: '基于产出物获得针对性点评' },
              ]}
            />
            {open.labPath && (
              <Button
                type="primary"
                block
                style={{ marginTop: 16 }}
                onClick={() => router.push(`/project/${projectId}/${open.labPath}`)}
              >
                {open.labLabel ?? '进入项目工作区'}
              </Button>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
