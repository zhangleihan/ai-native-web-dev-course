# React订阅教程：把连接作为外部系统管理

## 1. 从原生EventSource开始

在运行中的实验页面打开浏览器控制台，使用页面已经创建的实际任务id。以下代码用于独立观察，不会创建任务；观察结束应手动close。

```javascript
const taskId = '替换为页面上的任务id';
const source = new EventSource(`/api/tasks/${taskId}/events`);
source.addEventListener('progress', event => {
  console.log('事件编号', event.lastEventId, JSON.parse(event.data));
});
source.addEventListener('reset', event => {
  console.log('历史不足，恢复快照', JSON.parse(event.data));
});
source.addEventListener('done', event => {
  console.log('最终业务状态', JSON.parse(event.data).status);
  source.close();
});
source.onerror = () => console.log('连接状态', source.readyState);
```

原生EventSource通过GET订阅；构造选项支持凭据设置，但不提供任意Authorization请求头或POST请求体。需要提交参数时，先POST创建任务，再GET订阅。若必须以POST直接读取流，可选择fetch流方案，并自行实现相应解析与恢复。[SSE规范接口](https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface)

## 2. 为什么连接要放在Effect中

React渲染描述界面；订阅是对外部系统的连接，不能直接写在组件函数体里。否则每次进度触发setState，组件再渲染时都可能新增一个连接。

Effect在任务编号改变时建立订阅，在切换任务或组件卸载时关闭旧连接。其清理函数应与建立过程对应。开发环境StrictMode可能额外执行一次建立与清理，借此暴露遗留订阅；不应通过去掉清理来掩盖问题。[React useEffect](https://react.dev/reference/react/useEffect)

## 3. 一个可以独立理解的基础组件

以下完整组件只演示首次订阅、状态显示和卸载清理，可放入现有React项目。传入同一实验服务上的taskId；同源API仍由本讲Express提供。这个基础版没有实现手动续传、重复事件去重或完整字段校验，完整版本见配套client/stream.js。

```jsx
import {useEffect, useState} from 'react';

export function TaskStatus({taskId}) {
  const [snapshot, setSnapshot] = useState(null);
  const [connection, setConnection] = useState('连接中');
  useEffect(() => {
    let active = true;
    setSnapshot(null);
    setConnection('连接中');
    const source = new EventSource(`/api/tasks/${taskId}/events`);
    function update(event) {
      if (!active) return;
      try {
        const data = JSON.parse(event.data);
        if (data.id !== taskId) throw new Error('任务编号不匹配');
        setSnapshot(data);
        return true;
      } catch {
        source.close();
        setConnection('事件格式错误，请查询快照');
        return false;
      }
    }
    for (const name of ['state', 'progress', 'snapshot', 'reset']) {
      source.addEventListener(name, update);
    }
    source.onopen = () => {
      if (active) setConnection('已连接');
    };
    source.addEventListener('done', event => {
      const valid = update(event);
      source.close();
      if (active && valid) setConnection('本次订阅结束');
    });
    source.onerror = () => {
      if (active) setConnection(source.readyState === EventSource.CLOSED
        ? '连接已停止，请重试' : '连接中断，正在重连');
    };
    return () => { active = false; source.close(); };
  }, [taskId]);
  return <section>
    <p>连接：{connection}</p>
    <p>业务：{snapshot?.status ?? '尚未同步'}</p>
    <p>步骤：{snapshot ? `${snapshot.step}/${snapshot.total}` : '—'}</p>
  </section>;
}
```

每次切换任务会先清空旧快照。JSON.parse成功只代表语法正确，完整实现还验证任务id、状态枚举、整数序号和步骤范围。界面按文本插值显示消息，不将事件内容直接交给innerHTML。

## 4. 将“创建”和“订阅”放在不同位置

配套client/main.jsx中的创建按钮只发一次POST，取得快照后保存到state。`Task`组件通过`key={initial.id}`为不同任务建立独立的页面状态，再由useTaskStream观察该任务。

```jsx
const task = await request('/tasks', {
  method: 'POST',
  body: JSON.stringify({scenario: 'normal'})
});
setInitial(task);
```

这段是点击处理函数中的摘录。重连只重新打开events地址；不要在onerror里重新POST，否则一次网络抖动可能变成多个业务任务。

## 5. 用state呈现界面，用ref保存处理位置

| 数据 | 本实验存放位置 | 原因 |
|---|---|---|
| 当前快照task | useState | 变化需要重新显示业务状态与进度 |
| 连接说明connection | useState | 需要向用户说明中断、重连或结束 |
| 已接收日志rows | useState | 更新可见列表 |
| 已处理事件序号cursor | useRef | 事件处理时立即读取，不单独驱动渲染 |
| 最新快照latest | useRef | 防止晚到的旧快照覆盖更新结果 |
| 当前查询控制器 | useRef | 新查询或卸载时取消失效fetch |

ref并不是比state更好的通用存储。把界面应该响应的数据只放到ref，会出现数据变了但页面不更新；把连接对象每次写入依赖又可能不断重建Effect。

## 6. 去重与快照更新是两个动作

完整实验检查事件编号与JSON中的seq一致。对同一任务，编号不大于cursor的历史事件不重复追加。更新日志使用函数形式，避免回调捕获过时数组：

```javascript
if (seq > cursor.current) {
  cursor.current = seq;
  setRows(old => [...old, {seq, type: kind, message: data.message}].slice(-30));
}
```

这里省略了前面的字段校验。`rows`只保留页面最近30条；服务器历史与页面日志上限是两个不同限制。当前小实验事件很少，生产页面仍需设置容量，不能随连接时间无限增长。

用户手动查询快照时，服务器状态可能比尚未消费的历史事件更新。完整实验以seq比较快照新旧，避免旧事件让进度倒退；这些历史仍可按序追加到日志。不能把“状态不倒退”与“所有日志都已经收到”当作同一件事。

## 7. 自动重连与手动重订阅

同一个EventSource因连接中断而重连时，浏览器可携带最近事件的Last-Event-ID。主动close后再new一个EventSource是新的对象，不会继承原对象内部位置。本例在ref里保存cursor，新对象通过`?after=4`表达起点。

服务端优先使用Last-Event-ID头，否则使用after查询值。这个顺序很重要：第一次URL里的after可能是4，浏览器后来已收到6；再次自动重连时应从6继续，而不是退回4。

`onerror`不是“任务执行失败”回调。完整实验在CONNECTING时保留重连，连续3次未成功建立连接后停止并显示人工重试入口；成功open后重新计数。若浏览器已进入CLOSED，提示查询快照或重新订阅。这个次数是本课的界面策略，不是SSE协议要求。

## 8. 依赖项决定什么时候重新建立连接

完整Hook依赖任务id、稳定的accept回调、订阅开关和显式重试计数。每条进度只更新快照与日志，不改变这些依赖；状态从RUNNING变为COMPLETED也不会先拆掉连接再重新接收历史。

accept使用useCallback保持引用，任务id变化时才更新；最新状态通过ref读取。这样既避免遗漏依赖，也避免把不断变化的task对象整个放入依赖造成反复订阅。

## 9. 五个按钮的语义

“停止订阅”仅关闭当前观察连接；“重新订阅”按已知位置恢复；“查询快照”发一次GET确认当前状态；“取消任务”发POST改变服务端任务。“从头订阅”将本页面消费位置重置为0，再订阅同一个任务，用于观察完整重放或历史缺口。只有取消任务会改变业务状态。

演示时先停止订阅，过一会儿查询快照，能够看到服务端已继续推进。再重新订阅，确认收到补发；等待任务完成后点“从头订阅”，确认历史不足时收到reset。不要为了让界面“整齐”，在停止订阅时把任务强行标为CANCELLED。

## 检查点

<details><summary>为什么不能把rows直接加入订阅Effect的依赖？</summary><p>每条事件都会更新rows，导致关闭后再次建连。日志追加使用函数式setState，订阅由任务与显式操作控制。</p></details>

<details><summary>新EventSource会自动记住上一个对象收到的编号吗？</summary><p>不会。本例显式保存cursor，通过after传入新对象；自动重连则由同一EventSource维护Last-Event-ID。</p></details>

完整源码可从[实验说明](labs/realtime-basics/README.md)定位。继续阅读[恢复、取消与部署](#/part/9/f)。
