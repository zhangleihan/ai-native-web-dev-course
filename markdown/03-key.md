# 现代前端基础：语义、布局与事件

## 学习目标与课前准备

学完本讲，应能：写出可键盘操作的案例列表；用数组方法筛选数据；用 DOM 事件更新文本

先修：基本变量和函数；可先读本讲 JavaScript 补充页。本讲 2 学时，按每学时 45 分钟安排：回顾与问题导入 10 分钟、概念和示例 30 分钟、课堂练习 40 分钟、讲评与出口检查 10 分钟。课后练习时间不计入 32 学时。


## 三种语言各负其责

HTML 表达内容和语义，CSS 控制布局与视觉，JavaScript 处理数据和交互。先完成静态内容，再加样式，最后接事件，更容易定位错误。本讲必做案例筛选；花艺瓶和打字游戏为课后**二选一拓展**，不要求在两学时内完成三个应用。

下面是可保存为 HTML 文件直接运行的最小例子。真实 API 从第 5 讲开始，本例明确使用本地 fixture。

```html
<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>案例库 · 本地样本</title>
<style>
  main { max-width: 50rem; margin: auto; padding: 1rem; }
  li { padding: .75rem; border-bottom: 1px solid #ccc; }
  :focus-visible { outline: 3px solid #1261a0; }
</style>
<main>
  <h1>案例库 · 本地样本</h1>
  <label for="kw">标题关键词</label>
  <input id="kw" type="search">
  <p id="status" role="status"></p>
  <ul id="cases"></ul>
</main>
<script>
  const cases = [
    {id: 'case-001', title: '链路中断', industry: 'telecom', difficulty: 'beginner'},
    {id: 'case-002', title: '订单延迟', industry: 'retail', difficulty: 'intermediate'}
  ];
  const input = document.querySelector('#kw');
  const list = document.querySelector('#cases');
  function render() {
    const visible = cases.filter(c => c.title.includes(input.value.trim()));
    list.replaceChildren(...visible.map(c => {
      const li = document.createElement('li');
      li.textContent = c.title;
      return li;
    }));
    document.querySelector('#status').textContent = visible.length
      ? `共 ${visible.length} 个案例` : '没有匹配的案例';
  }
  input.addEventListener('input', render);
  render();
</script>
</html>
```

## 读懂数据到界面的变换

`filter` 保留满足条件的元素；`map` 把每条数据映射为另一种值。回调函数不是“立即处理一个固定值”，而是由数组方法逐项调用。`const` 禁止重新绑定变量，不冻结对象；为后续 React 状态更新，应练习用展开语法生成新数组或新对象。

`addEventListener` 注册回调，输入发生后才调用 `render`。`querySelector` 获取 DOM 节点，不是数据本身。使用 `textContent` 将标题作为文本显示，避免把不可信内容当 HTML 执行。

## 语义与布局检查

输入控件要有 label，按钮用 button，页面主内容用 main，标题层级不要只为字号选择。图片的 alt 根据用途决定：有信息的图片描述信息，纯装饰可设为空，不是所有图片都必须写不同名称。

盒模型包含内容、内边距、边框和外边距；`box-sizing: border-box` 使指定宽度包含 padding 与 border。Flex 用于一维排列，Grid 用于二维网格。先检查 Computed 中实际生效的规则，再调整选择器。外部 CSS、行内样式的先后还受来源、重要性和层叠等因素影响，不应只背“行内一定胜出”。

课内只检查两个宽度和键盘 Tab，不为应用加入组件库、动画或拖拽作为最低要求。


## 自检与参考答案

**问题：** 将用户标题写入 innerHTML 和 textContent 有何不同？

<details><summary>完成思考后查看参考答案</summary>

innerHTML 会解析标签和可能的可执行内容；textContent 把它作为文本。案例标题无须富文本，使用 textContent 更符合需求。

</details>

## 阅读定位

[Full Stack Open Part 1：JavaScript](https://fullstackopen.com/zh/part1/)；本讲补充实验沿用旧课的 Microsoft Web Dev for Beginners 材料，保留原文件署名。

必读范围是本讲正文；参考材料用于查漏补缺，不要求通读整门外部课程。课堂练习与课后练习见本讲后续小节。
