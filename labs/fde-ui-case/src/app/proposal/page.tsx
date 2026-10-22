'use client';

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Radio,
  Row,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { PrinterOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { PageHead } from '@/components/ui';
import {
  exclusions,
  laborItems,
  laborReserve,
  laborSubtotal,
  laborTotal,
  milestones,
  outcomes,
  proposalGoals,
  proposalMeta,
  proposalScope,
  risks,
  schemeA,
  schemeB,
  schemeSubjects,
  type SchemeKey,
} from '@/mock/proposal';

const { Paragraph, Text } = Typography;

const money = (n: number) => n.toFixed(1);

export default function ProposalPage() {
  const [schemeKey, setSchemeKey] = useState<SchemeKey>(proposalMeta.recommended);
  const scheme = schemeKey === 'A' ? schemeA : schemeB;
  const other = schemeKey === 'A' ? schemeB : schemeA;
  const subjects = useMemo(() => schemeSubjects(scheme), [scheme]);
  const subjectSum = subjects.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="fde-page fde-proposal-page">
      <PageHead
        title="项目预算"
        desc={`${proposalMeta.docNo} · ${proposalMeta.currency} · 教育信息化 / 产学研联合试点口径`}
        extra={
          <Space className="fde-print-hide-btn">
            <Radio.Group
              value={schemeKey}
              onChange={(e) => setSchemeKey(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="A">方案甲 · 灵畿</Radio.Button>
              <Radio.Button value="B">方案乙 · API+GPU</Radio.Button>
            </Radio.Group>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              打印 / 导出 PDF
            </Button>
          </Space>
        }
      />

      <article className="fde-proposal-doc">
        <header className="fde-proposal-cover">
          <div className="fde-proposal-cover-meta">
            <span>文号 {proposalMeta.docNo}</span>
            <span>申报单位 {proposalMeta.org}</span>
            <span>建设周期 {proposalMeta.period}</span>
          </div>
          <h2>项目预算书</h2>
          <h1>{proposalMeta.title}</h1>
          <p className="fde-proposal-lead">{proposalMeta.subtitle}</p>
          <Space wrap size={8} style={{ marginTop: 16 }}>
            <Tag color="blue">试点 {proposalMeta.scale}</Tag>
            <Tag color="geekblue">案例 {proposalMeta.cases}</Tag>
            <Tag color="cyan">{proposalMeta.durationNote}</Tag>
          </Space>
        </header>

        <Row gutter={12} className="fde-proposal-kpis">
          <Col span={6}>
            <div className="fde-proposal-kpi">
              <div className="k">申报经费（中位）</div>
              <div className="v">
                {scheme.totalMid}
                <span> 万</span>
              </div>
              <div className="s">
                {scheme.name} {scheme.totalLow}–{scheme.totalHigh} 万
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div className="fde-proposal-kpi">
              <div className="k">软件开发费</div>
              <div className="v">
                {scheme.laborTotal}
                <span> 万</span>
              </div>
              <div className="s">含底座适配与 10% 预备费</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="fde-proposal-kpi">
              <div className="k">基础设施 / 算力</div>
              <div className="v">
                {scheme.infraMid}
                <span> 万</span>
              </div>
              <div className="s">试运行 6 个月按量估算</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="fde-proposal-kpi">
              <div className="k">对照方案差额</div>
              <div className="v" style={{ color: '#1677ff' }}>
                {Math.abs(scheme.totalMid - other.totalMid)}
                <span> 万</span>
              </div>
              <div className="s">
                {other.name} 中位 {other.totalMid} 万 · 约 90% 为人力
              </div>
            </div>
          </Col>
        </Row>

        <Alert
          type="info"
          showIcon
          icon={<SafetyCertificateOutlined />}
          style={{ marginBottom: 28 }}
          message="方案比选结论"
          description={
            <>
              两方案控制面相同，差异仅在模型与算力来源。建议：<b>3 个月内可锁定灵畿额度与专线</b>则按方案甲申报{' '}
              <b>{schemeA.totalMid} 万元</b>；若开课在前、合作未定，则按方案乙轻量档申报{' '}
              <b>{schemeB.totalMid} 万元</b>
              （可先不采购 4090）。Model Router 可切换，立项后不因底座变更返工平台。当前页面经费按
              <b> {scheme.name}</b> 列示。
            </>
          }
        />

        <section className="fde-proposal-sec">
          <h3>一、项目基本信息</h3>
          <Descriptions bordered size="small" column={2} labelStyle={{ width: 148, background: '#f7f9fc' }}>
            <Descriptions.Item label="项目名称" span={2}>
              {proposalMeta.title}
            </Descriptions.Item>
            <Descriptions.Item label="项目类型">教育信息化建设 / 产学研联合试点</Descriptions.Item>
            <Descriptions.Item label="申报文号">{proposalMeta.docNo}</Descriptions.Item>
            <Descriptions.Item label="申报单位">{proposalMeta.org}</Descriptions.Item>
            <Descriptions.Item label="合作方">{proposalMeta.partner}</Descriptions.Item>
            <Descriptions.Item label="建设周期">{proposalMeta.period}</Descriptions.Item>
            <Descriptions.Item label="周期说明">{proposalMeta.durationNote}</Descriptions.Item>
            <Descriptions.Item label="试点规模">{proposalMeta.scale}</Descriptions.Item>
            <Descriptions.Item label="示范案例">{proposalMeta.cases}</Descriptions.Item>
            <Descriptions.Item label="经费口径" span={2}>
              {proposalMeta.currency}；不含增值税、机房土建及二期集群
            </Descriptions.Item>
            <Descriptions.Item label="推荐方案" span={2}>
              {schemeA.name}：{schemeA.title}，申报中位 <b>{schemeA.totalMid} 万元</b>（区间 {schemeA.totalLow}–
              {schemeA.totalHigh}）
            </Descriptions.Item>
          </Descriptions>
        </section>

        <section className="fde-proposal-sec">
          <h3>二、立项依据与建设目标</h3>
          <Paragraph>
            工程管理人才培养正从「会写方案」转向「能把业务问题做成可运行的 AI
            系统」。现有课程、案例库与编程工具彼此割裂：学生无法在同一工作环境中完成业务发现、问题定义、本体建模、Agent
            实现、受控运行、沙箱部署与评测。本项目建设 <b>AI-FDE 工程管理实训平台</b>
            ，把 FDE 八个阶段做成可上课的一体化工作环境。
          </Paragraph>
          <Paragraph>
            当前已具备前端原型（Fake 数据）。一期建设目标是交付<b>可试点教学的真实系统</b>
            ：真实账号与课程、Harness 受控执行、RAG 知识库、云 AI-IDE / 外部 IDE
            实现通道、Docker 沙箱与 L1–L4 基础评测，并以通信、电网两个 Golden Case 开课。
          </Paragraph>
          <Table
            size="small"
            pagination={false}
            rowKey="no"
            dataSource={proposalGoals}
            columns={[
              { title: '编号', dataIndex: 'no', width: 72 },
              { title: '目标', dataIndex: 'name', width: 140 },
              { title: '考核指标', dataIndex: 'metric' },
            ]}
          />
        </section>

        <section className="fde-proposal-sec">
          <h3>三、建设内容与考核边界</h3>
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            控制面（课程、案例、工作区、权限、审批、Trace、评测）由本校自管；运行底座只决定模型与算力从何处调用。
          </Paragraph>
          <Table
            size="small"
            pagination={false}
            rowKey="module"
            dataSource={proposalScope}
            columns={[
              { title: '建设模块', dataIndex: 'module', width: 140 },
              { title: '一期建设内容', dataIndex: 'do' },
              { title: '一期不列入', dataIndex: 'dont' },
            ]}
          />
        </section>

        <section className="fde-proposal-sec">
          <h3>四、技术路线与方案比选</h3>
          <Paragraph>
            平台采用「控制面 + Model Router + Harness」架构。学生可在云 AI-IDE 或外部 IDE（Cursor / VS Code
            Copilot 等）编写 Agent，<b>运行必须走 Harness</b>
            ，高风险工具经人工审批，全部 Run 记录 Who / When / Tool / Token / Cost。
          </Paragraph>
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title={`${schemeA.name} · 推荐`} extra={<Tag color="blue">{schemeA.totalMid} 万</Tag>}>
                <p style={{ marginTop: 0 }}>{schemeA.summary}</p>
                <div className="fde-kv">
                  <span className="k">开发</span>
                  <span className="v">{schemeA.laborTotal} 万</span>
                </div>
                <div className="fde-kv">
                  <span className="k">基础设施 / 算力</span>
                  <span className="v">{schemeA.infraMid} 万</span>
                </div>
                <div className="fde-kv">
                  <span className="k">区间</span>
                  <span className="v">
                    {schemeA.totalLow}–{schemeA.totalHigh} 万
                  </span>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title={schemeB.name} extra={<Tag>{schemeB.totalMid} 万</Tag>}>
                <p style={{ marginTop: 0 }}>{schemeB.summary}</p>
                <div className="fde-kv">
                  <span className="k">开发</span>
                  <span className="v">{schemeB.laborTotal} 万</span>
                </div>
                <div className="fde-kv">
                  <span className="k">基础设施 / 算力</span>
                  <span className="v">{schemeB.infraMid} 万</span>
                </div>
                <div className="fde-kv">
                  <span className="k">区间</span>
                  <span className="v">
                    {schemeB.totalLow}–{schemeB.totalHigh} 万
                  </span>
                </div>
              </Card>
            </Col>
          </Row>
          <Paragraph style={{ marginTop: 14, marginBottom: 0 }}>
            需提前锁定的合作条款（方案甲）：① 九天及汇聚模型提供 OpenAI 兼容网关；② 50
            人试点的 Token / GPU 课时额度；③ 通信、电网案例数据不出域。未锁定则按方案乙申报，不返工控制面。
          </Paragraph>
        </section>

        <section className="fde-proposal-sec">
          <h3>五、经费预算</h3>
          <Paragraph>
            下列科目按当前所选 <Text strong>{scheme.name}</Text>（{scheme.title}）中位值编制，单位：万元。开发人力为两方案共用，差异为人月适配与算力结算。
          </Paragraph>

          <h4>5.1 经费科目汇总（申报表）</h4>
          <Table
            size="small"
            pagination={false}
            rowKey="subject"
            dataSource={subjects}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <b>申报经费合计</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <b>{money(subjectSum)}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  中位值；区间 {scheme.totalLow}–{scheme.totalHigh} 万
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
            columns={[
              { title: '经费科目', dataIndex: 'subject', width: 240 },
              {
                title: '金额（万）',
                dataIndex: 'amount',
                width: 120,
                render: (v: number) => money(v),
              },
              { title: '测算说明', dataIndex: 'note' },
            ]}
          />

          <h4>5.2 软件开发明细（共用工作包）</h4>
          <Table
            size="small"
            pagination={false}
            rowKey="name"
            dataSource={[
              ...laborItems,
              {
                name: `${scheme.name}底座适配`,
                months: scheme.extraMonths,
                rate: Number((scheme.laborExtra / scheme.extraMonths).toFixed(1)),
                amount: scheme.laborExtra,
                subject: '软件开发费',
              },
              { name: '预备费 10%', months: 0, rate: 0, amount: laborReserve, subject: '预备费' },
            ]}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <b>开发合计</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2} />
                <Table.Summary.Cell index={3}>
                  <b>{money(scheme.laborTotal)}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  共用 {laborTotal} 万 + 适配 {scheme.laborExtra} 万
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
            columns={[
              { title: '工作包', dataIndex: 'name' },
              {
                title: '人月',
                dataIndex: 'months',
                width: 80,
                render: (v: number) => (v ? v.toFixed(1) : '—'),
              },
              {
                title: '单价（万）',
                dataIndex: 'rate',
                width: 110,
                render: (v: number) => (v ? v.toFixed(1) : '—'),
              },
              {
                title: '金额（万）',
                dataIndex: 'amount',
                width: 110,
                render: (v: number) => money(v),
              },
              { title: '对应科目', dataIndex: 'subject', width: 140 },
            ]}
          />
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            共用开发小计 {laborSubtotal} 万（44 人月），预备费 {laborReserve} 万，合计 {laborTotal}{' '}
            万。人月单价按 2026 年高校信息化联合开发 / 外包常见报价。
          </Paragraph>

          <h4>5.3 {scheme.name}基础设施与算力</h4>
          <Table
            size="small"
            pagination={false}
            rowKey="name"
            dataSource={scheme.infra}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <b>小计（中位）</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2}>
                  <b>{money(scheme.infraMid)}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} />
                <Table.Summary.Cell index={4} />
                <Table.Summary.Cell index={5} />
              </Table.Summary.Row>
            )}
            columns={[
              { title: '测算项', dataIndex: 'name' },
              { title: '科目', dataIndex: 'subject', width: 130 },
              { title: '中位', dataIndex: 'mid', width: 80, render: (v: number) => money(v) },
              { title: '低', dataIndex: 'low', width: 70, render: (v: number) => money(v) },
              { title: '高', dataIndex: 'high', width: 70, render: (v: number) => money(v) },
              { title: '说明', dataIndex: 'note', width: 200 },
            ]}
          />
        </section>

        <section className="fde-proposal-sec">
          <h3>六、实施计划</h3>
          <Timeline
            items={milestones.map((m, i) => ({
              color: i < 2 ? 'blue' : 'gray',
              children: (
                <div>
                  <Text strong>
                    {m.time}　{m.title}
                  </Text>
                  <div style={{ color: 'var(--fde-text-dim)', fontSize: 13, marginTop: 4 }}>{m.desc}</div>
                </div>
              ),
            }))}
          />
        </section>

        <section className="fde-proposal-sec">
          <h3>七、预期成果</h3>
          <Table
            size="small"
            pagination={false}
            rowKey="name"
            dataSource={outcomes}
            columns={[
              { title: '成果', dataIndex: 'name', width: 180 },
              { title: '内容与验收形态', dataIndex: 'desc' },
            ]}
          />
        </section>

        <section className="fde-proposal-sec">
          <h3>八、风险分析与保障措施</h3>
          <Table
            size="small"
            pagination={false}
            rowKey="risk"
            dataSource={risks}
            columns={[
              { title: '主要风险', dataIndex: 'risk', width: 220 },
              {
                title: '等级',
                dataIndex: 'level',
                width: 80,
                render: (v: string) => <Tag color={v === '高' ? 'red' : 'gold'}>{v}</Tag>,
              },
              { title: '保障措施', dataIndex: 'mitigation' },
            ]}
          />
        </section>

        <section className="fde-proposal-sec">
          <h3>九、经费不含项</h3>
          <ul className="fde-proposal-list">
            {exclusions.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            申报总额为不含税中位估算，最终以合同与合作协议为准。方案甲、乙可在立项后通过 Model Router
            切换，不改变控制面建设内容。
          </Paragraph>
        </section>
      </article>
    </div>
  );
}
