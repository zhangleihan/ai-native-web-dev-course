# 打字游戏：用事件、状态与 DOM 完成一次交互

本节依据旧课 `native-web-app-dev/4-typing-game/typing-game` 的完整流程编写。先搭界面，再保存游戏状态，随后完成开始事件、输入分支和结束处理。学习重点是理解“用户操作怎样改变状态，状态又怎样改变界面”。

[打开本节配套成品](labs/typing-game/guided/index.html) · [对照旧课成品](labs/typing-game/solution/index.html)

![旧课打字游戏操作演示](labs/typing-game/images/demo.gif)

动图沿用旧课素材，展示逐词高亮、错误反馈和计时的基本规则。配套版使用短句便于跟练，补充开始前禁用输入、结束状态、完整重置与文字错误提示。

## 1. 先把游戏规则说清楚

玩家点击开始，程序选择一句英文并高亮第一个单词。玩家在输入框中只输入**当前单词**；非最后一词需要在正确单词后按一个空格，才切换到下一词。最后一词输入完整后立即结束，不需要额外空格。大小写和标点都必须匹配。

配套版的测试短句是 `We build web apps.`，其中最后一词是 `apps.`，句号属于单词的一部分。输入 `apps` 只是正确前缀，还没有完成。

| 用户行为 | 游戏应怎样响应 |
|---|---|
| 尚未开始 | 输入框禁用，并显示开始提示 |
| 输入正确前缀 | 保持当前高亮，不推进进度 |
| 拼错、大小写错或多余空格 | 显示错误文字和样式，不推进进度 |
| 正确完成非末词并按空格 | 清空输入，推进一词，移动高亮 |
| 正确完成最后一词 | 显示耗时，禁用输入，等待重新开始 |
| 游戏中重新开始 | 从第一词重新计时，清除旧错误和成绩 |

**学习目标：** 能注册事件回调；用数组、索引和状态描述游戏；解释每个判断分支；安全生成DOM节点；验证未开始、输错、完成和重开的边界。

先修：第3讲JavaScript基础中的变量、函数、数组及条件。完整跟练建议90–120分钟，可分为界面20分钟、开始流程25分钟、输入处理35分钟、调试与练习20分钟；安排为第3讲分段演示和课后练习，不额外增加课程总学时。

## 2. 项目文件与启动方式

```text
labs/typing-game/guided/
├── index.html   界面元素与文件引用
├── index.css    高亮、错误和布局
└── index.js     数据、状态和事件处理
```

旧中文教程将JS/CSS称为script.js/style.css，旧成品实际使用index.js/index.css。两种命名都可以，但HTML中的引用必须与文件名一致。本节统一使用 `index.js` 与 `index.css`。

在自己的工作目录建立这三个文件。教材根目录 `./start.sh` 启动后，配套页为 `http://127.0.0.1:8766/labs/typing-game/guided/index.html`。这是普通HTTP静态页面，不需要安装Live Server，更不应把HTTP服务器地址误写成HTTPS。

每完成一步都查看Console与Network：文档或脚本404属于资源问题，JavaScript异常属于执行问题，样式不生效再检查选择器。不要把三类问题混在一起调试。

## 3. HTML：根据需求找出必须存在的元素

先不要写游戏逻辑，想一想每条需求在哪里显示：

| 元素 | 为什么需要它 | JS会读取/修改什么 |
|---|---|---|
| quote | 展示待输入句子 | 创建span、切换高亮 |
| typed-value | 接收当前单词 | value、disabled、错误状态 |
| feedback | 给出输入过程反馈 | 正确/错误文字 |
| message | 显示最终成绩 | 完成消息与耗时 |
| start | 由用户触发开始 | 监听click |
| quote-choice | 固定样本便于重复测试 | 开始时读取value |

下面是完整 `index.html`，可以直接保存。先建空CSS/JS文件，让浏览器能够加载，再逐节填入。

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>打字游戏 · 分步教学参考</title>
  <link rel="stylesheet" href="./index.css">
  <script src="./index.js" defer></script>
</head>
<body>
  <main>
    <h1>逐词打字练习</h1>
    <p id="instructions">点击开始。每个非末尾单词输入正确后按空格；最后一个单词输入完整即可结束。区分大小写和标点。</p>
    <label for="quote-choice">练习句子</label>
    <select id="quote-choice">
      <option value="random">随机练习</option>
      <option value="0">固定短句：We build web apps.</option>
      <option value="1">固定短句：Small steps make progress.</option>
      <option value="2">固定短句：Read code and test ideas.</option>
    </select>
    <p id="quote" lang="en"></p>
    <label for="typed-value">当前单词</label>
    <input id="typed-value" type="text" disabled autocomplete="off" spellcheck="false" autocapitalize="off" aria-describedby="instructions feedback">
    <p id="feedback" role="status">请先开始游戏。</p>
    <p id="message" role="status"></p>
    <button id="start" type="button">开始 / 重新开始</button>
  </main>
</body>
</html>
```

### 3.1 元素、属性与可访问性

label的for与input的id对应，使标签和输入框建立明确关系。id区分大小写，`typed-value`与`typedValue`不是同一个标识。标签只是描述，不能代替真实输入框。

disabled使输入框在未开始时不能输入，也不能通过Tab获得焦点；JS开始游戏后解除禁用并聚焦。placeholder会随输入消失，不应替代label。

role=status帮助辅助技术获知状态变化，但不要把每个按键都变成冗长播报；本例只提供简短匹配状态与结束消息。错误同时使用文字、边框和aria-invalid，不只用颜色区分。

button明确写 `type="button"`，即使以后把它放进form，也不会默认触发表单提交并刷新页面。`defer`让外部脚本在HTML解析后执行，确保按id能找到元素。

### 3.2 此时应该看见什么

没有JS时应看到标题、句子选择框、空的引文区、被禁用的输入框与开始按钮。点击按钮暂时没反应是正常的：HTML只提供控件，不会自动实现随机选句和计时。

**动手：** 暂时删除label中的for，再点击标签，比较输入关联；完成后恢复。把script文件名写错一次，在Network确认404再修复。

## 4. CSS：把游戏状态表达为样式

先关注两类规则：

```css
.highlight { background: #fff19b; text-decoration: underline; }
.error { background: #fff0ed; border: 2px solid #a92e1b; }
```

highlight加在引文中“当前单词”的span上，error加在输入框上。它们作用于不同的DOM元素。输入框变红并不等于程序已经阻止了错误推进；真正的状态控制由JavaScript完成。

旧教程示例中 `border: red` 没有明确设置可见线型与宽度，本节写全border。浏览器默认样式可以不同，不应依赖偶然的默认边框效果。

完整 `index.css` 如下。布局规则服务于阅读，先完成核心高亮与错误状态，再调整配色。

```css
* { box-sizing: border-box; }
body { margin: 0; padding: 1rem; color: #23352e; background: #f3f6f1; font: 1rem/1.7 system-ui, sans-serif; }
main { max-width: 720px; margin: 2rem auto; padding: 2rem; border: 1px solid #d1dfd2; border-radius: 12px; background: white; }
label { display: block; margin-top: 1rem; font-weight: 600; }
input, select, button { max-width: 100%; font: inherit; padding: .6rem .8rem; border: 1px solid #849b8c; border-radius: 6px; }
input, select { width: 100%; }
#quote { min-height: 3rem; font-size: 1.35rem; }
#quote span { white-space: pre-wrap; }
.highlight { background: #fff19b; text-decoration: underline; text-underline-offset: .2em; }
.done { color: #56705d; }
.error { background: #fff0ed; border: 2px solid #a92e1b; }
button { background: #285b45; color: white; cursor: pointer; }
:focus-visible { outline: 3px solid #b97a11; outline-offset: 3px; }
#message { font-weight: 700; }
```

`white-space:pre-wrap`保留span末尾的空格并允许换行；`.done`标记已完成的词，`.highlight`标记当前词。稍后使用classList只增删相关类，避免 `className=''` 意外清除其他样式。

**检查点：** 先在Elements里手工给输入框添加error类，确认样式能出现；再移除。若样式正确而游戏中不出现，就应检查事件与判断，而不是继续改CSS。

## 5. 事件驱动：什么时候执行与执行什么分开

程序载入时按顺序声明数据、创建函数并注册监听器；用户点击或输入之后，浏览器才调用相应回调。回调内部依然是顺序执行，不是“用了事件以后代码就没有顺序”。

```javascript
startButton.addEventListener('click', startGame);
typedValueElement.addEventListener('input', handleInput);
```

`startGame`是函数引用；写 `startGame()`会立刻调用，再把返回值拿去注册，通常不是你想要的。监听器本节只注册一次，不能每次点击开始又注册一个新的input回调，否则一次输入可能推进多次。

为什么选input而不是只选keydown？input关注输入框内容的变化，能覆盖键盘输入、粘贴、删除等；keydown关注按键，还会收到方向键、Shift等未改变文本的操作。给 `.value` 赋值一般不会自动触发input，本例清空当前词不会递归调用自己。

中文等输入法可能经过组合阶段，本例遇到 `event.isComposing` 先返回，避免把尚未确认的拼写当作最终内容。**本课规则仍是英文按空白分词**；不能把这套split和逐词输入原样称为完整中文打字练习。

## 6. 先定义状态，再写DOM操作

### 6.1 五个变量分别记录什么

```javascript
const quotes = [
  'We build web apps.',
  'Small steps make progress.',
  'Read code and test ideas.'
];
let words = [];
let wordIndex = 0;
let startTime = 0;
let status = 'idle';
```

quotes是句子数组；words是本局当前句子拆成的单词数组，两者不能混为一谈。wordIndex是“当前正在输入的词”的索引，从0开始。startTime在真正开始时记录，不在页面刚加载时计入用户尚未开始的等待。

status只有idle、playing、finished三种值，用来阻止未开始或已完成时继续处理输入。不要只凭输入框的外观猜测状态；程序逻辑应有清晰的依据。

| 时刻 | words | wordIndex | status | 输入框 |
|---|---|---|---|---|
| 刚打开 | [] | 0 | idle | 禁用 |
| 固定句开始 | [We, build, web, apps.] | 0 | playing | 空、可输入 |
| 输入We加空格 | 同一数组 | 1 | playing | 清空 |
| 正在输入apps | 同一数组 | 3 | playing | 尚缺句号 |
| 输入apps.完成 | 同一数组 | 3 | finished | 禁用，保留最后一词 |

完成后不一定非要把wordIndex增加到数组长度；本例让它停在最后一个有效索引，使用status阻止进一步处理。状态设计只要保持一致即可。

### 6.2 将变量与页面节点连接

```javascript
const quoteElement = document.getElementById('quote');
const messageElement = document.getElementById('message');
const typedValueElement = document.getElementById('typed-value');
const feedbackElement = document.getElementById('feedback');
const quoteChoice = document.getElementById('quote-choice');
const startButton = document.getElementById('start');
```

这些const保存DOM节点引用；修改节点的textContent不等于重新给const赋值。文本节点内容用textContent，表单控件当前内容用value，不能把 `typedValueElement.textContent` 当作用户正在输入的字符串。

## 7. 开始事件：按可解释的顺序初始化

### 7.1 选择一句话

随机版本使用 `Math.floor(Math.random() * quotes.length)`。当数组长3时，Math.random得到 `[0,1)` 的数，乘3得到 `[0,3)`，向下取整只可能是0、1、2。若使用Math.round，可能得到越界的3，而且各索引概率不均。

配套版也可选固定句子，便于复现测试。选择框的value是字符串，所以固定编号使用Number转换。下拉框是在**下次点击开始时**读取，进行中改选项不会悄悄替换本局。

### 7.2 拆词与创建高亮对象

```javascript
words = quotes[quoteIndex].trim().split(/\s+/);
wordIndex = 0;
```

旧课用 `split(' ')`，适合原来整齐的单空格句子；这里先trim，再按连续空白分割，避免多空格产生空词。这个处理不等于支持任意语言的自然语言分词。内置句子非空；如果将来允许自定义文本，还需要先拒绝空句。

每个词对应一个span，才能独立高亮：

```javascript
quoteElement.replaceChildren(...words.map(word => {
  const span = document.createElement('span');
  span.textContent = word + ' ';
  return span;
}));
quoteElement.children[0].classList.add('highlight');
```

map把字符串数组变成元素数组；`...`把数组展开成replaceChildren的多个参数，一次替换旧句子的节点。它不是把每个字符拆成一个参数。span中的尾随空格用于显示，words数组里的单词本身不带这个空格。

旧课通过字符串模板加innerHTML创建span。本课使用createElement和textContent，使内容按文本处理，避免以后换成用户提供的句子时把标签执行为HTML。

这里用children只获取子元素；childNodes还可能包含空白文本节点。如果HTML格式化换行后出现额外text节点，按childNodes索引高亮可能选错对象。理解节点类型比记住某个写法更重要。

### 7.3 重置整局，而不只清空一个输入框

开始需要同时重置：词列表、当前索引、状态、全部引文节点、成绩文本、输入内容、disabled、错误类、aria-invalid、反馈和起始时间。漏掉任何一项都可能让上一局状态留到下一局。

开始时把焦点放到输入框，玩家不必再点一次。使用performance.now记录单调时钟读数，结束时做差即可得到耗时；这里不需要setInterval持续每秒加一。

## 8. 输入事件：四种情况按顺序判定

首先执行守卫：`if (status !== 'playing' || event.isComposing) return;`。然后读取currentWord和typedValue。不要在检查状态前对可能为undefined的currentWord调用startsWith。

下面先做手工推演，再看完整代码。假设当前词是We，并且不是最后一词：

| typedValue | 匹配分支 | wordIndex是否变化 | 用户反馈 |
|---|---|---|---|
| 空字符串 | 正确前缀 | 不变 | 前缀正确 |
| W | 正确前缀 | 不变 | 前缀正确 |
| Wx | 错误 | 不变 | 错误提示 |
| We | 正确前缀，等待分隔符 | 不变 | 前缀正确 |
| We加一个空格 | 完成非末词 | 加1 | 清空并高亮下一词 |
| we加空格 | 错误 | 不变 | 大小写不匹配 |
| 前导空格再We | 错误 | 不变 | 多余空格不被忽略 |

### 8.1 最后一词完成：必须先识别终止

条件是“当前索引为最后一词，且输入与完整单词相等”。先处理它，避免结束后继续高亮不存在的下一个span。

例如最后一词是apps.，输入apps只属于正确前缀；输入apps.才结束。结束设置status为finished、去掉高亮并标记done、禁用输入、显示成绩。监听器仍然存在，但状态守卫保证以后不会再次计分。

### 8.2 非最后一词完成：一个明确的分隔规则

本课条件为 `!isLast && typedValue === currentWord + ' '`。只有完整单词加一个空格才推进。随后清空value、索引加1、给下一span增加highlight。

旧代码的 `endsWith(' ') && trim() === currentWord` 较宽松，会忽略首尾多余空白。这里使用严格规则是为了使验收清楚，两种设计都可讨论，但不能正文说严格匹配、实现却悄悄trim掉错误。

### 8.3 输入仍是正确前缀

`currentWord.startsWith(typedValue)`的接收者应是目标单词。例如 `'build'.startsWith('bu')` 为true，而 `'bu'.startsWith('build')` 为false。方向写反会让用户刚输入第一个字母就被判错。

前缀正确只表示“到目前为止没错”，不是完成；空字符串也是每个字符串的前缀，因此删除全部输入后应清除错误，不推进索引。

### 8.4 其他输入判错，但允许修正

给输入框增加error类并显示具体提示；不增加wordIndex，不清空用户内容，让玩家用Backspace修正。修正后会再次触发input，正确前缀分支移除错误。

本例未禁止粘贴，因此它是事件练习，不是防作弊的打字速度考试。粘贴完整多词句子也不会自动逐词消费；它只与当前词比较。不要为提高演示“流畅度”而偷偷跳过这种约束。

## 9. 完整 JavaScript：可以直接保存运行

以下全部内容保存为 `index.js`。第6–8节代码是用于解释的片段，不要先粘贴片段，再把完整文件追加一次，造成变量重复声明或重复注册监听器。

```javascript
// Teaching adaptation of native-web-app-dev/4-typing-game.
const quotes = [
  'We build web apps.',
  'Small steps make progress.',
  'Read code and test ideas.'
];
let words = [];
let wordIndex = 0;
let startTime = 0;
let status = 'idle';

const quoteElement = document.getElementById('quote');
const messageElement = document.getElementById('message');
const typedValueElement = document.getElementById('typed-value');
const feedbackElement = document.getElementById('feedback');
const quoteChoice = document.getElementById('quote-choice');
const startButton = document.getElementById('start');

startButton.addEventListener('click', startGame);
typedValueElement.addEventListener('input', handleInput);

function startGame() {
  const quoteIndex = quoteChoice.value === 'random'
    ? Math.floor(Math.random() * quotes.length)
    : Number(quoteChoice.value);
  words = quotes[quoteIndex].trim().split(/\s+/);
  wordIndex = 0;
  status = 'playing';
  quoteElement.replaceChildren(...words.map(word => {
    const span = document.createElement('span');
    span.textContent = word + ' ';
    return span;
  }));
  quoteElement.children[0].classList.add('highlight');
  messageElement.textContent = '';
  typedValueElement.value = '';
  typedValueElement.disabled = false;
  typedValueElement.classList.remove('error');
  typedValueElement.setAttribute('aria-invalid', 'false');
  feedbackElement.textContent = '请输入第 1 个单词。';
  typedValueElement.focus();
  startTime = performance.now();
}

function handleInput(event) {
  if (status !== 'playing' || event.isComposing) return;
  const currentWord = words[wordIndex];
  const typedValue = typedValueElement.value;
  const isLast = wordIndex === words.length - 1;

  if (isLast && typedValue === currentWord) {
    const seconds = (performance.now() - startTime) / 1000;
    status = 'finished';
    markCompleted(wordIndex);
    showError(false);
    typedValueElement.disabled = true;
    feedbackElement.textContent = '所有单词已完成。';
    messageElement.textContent = `完成！用时 ${seconds.toFixed(2)} 秒。`;
    startButton.focus();
  } else if (!isLast && typedValue === currentWord + ' ') {
    markCompleted(wordIndex);
    wordIndex += 1;
    typedValueElement.value = '';
    quoteElement.children[wordIndex].classList.add('highlight');
    showError(false);
    feedbackElement.textContent = `请输入第 ${wordIndex + 1} 个单词。`;
  } else {
    showError(!currentWord.startsWith(typedValue));
  }
}

function markCompleted(index) {
  const span = quoteElement.children[index];
  span.classList.remove('highlight');
  span.classList.add('done');
}
function showError(wrong) {
  typedValueElement.classList.toggle('error', wrong);
  typedValueElement.setAttribute('aria-invalid', String(wrong));
  feedbackElement.textContent = wrong ? '当前输入不匹配，请检查大小写、标点和空格。' : '输入前缀正确。';
}
```

两个辅助函数把“推进逻辑”和“界面表达”分开：markCompleted只处理某个span的类；showError统一处理错误样式、aria-invalid与文字。它们不负责增加索引，避免一个操作在多个函数里重复推进。

`classList.toggle('error', wrong)`的第二个参数是强制是否存在这个类；不是每次盲目取反。若只写toggle('error')，连续两次错误输入可能把错误样式关掉。

`toFixed(2)`仅格式化最终显示，返回字符串。内部耗时仍是两个时钟读数相减；不是先把时间变成字符串再相减。完成后焦点回到开始按钮，方便键盘开启下一局。

## 10. 亲手走一遍数据与事件

固定选择 `We build web apps.`，把断点设在handleInput内：

1. 点击开始：检查words长度为4、wordIndex为0、status为playing。
2. 输入W：currentWord为We，typedValue为W，只有前缀分支成立。
3. 再输入x：typedValue为Wx，error出现；wordIndex仍为0。
4. 删除x并输入e和空格：进入非末词完成分支，wordIndex变1，value被清空。
5. 依次输入build加空格、web加空格：wordIndex依次变2、3。
6. 输入apps：没有结束；再输入句号：状态finished、成绩出现、输入禁用。
7. 再次开始：成绩清空、当前索引回0，之前的done类不应残留。

调试时可以临时写 `console.log({status, wordIndex, currentWord, typedValue})`，但放在读取变量之后，完成验证后移除。看到同一输入打印多次，先检查是否重复注册监听器，不要先怀疑浏览器。

## 11. 边界测试与排错表

| 测试 | 预期结果 |
|---|---|
| 未点开始尝试输入 | 输入框禁用，无异常 |
| 正确前缀→错误→Backspace修正 | 错误出现后可清除，进度未被跳过 |
| 同一局中重复点开始 | 从头开始，旧成绩/错误/输入均清空 |
| 非末词只输入完整单词但无空格 | 不推进 |
| 最后一词缺句号或大小写不符 | 不结束 |
| 最后一词完整 | 只结算一次，输入禁用 |
| 完成后再次开始 | 恢复可输入，从第一词重新计时 |
| 输入前导空格或两个尾随空格 | 按严格匹配规则处理，不自动trim |
| 只用键盘操作 | 可启动、输入、读到反馈并重新开始 |

“两尾随空格”需要理解事件时机：逐个按键时，第一个空格已完成上一词，第二个空格会进入**下一词**的输入框并报错；一次粘贴两个尾随空格则仍在当前词报错。结果不同来自事件序列，不是程序随机执行。

| 现象 | 常见原因 | 排查方法 |
|---|---|---|
| 点击开始无反应 | JS未加载、id错误、监听器绑定失败 | 查Network与Console第一条错误 |
| `startsWith`读undefined | 未开始就处理输入、索引越界 | 查status守卫与wordIndex范围 |
| 一输入就报错 | startsWith方向反了 | 用固定词和前缀在Console验证 |
| 一次空格跳两词 | 多次注册input监听 | 查开始回调是否又addEventListener |
| 旧高亮留在页面 | 重开未替换DOM、样式清理不完整 | 查replaceChildren与状态重置 |
| 完成后成绩不停变化 | 没有finished状态或输入仍在处理 | 查终止分支与守卫 |
| 句子中出现HTML标签效果 | 使用innerHTML插入不可信字符串 | 改用textContent创建节点 |

## 12. 自检与参考答案

<details><summary>1. 为什么只把wordIndex设为0还不算“重新开始”？</summary>

上一局的DOM高亮、错误类、输入内容、disabled、成绩和开始时间仍可能存在。重开应同时重置数据状态与它的界面表达。

</details>

<details><summary>2. 正确词前缀与正确完整单词有什么差别？</summary>

前缀表示目前字符匹配，不一定完成。非末词还需要分隔空格确认；末词按本规则完整匹配即可结束。分支判断必须反映这两种规则。

</details>

<details><summary>3. 将输入框value设为空字符串，为什么不会无限递归触发input？</summary>

JavaScript直接设置value通常不会自动产生用户input事件。下一次用户编辑才触发新的处理；如代码主动dispatchEvent则是另外一种设计，本例未这样做。

</details>

<details><summary>4. 有没有必要每局结束时removeEventListener？</summary>

可以采用移除/重绑方案，但需要保存同一函数引用并避免重复注册。本例只注册一次，通过status守卫与disabled控制，更容易解释和重置。

</details>

<details><summary>5. 用localStorage保存耗时后，它是否成了可信的比赛排名？</summary>

不是。浏览器数据可被用户修改，而且不同句子难度不同。本节最多把它当作本机练习记录；真实排名需要另行设计校验、账号和公平规则。

</details>

## 13. 作业与分层评价

**基础必做：** 实现三文件，使用固定四词短句，交付“未开始、输入错误、修正、完成、重开”五个场景的操作记录。写出一次输入的currentWord、typedValue、wordIndex变化，并说明命中的分支。

**改进二选一：** ①增加“正确完成的词数/总词数”进度显示，只在真正完成词时推进；②按句子编号保存本机最佳耗时，说明为何不同句子不能直接比较，处理localStorage读取失败或无记录的情况。先写规则，再动代码。

**开放任务：** 沿用旧课“设计另一款键盘游戏”的思路，设计一个小游戏，并提交“状态—事件—状态变化—界面更新”的表，而不是只交一个热闹的界面。可以是单词接龙或键盘移动小方块，不要求引入Canvas或游戏引擎。

评价建议：规则与状态正确30%、事件与DOM处理25%、边界测试25%、解释和可访问反馈20%。在已有课程平时练习中安排，不另改10%/40%/50%总比例。

## 14. 从这个小游戏迁移到 React

这里手动修改span类和输入框disabled；React中通常把words、wordIndex、status等放入组件状态，再从状态推导高亮和禁用属性。**需要保留的是规则和状态设计，不是把每条DOM操作搬进Effect。**

例如“当前索引是否等于某个词索引”可直接决定类名，“status不是playing”可决定输入禁用。无论用不用框架，都必须回答同一个问题：输入事件到来时，当前状态允许做什么，哪些数据需要更新？

来源：旧课[使用事件建立游戏](labs/typing-game/typing-game/translations/README.zh-cn.md)与[键盘游戏作业](labs/typing-game/typing-game/translations/assignment.zh-cn.md)，原材料来自Microsoft Web Dev for Beginners。旧成品保留原引用句子及代码；本节改用新编短句，补全状态与边界处理，不覆盖原文件。

完整配套文件：[HTML](labs/typing-game/guided/index.html)、[CSS](labs/typing-game/guided/index.css)、[JavaScript](labs/typing-game/guided/index.js)。[MDN input事件](https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event)用于核对事件触发与组合输入语义。
