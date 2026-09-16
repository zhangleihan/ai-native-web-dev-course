# 花艺瓶：HTML、CSS 与 DOM

材料：`labs/terrarium/`。三课分别在 `1-intro-to-html`、`2-intro-to-css`、`3-intro-to-DOM-and-closures`。植物图在 `labs/terrarium/solution/images/`（14 张）。成品：[solution/index.html](labs/terrarium/solution/index.html)。

## HTML 骨架（1-intro-to-html）

HTML 是网页骨架。CSS 装扮，JS 让它活。语法上就有 `head`、`body`。

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <title>Welcome to my Virtual Terrarium</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <h1>My Terrarium</h1>
    <div id="page">
      <div id="left-container" class="container">
        <div class="plant-holder">
          <img class="plant" alt="plant 1" id="plant1" src="./images/plant1.png" />
        </div>
      </div>
      <div id="right-container" class="container"><!-- 更多植物 --></div>
    </div>
    <script src="./script.js" defer></script>
  </body>
</html>
```

要点：

- `<!DOCTYPE html>` 让浏览器走标准模式。
- `index.html` 是目录默认页。
- `<img>` 没有结束标签；**每张图写不同的 `alt`**，不要十四株都写 `alt="plant"`。
- `<div>` 块级，`<span>` 行内。标题用 `<h1>`（语义化）。
- 脚本加 `defer`：等 HTML 解析完再跑，拖拽才找得到元素。

对照 FDE `/cases`：页头、搜索 `input`、卡片网格。Ant Design 有时用 `div` 冒充按钮——用花艺瓶的语义标准去批评它。

## CSS（2-intro-to-css）

在 HTML 的 `<head>` 里：`<link rel="stylesheet" href="./style.css" />`。

**层叠：** 行内 `style="color: red"` 压过外部表里的 `h1 { color: blue }`。  
**继承：** `body { font-family: ... }` 会被 `h1` 继承，Computed 里能看到。

| 写法 | 选谁 | 花艺瓶 |
|---|---|---|
| `h1` | 标签 | 标题 |
| `#left-container` | 唯一 id | 左右栏（JS 也靠 id 找植物） |
| `.plant` | 一类 | 所有植物图 |

左右栏不要复制两份几乎一样的 CSS，抽 `.container`。**id 给 JS，class 给样式。**

盒子 = content + padding + border + margin。定位：`static` / `relative` / `absolute` / `fixed` / `sticky`。容器 `absolute` 贴左右；`.plant-holder` 是 `relative`，植物 `absolute` 叠在架上。`z-index` 让植物浮在罐子上方。百分比宽度照顾窄屏。

FDE 的 `Col span={8}` 是栅格，不是手写 `width: 15%`，但先会定位，才知道框架替你藏了什么。口令：**先指出哪条规则在管间距，再让 Agent 改样式。**

## DOM 与闭包（3-intro-to-DOM-and-closures）

DOM 是文档树。`document.getElementById('plant1')` 按 **id** 拿节点（class 会命中一堆）。

拖拽用闭包：外层为 **每一株** 保存自己的 `pos1…pos4`：

```javascript
function dragElement(el) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  el.onpointerdown = pointerDrag;

  function pointerDrag(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onpointermove = elementDrag;
    document.onpointerup = stopElementDrag;
  }
  function elementDrag(e) {
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    el.style.top = el.offsetTop - pos2 + 'px';
    el.style.left = el.offsetLeft - pos1 + 'px';
  }
  function stopElementDrag() {
    document.onpointerup = null;
    document.onpointermove = null;
  }
}
```

完整代码见 `labs/terrarium/solution/script.js`。`onpointerdown` 同时覆盖鼠标和触摸。松手必须把 move/up **置空**。用 `textContent` 写文本，花艺瓶不需要 `innerHTML`。

React 稍后会把「改 `style.top`」藏进声明式渲染。本讲亲手改 DOM，是为了理解 React 替你做了什么。
