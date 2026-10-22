'use client';

import React from 'react';
import { Progress, Space, Tag, Tooltip } from 'antd';
import { useRouter } from 'next/navigation';
import { CheckCircleFilled, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useStore } from '@/lib/store';

export function PageHead({
  title,
  desc,
  extra,
}: {
  title: string;
  desc?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="fde-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
      <div>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {extra && <div style={{ flexShrink: 0 }}>{extra}</div>}
    </div>
  );
}

export function KV({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return (
    <div className="fde-kv">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

export function Metric({
  label,
  value,
  suffix,
  color,
  tip,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  color?: string;
  tip?: string;
}) {
  const body = (
    <div className="fde-metric">
      <div className="label">{label}</div>
      <div className="value" style={{ color }}>
        {value}
        {suffix && <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 3 }}>{suffix}</span>}
      </div>
    </div>
  );
  return tip ? <Tooltip title={tip}>{body}</Tooltip> : body;
}

export function StageBar({ current }: { current?: string }) {
  const router = useRouter();
  const { project, dataset } = useStore();
  return (
    <div className="fde-stage-bar">
      {dataset.stages.map((s, i) => {
        const isCurrent = current === s.key;
        const cls = isCurrent ? 'active' : s.status;
        return (
          <div
            key={s.key}
            className={`fde-stage-item ${cls}`}
            onClick={() => router.push(`/project/${project.id}/${s.route}`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--fde-text-dim)' }}>{`0${i + 1}`}</span>
              <span style={{ fontSize: 12.5, fontWeight: 620 }}>{s.name}</span>
              {s.status === 'done' && <CheckCircleFilled style={{ color: '#52c41a', fontSize: 11 }} />}
              {s.status === 'active' && <SyncOutlined spin style={{ color: '#1677ff', fontSize: 11 }} />}
              {s.status === 'todo' && <ClockCircleOutlined style={{ color: '#bfc7d4', fontSize: 11 }} />}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fde-text-dim)', marginBottom: 6 }}>{s.cn}</div>
            <Progress
              percent={s.progress}
              size="small"
              showInfo={false}
              strokeColor={s.status === 'done' ? '#52c41a' : s.status === 'active' ? '#1677ff' : '#d9d9d9'}
            />
          </div>
        );
      })}
    </div>
  );
}

export function ConfidenceTag({ value }: { value: number }) {
  const color = value >= 0.85 ? 'green' : value >= 0.7 ? 'blue' : 'orange';
  return (
    <Tag color={color} style={{ margin: 0 }}>
      置信度 {(value * 100).toFixed(0)}%
    </Tag>
  );
}

export function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <Space size={[12, 6]} wrap>
      {items.map((i) => (
        <Space key={i.label} size={5}>
          <span className="fde-dot" style={{ background: i.color }} />
          <span style={{ fontSize: 11.5, color: 'var(--fde-text-dim)' }}>{i.label}</span>
        </Space>
      ))}
    </Space>
  );
}

export function Radar({
  data,
  size = 230,
}: {
  data: { label: string; value: number }[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 34;
  const n = data.length;
  const point = (i: number, ratio: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(angle) * r * ratio, cy + Math.sin(angle) * r * ratio];
  };
  const poly = data.map((d, i) => point(i, Math.max(0.04, d.value)).join(',')).join(' ');
  return (
    <svg width={size} height={size}>
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <polygon
          key={ring}
          points={data.map((_, i) => point(i, ring).join(',')).join(' ')}
          fill="none"
          stroke="#e6ebf3"
          strokeWidth={1}
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e6ebf3" strokeWidth={1} />;
      })}
      <polygon points={poly} fill="rgba(22,119,255,0.22)" stroke="#1677ff" strokeWidth={2} />
      {data.map((d, i) => {
        const [x, y] = point(i, Math.max(0.04, d.value));
        return <circle key={i} cx={x} cy={y} r={3} fill="#1677ff" />;
      })}
      {data.map((d, i) => {
        const [x, y] = point(i, 1.2);
        return (
          <text
            key={d.label}
            x={x}
            y={y}
            fontSize={10}
            fill="#6b7a90"
            textAnchor={x > cx + 4 ? 'start' : x < cx - 4 ? 'end' : 'middle'}
            dominantBaseline="middle"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

export function MiniBars({
  data,
  height = 90,
  colors = ['#1677ff', '#52c41a'],
  keys = ['cpu', 'memory'],
}: {
  data: Record<string, number | string>[];
  height?: number;
  colors?: string[];
  keys?: string[];
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: height - 18, width: '100%', justifyContent: 'center' }}>
            {keys.map((k, ki) => (
              <Tooltip key={k} title={`${k}: ${d[k]}%`}>
                <div
                  style={{
                    width: 9,
                    height: `${Number(d[k])}%`,
                    background: colors[ki],
                    borderRadius: '3px 3px 0 0',
                    opacity: 0.85,
                  }}
                />
              </Tooltip>
            ))}
          </div>
          <span style={{ fontSize: 10, color: 'var(--fde-text-dim)' }}>{String(d.time)}</span>
        </div>
      ))}
    </div>
  );
}
