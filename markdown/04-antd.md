# Ant Design：表格、表单与组件协作

## 学习目标与准备

本节把原生 input、select 和列表迁移为 Ant Design 组件，重点是控件接口、数据所有权和验证规则。建议完成 React 主讲义后课后学习60分钟；若前一节 Next.js 尚未理解，可以先阅读组件部分，理解“换组件库后状态流仍不变”。

使用 [Next.js + Ant Design 实验](labs/next-antd-basics/README.md)，从课程根目录执行 `cd labs/next-antd-basics`，随后 `npm ci`、`npm run dev`，打开 `http://127.0.0.1:3002/cases`。这是前端内存练习，新增记录刷新后丢失。

Ant Design 的 React 实现包名是 `antd`。Ant Design Pro 是另一层应用方案，Ant Design Mobile 面向移动场景，Ant Design X 面向 AI 交互；本节只使用 antd，不同时引入这些产品。先读[官方 React 介绍](https://ant.design/docs/react/introduce-cn)。

## 入门：组件库是什么，如何读它的用法

### 从自己写控件到使用现成组件

原生 HTML 提供 button、input 等元素，CSS 决定它们的样式，JavaScript 处理行为。实际应用还需要字段错误提示、表格空态、对齐和间距等一致体验。Ant Design 提供设计规范及其 React 组件实现，安装的包名是 antd。

使用组件库不是贴一张页面图片，也不是把整套业务外包给组件。你仍需决定“数据在哪里、何时更新、失败时显示什么”。它主要帮助复用界面结构和交互能力，使项目不必从头实现每个常见控件。

### 先认识常用组件，不急着全部使用

| 类别 | 常见组件 | 本课程的使用场景 |
|---|---|---|
| 操作 | Button | 收藏、提交、重置 |
| 输入 | Input、Select、Checkbox | 文本、单选项、勾选条件 |
| 数据展示 | Table、Tag | 案例记录、分类标签 |
| 表单组织 | Form、Form.Item | 字段值、验证与错误提示 |
| 反馈 | Alert、Spin、Empty | 说明、加载中、无结果 |
| 排列与布局 | Space、Flex | 控件间距、横向或纵向排列 |

用本例所需的少数组件即可，不因为文档列了很多组件就全部放进页面。留白、语义标签和阅读顺序仍需要自己设计；组件库不会自动保证所有组合都易用。

### 一个最小可运行页面：按钮点击与计数

在 Next.js 实验副本中新建 `app/button-demo/page.jsx`。该工程已经安装 antd 并配置根布局，无需再次安装。

```jsx
"use client";
import { useState } from 'react';
import { Button, Space } from 'antd';

export default function ButtonDemoPage() {
  const [count, setCount] = useState(0);
  return <main>
    <h1>认识 Ant Design 按钮</h1>
    <p role="status">已添加 {count} 次</p>
    <Space wrap>
      <Button type="primary" onClick={() => setCount(value => value + 1)}>
        添加一次
      </Button>
      <Button disabled={count === 0} onClick={() => setCount(0)}>
        清零
      </Button>
    </Space>
  </main>;
}
```

访问 `http://127.0.0.1:3002/button-demo`。初始清零按钮不可用，添加一次后变为可用，清零后再次不可用。按钮的颜色来自组件样式，计数与可用性来自我们传入的数据；换成普通 button 时，useState 的逻辑仍然成立。

逐项认识：`import { Button } from 'antd'` 是命名导入；type 是 Button 的视觉类型；disabled 是布尔属性；onClick 是事件回调；按钮标签之间的文字是 children。Space 处理控件间距，wrap 允许在空间不足时换行。

### 学会读 API 表

官方文档通常先展示示例，后列属性表。读一个属性时依次看“含义—值的类型—默认值—事件参数”，然后回到当前需求。下面是读法示例，而不是要求背诵整个组件 API：

| 属性类型 | 示例 | 容易犯的错误 |
|---|---|---|
| 字符串 | `type="primary"` | 把组件的 type 误当作 HTML submit |
| 布尔值 | `disabled={count === 0}` | 写 `disabled="false"`，传入非空字符串 |
| 对象 | `style={{ marginTop: 16 }}` | 把 React style 写成 CSS 字符串 |
| 数组 | `options={[{ value: 'retail', label: '零售' }]}` | 混淆显示文字与业务值 |
| 函数 | `onClick={handleClick}` | 加括号导致渲染时立即调用 |

需要提交表单时用 `htmlType="submit"`；type="primary" 只是主要按钮样式。加载状态与禁用状态也要结合真实请求设置，不能只显示一个转圈动画就表示请求已经成功。

### 可访问性与样式的基本责任

输入框要有明确标签，不只写 placeholder；图标按钮要有可访问名称；错误说明应靠近对应字段。使用 Tab 检查能否走到控件、用键盘完成操作。组件提供基础能力，业务组合仍需验证。

先沿用默认主题与少量布局 CSS，学会受控输入和表单后再考虑 ConfigProvider 的主题配置。不要通过大量全局 CSS 覆盖内部类名来“修复”不了解的组件行为。官方入门见 [Ant Design React 介绍](https://ant.design/docs/react/introduce-cn)，后面的章节再分别查 Select、Table 和 Form。

入门验收：完成按钮示例，解释 count、disabled 与 onClick 的关系，并能在 API 表里查出一个属性的类型。然后再进行下文的案例筛选与表单实验。

## 1. 从已有 HTML 控件迁移

| 原生实现 | Ant Design 实现 | 必须重新核对的接口 |
|---|---|---|
| `<input>` | Input | onChange 仍从事件中读取 target.value |
| `<select>` | Select + options | onChange 第一参数就是选中值，不是 DOM 事件 |
| `<button type="submit">` | Button htmlType="submit" | Button 的 type 用于视觉样式，htmlType 才是原生按钮类型 |
| `<ul>` 或 `<table>` | Table | dataSource 是记录数组，columns 是列配置，rowKey 是行身份 |
| `<form>` + 手工错误提示 | Form + Form.Item | 字段值与校验可以交给 Form 管理 |

组件库减少重复界面代码，但不能替代业务规则。不要凭外观相似就假设事件参数相同，遇到问题先看官方 API 表与最小示例。[Select 文档](https://ant.design/components/select-cn)适合用于这项练习。

## 2. 受控筛选：仍然由页面保存状态

实验的 CaseWorkbench.jsx 顶部有 `"use client"`。筛选区是两个普通受控字段，没有交给 Form 管理：

```jsx
const [keyword, setKeyword] = useState('');
const [industry, setIndustry] = useState('all');
const visible = filterCases(items, keyword, industry);

// 放在组件返回的 JSX 中：
<label htmlFor="case-query">标题关键词</label>
<Input id="case-query" value={keyword} allowClear
  onChange={event => setKeyword(event.target.value)} />
<label htmlFor="case-industry">行业</label>
<Select id="case-industry" value={industry} onChange={setIndustry}
  options={[
    { value: 'all', label: '全部行业' },
    { value: 'telecom', label: '通信' },
    { value: 'retail', label: '零售' },
  ]} />
```

这段是片段，完整导入与根节点见 [CaseWorkbench.jsx](labs/next-antd-basics/components/CaseWorkbench.jsx)。其中 Input 的清除按钮同样走状态更新链路；Select 的选项用 label 显示中文、value 保存行业代码。`onChange={event => setIndustry(event.target.value)}` 用在 Select 上会出错，因为它的第一参数不是原生事件。

可见结果仍由 `filterCases` 计算；换了组件库，不应顺便给 visible 再加一个 state。练习：输入“ dns ”后选通信，应显示1条；改成零售应显示0条；清空筛选后恢复全部。

## 3. Table：数据与列描述分开

```jsx
const columns = [
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '行业', dataIndex: 'industry', key: 'industry',
    render: value => value === 'telecom' ? '通信' : '零售' },
];

<Table rowKey="id" columns={columns} dataSource={visible}
  pagination={false}
  locale={{ emptyText: '没有匹配的案例，请调整条件。' }}
  scroll={{ x: 480 }} />
```

这是基于本实验两种行业的简化片段，完整源码使用选项表查找并给未知值保留回退。`title` 是表头，`dataIndex` 指向记录字段，`render` 把字段值变成显示内容。列的 key 与行的 rowKey 是两个不同层次的身份：行仍应使用稳定案例 id。

本例只有少量本地记录，关闭分页以便观察全部结果。增加分页配置不会自动获得服务端分页；数据量增大时，后端返回某一页与总数，前端必须明确当前页、页大小和查询条件。第7讲才接入这个请求链路。[Table 官方文档](https://ant.design/components/table-cn)可查列配置与行身份。

不要在课程练习里把“没有匹配结果”一律写为“加载失败”：空数组是一次成功计算，网络失败则是另一种状态。组件库的空态和 loading 属性只是展示入口，真实状态仍需应用提供。

## 4. Form：让一套机制管理输入草稿

新增案例与实时筛选是不同任务：筛选即时影响列表；新增先编辑草稿，通过验证后才生成记录。本例把新增草稿交给 Form，而不是为每个字段同时建立一份 useState。

```jsx
const [form] = Form.useForm();

<Form form={form} name="case-create" layout="vertical"
  initialValues={{ title: '', industry: 'telecom' }} onFinish={handleAdd}>
  <Form.Item name="title" label="案例标题" rules={[
    { required: true, whitespace: true, message: '请输入非空标题' },
    { max: 40, message: '标题最多40个字符' },
  ]}>
    <Input maxLength={40} />
  </Form.Item>
  <Form.Item name="industry" label="所属行业"
    rules={[{ required: true, message: '请选择行业' }]}>
    <Select options={industryOptions} />
  </Form.Item>
  <Button type="primary" htmlType="submit">添加到本页</Button>
  <Button htmlType="button" onClick={() => form.resetFields()}>重置草稿</Button>
</Form>
```

带 name 的 Form.Item 将字段连接到表单；不要再给里面的 Input 同时绑定另一个 value/setState。`initialValues` 是初始化与重置的参考值，不是随着父组件 state 自动更新的实时值。编辑已有记录时，可以按业务意图调用 `form.setFieldsValue(...)`，并明确何时替换草稿。

`onFinish` 在校验通过后收到字段值。本例将必填、纯空格与长度错误留在字段附近，让学生看见具体问题；这些前端校验不能取代未来服务端接口的校验与授权。官方定位：[Form 文档](https://ant.design/components/form-cn)的表单实例、数据域和常见问题。

## 5. 提交成功之后，究竟更新了什么

```jsx
function handleAdd(values) {
  const item = makeCase(values, crypto.randomUUID());
  setItems(previous => [...previous, item]);
  setKeyword('');
  setIndustry('all');
  setNotice(`已在本页添加“${item.title}”；刷新后不保留。筛选已清空。`);
  form.resetFields();
}
```

makeCase 在 lib/cases.js 内对标题做 trim 并检查行业，随机 id 在点击提交后的处理过程生成一次。函数式更新产生新数组。这里特意在新增后清空筛选，让新记录立即可见，并通过通知告诉使用者筛选被重置；这是本实验的明确交互规则，不是所有产品都必须如此。

```text
Form 内部：草稿字段与校验结果
    ↓ onFinish(values)
CaseWorkbench：新增记录到 items
    ↓ visible = filterCases(items, keyword, industry)
Table：根据新 dataSource 渲染
```

两套状态各有职责：Form 保存“尚未提交的输入”，React state 保存“本页已经提交的记录”。这不是同一字段的重复镜像。重置草稿不应删掉列表记录，清空筛选不应删掉记录，刷新则会丢失全部本地新增记录。

## 6. Next.js 中的首屏样式

配套根布局采用官方 App Router 集成方案：

```jsx
import { AntdRegistry } from '@ant-design/nextjs-registry';

export default function RootLayout({ children }) {
  return <html lang="zh-CN"><body>
    <AntdRegistry>{children}</AntdRegistry>
  </body></html>;
}
```

这是去掉导航后的核心结构。AntdRegistry 帮助收集和插入首屏样式；不要把 Pages Router 的 `_document` 方案混进来。Form.Item 等组合组件集中放在带 use client 的交互模块中，根布局保持服务端组件。详见[在 Next.js 中使用 Ant Design](https://ant.design/docs/react/use-with-next-cn)。

本实验依赖版本已锁定。网上旧文章可能使用旧主版本的样式文件、图标导入或兼容补丁，不能不看版本就叠加到现有工程。核对 `package.json`、`package-lock.json` 与对应官方文档后再升级。

## 7. 一次可验收的练习

| 操作 | 预期结果 | 对应知识 |
|---|---|---|
| 初次进入案例管理 | 3条案例 | 初始 props 到 state |
| 关键词 DNS、行业通信 | 1条 | 受控字段与组合过滤 |
| 关键词 DNS、行业零售 | 0条并显示空态 | 条件交集与空态 |
| 空标题或全空格提交 | 字段错误，列表不增加 | Form rules |
| 输入有效标题，选零售后提交 | 4条；新记录可见；草稿重置 | onFinish 与不可变更新 |
| 修改草稿但点击重置 | 已有记录不变 | 草稿与已提交数据分离 |
| 刷新页面 | 恢复3条 | 内存与持久化边界 |

独立任务：新增“难度”字段。先扩展初始数据与 makeCase，再增加表单字段、表格列和筛选选项。提交一张“字段→谁拥有→谁读取→谁更新”的表，以及至少4条操作记录。不要只换主题颜色就声称掌握了组件库。

## 自检与参考答案

<details><summary>为什么 Select 的 onChange 和 Input 的 onChange 不能机械复制？</summary><p>组件 API 定义不同。Input 读取事件中的 target.value；本例单选 Select 直接提供选中值。应查对应版本文档。</p></details>

<details><summary>为什么 Form.Item 内不再手写 value 和 setTitle？</summary><p>带 name 的字段已由 Form 管理，另加一套 state 容易冲突。列表记录仍由父组件 state 管理，两者职责不同。</p></details>

<details><summary>rowKey、字段 name、列 dataIndex 是同一概念吗？</summary><p>不是。rowKey 标识记录身份；name 标识表单字段；dataIndex 指定表格列读取的记录属性。</p></details>

<details><summary>“添加成功”能否表示已经保存到数据库？</summary><p>本实验不能。它只表示本页 state 已更新，界面已注明刷新丢失。接入真实服务后还要区分提交中、成功和失败。</p></details>

## 阅读定位

★★★★★ Form、Table 是本实验核心；★★★★☆ Select 与 Next.js 集成用于查接口差异和首屏样式；★★★☆☆ [主题定制](https://ant.design/docs/react/customize-theme-cn)留作界面拓展。每次阅读只选与当前问题有关的小节，记录“哪个属性解决什么问题”，不要求背 API 表。

出处：Ant Design 官方中文文档与公开 React API。正文和案例按本课程业务重新编写，不复制官方全文；完整来源与版本记录见 SOURCES.md。
