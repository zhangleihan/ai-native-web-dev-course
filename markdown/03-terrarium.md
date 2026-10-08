# 花艺瓶：从 HTML 结构到 CSS 布局、DOM 与闭包

本节按照旧课 `native-web-app-dev/3-terrarium` 的三段课程重新编排：先搭结构，再写样式，最后实现拖动。每一步都应保存、刷新并观察结果，而不是一次粘贴全部代码后才运行。

**完成后的作品：** 左右植物架各有7株植物，中间是CSS画出的花艺瓶；植物可被拖动，松手后停止，也能通过键盘方向键调整位置。它是纯前端应用，刷新会复位，暂不涉及服务器、数据库或React。

[打开本节配套成品](labs/terrarium/guided/index.html) · [对照旧课成品](labs/terrarium/solution/idx.html)

![旧课花艺瓶效果参考](labs/terrarium/2-intro-to-css/images/terrarium-final.png)

图为旧课素材中的效果参考；本节配套版调整了画布和配色，学习目标与旧课一致。

## 1. 学习目标与跟练安排

完成后应能：

- 解释HTML元素、属性、id/class及相对路径，写出具有标题和图片的页面。
- 利用选择器、继承、盒模型和定位，将HTML结构变成布局。
- 区分DOM节点、CSS样式与JavaScript中的坐标值。
- 计算一次拖动的位移，说明按下、移动、松开各发生什么。
- 用闭包解释为什么14株植物不会共享同一组拖动状态。

先修：变量、函数、条件、数组及事件回调。建议分成HTML 30分钟、CSS 40分钟、DOM与拖动50分钟三次跟练；这是完整实践的学习用时建议，**不为32学时课程额外加课**。第3讲可选其中一段现场演示，其余课前/课后完成。

阅读路线：第2–4节搭结构 → 第5–7节做布局 → 第8–11节理解交互 → 第12–14节测试与练习。初学者先不做越界限制、存储和复杂动画。

## 2. 文件准备：先让浏览器找到资源

配套版位于 `labs/terrarium/guided/`，使用三个文件：

```text
labs/terrarium/
├── guided/
│   ├── index.html     页面结构
│   ├── style.css      布局和视觉
│   └── script.js      事件与拖动
└── solution/images/   沿用旧课14张植物图片
```

你可以复制 guided 为自己的工作目录，但不要覆盖原始 solution 或已有个人作业。若目录层级不变，图片路径仍可使用 `../solution/images/plant1.png`；若单独建立一个terrarium文件夹，则将图片放入它的 `images/`，并把路径改为 `./images/plant1.png`。

从教材根目录运行 `./start.sh` 后，配套页面地址为 `http://127.0.0.1:8766/labs/terrarium/guided/index.html`。不需要安装前端框架或新的编辑器插件。

**路径推演：** 浏览器加载 `guided/index.html` 时，`./style.css` 指向guided目录，`../solution/images/plant1.png` 先回到terrarium再进入solution。路径以HTML文档地址为基准，不以你在终端中看见的文件夹名称为基准；CSS中的相对资源路径则相对于CSS文件。

**检查点：** Network里HTML、CSS、JS和图片都应成功加载。图片显示不出来时先看请求路径和404，不急着改定位代码。

## 3. HTML：先把内容放进正确的结构

### 3.1 一个能够独立打开的页面

先在新建的 `index.html` 中写出骨架。此时可以暂时不引入脚本：

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>我的花艺瓶</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <h1>我的花艺瓶</h1>
  <p>把植物移动到花艺瓶中。</p>
  <main id="page"></main>
</body>
</html>
```

`<!doctype html>` 让现代浏览器按标准模式处理文档，不是“通过查询字符串选择HTML版本”。`html` 是根元素，`lang` 告诉浏览器和辅助技术主要语言。`head` 放编码、标题、样式等元信息；`body` 放可见内容。标签页标题来自 `title`，页面中可见的大标题来自 `h1`，两者并不互相替代。

`meta viewport` 帮助移动设备按设备宽度建立布局视口，但它不会自动把不合理的固定布局变成响应式设计。旧课中的IE兼容声明不再作为本节必写项。

### 3.2 id、class与嵌套关系

在main内部先放两个架子，各放一株植物：

```html
<div id="left-container" class="container">
  <div class="plant-holder">
    <img class="plant" id="plant1" src="../solution/images/plant1.png"
         alt="盆栽 1" draggable="false">
  </div>
</div>
<div id="right-container" class="container">
  <div class="plant-holder">
    <img class="plant" id="plant8" src="../solution/images/plant8.png"
         alt="盆栽 8" draggable="false">
  </div>
</div>
```

一株植物使用两个元素：`plant-holder` 占据架子上的位置，`img.plant` 才是实际移动的图像。以后拖走图像时，架子仍保留原槽位。不要为了少一层div而在尚未理解布局时删除holder。

| 结构/属性 | 用途 | 本例中的规则 |
|---|---|---|
| id | 在当前文档唯一标识元素 | plant1与plant8不同，不重复使用 |
| class | 让一组元素具有共同类别 | 全部植物都可有plant类 |
| src | 图像资源地址 | 是属性，不是一个子元素 |
| alt | 图像的替代信息 | 用途为植物选择，应能区分；真实作品可写实际外观描述 |
| draggable="false" | 关闭图像原生拖放 | 本课自己处理Pointer Events |

`img` 是空元素，不写 `</img>`；这不是因为“有了src就不需要结束标签”。id可以被CSS选择，class也可以被JavaScript查找，并非语言规定“id只能给JS、class只能给CSS”。本例这样分工只是便于理解。

把左侧扩充为plant1–plant7、右侧扩充为plant8–plant14，每株都有自己的holder。重复的是结构，变化的是id、图片文件名和替代文字。完整14株HTML见本节末尾的文件链接。

### 3.3 语义与可访问性

主内容使用main，主标题使用h1；div只负责没有专门语义的布局分组。不要为得到大字号，把普通文字都改成h1。装饰性的瓶壁、泥土和反光不需要逐一被读屏器朗读，因此将瓶子的装饰容器设为 `aria-hidden="true"`。

配套版植物增加 `tabindex="0"`，让它进入自然Tab顺序，并用 `aria-describedby="instructions"` 关联操作说明。仅有tabindex还不能提供键盘拖动，必须配合后面的keydown逻辑。它是教学用的基础键盘操作，不声称已经覆盖所有无障碍需求。

**检查点：** 暂时禁用CSS，能否看到标题和14张图片？是否有重复id？故意改错一张图片路径，观察alt和Network，再恢复。

## 4. 花艺瓶的结构：没有内容的div为何看不见

把下面容器放在main内、两个植物架之后：

```html
<div id="terrarium" aria-hidden="true">
  <div class="jar-top"></div>
  <div class="jar-walls">
    <div class="jar-glossy-long"></div>
    <div class="jar-glossy-short"></div>
  </div>
  <div class="dirt"></div>
  <div class="jar-bottom"></div>
</div>
```

这里没有“瓶子图片”。瓶口、瓶壁、土和反光都由CSS的宽高、背景与圆角画出。没有样式时，空div往往没有可见内容或高度，因此看不见并不表示HTML未加载。

先检查Elements里是否有这些节点，再为其添加尺寸和背景。如果节点本来就不存在，继续改颜色不会解决问题。

## 5. CSS基础：从一条规则到可解释的结果

### 5.1 选择器、声明与继承

```css
body { font-family: system-ui, sans-serif; color: #263c32; }
h1 { text-align: center; }
.container { background: #e8eee8; }
#left-container { left: 0; }
```

规则由选择器和声明块组成；声明由属性、冒号、值组成。`h1`选标签，`.container`选同类架子，`#left-container`选唯一左架。只在左右不同的地方写id规则，共同的尺寸和颜色放进.container，避免复制两大段几乎相同的CSS。

字体、文字颜色常沿父子关系继承；宽度、边框、margin等并非默认都继承。打开Elements → Computed查看最终字体与来自哪条规则，不能仅凭“子元素套在父元素里”推断所有样式都相同。

### 5.2 用一个小实验理解层叠

给h1临时加 `style="color:red"`，再在外部样式写 `h1 { color:blue; }`。在普通作者样式这一条件下，行内声明会胜过普通选择器。随后移除行内style，蓝色才生效。

这是一个受控实验，不是“行内样式永远最高”的完整规则。来源、重要性、层叠层、选择器优先级与顺序都可能影响结果。本节先学会从Computed追踪胜出的声明，不靠不断添加 `!important` 调试。

### 5.3 盒模型决定实际尺寸

```css
* { box-sizing: border-box; }
```

一个盒子包含content、padding、border；margin是盒外间距。`border-box`让写下的width包含内边距和边框，便于计算左右植物架。它不会把margin也算进width。

**动手：** 为container加10px padding，分别启用/禁用border-box，看边界是否超过预想宽度；在开发者工具盒模型视图中指出四个区域。

## 6. 布局与定位：植物到底相对谁移动

### 6.1 先建立有尺寸的画布

旧课将左右架直接贴近视口。配套版增加有明确高度的 `#page`，把比例和坐标限定在可观察的画布中：

```css
#page { position: relative; height: 640px; }
.container { position: absolute; top: 0; width: 17%; height: 100%; padding: 10px; }
#left-container { left: 0; }
#right-container { right: 0; }
.plant-holder { position: relative; height: 14%; }
.plant { position: absolute; top: 0; left: 0; width: 100%; height: 105%; }
```

植物架脱离普通文档流，通过left/right贴到画布两侧；holder仍在植物架内部按顺序排列。7个holder约占架子内容高度的98%，留少量空间。百分比高度要有可确定的包含块高度才能按预期计算；若去掉画布高度，不应期待整套比例自动成立。

### 6.2 四种坐标不要混淆

| 名称 | 本例含义 |
|---|---|
| `position: relative` | 保留正常布局位置，并可为后代提供定位参照 |
| `position: absolute` | 脱离正常流，按照其包含块定位 |
| `event.clientX/clientY` | 指针在浏览器视口中的坐标 |
| `plant.offsetLeft/offsetTop` | 本例中植物相对offsetParent的布局偏移，单位为像素 |

在当前HTML/CSS中，植物的offsetParent是它的holder，植物架则相对page定位。绝对定位不是永远相对“直接父元素”；包含块还可能由某些其他CSS条件建立。本例不引入transform等会改变定位关系的属性。

`offsetLeft/offsetTop` 是DOM只读属性，不是CSS属性；写位置用 `plant.style.left/top`。`plant.style.left` 只反映行内样式，初始值可能是空字符串，不能据此断言屏幕上没有位置。

### 6.3 层叠顺序与玻璃效果

配套版把土放在z-index:1、瓶壁放在2、植物放在3，正在拖动的植物临时放在4。避免用负z-index使泥土掉到画布背景后面。数值比较仍受层叠上下文影响，不是整个网页全局排序；画布中的 `isolation:isolate` 将这组装饰的层叠范围隔离。

瓶壁使用带透明度的背景色，而非对整个瓶壁设置opacity，因此子元素反光不会跟着整层一起变淡。`pointer-events:none` 让装饰层不拦截植物操作。

配套画布最小宽度620px，窄屏通过外层横向滚动查看；这是为坐标跟练作出的明确取舍，**不是完整的移动端自适应方案**。旧课“写百分比就一定适配小屏”的说法需要具体测试。

## 7. 完整样式：把局部规则放回一个文件

将下列内容作为 `style.css`。HTML完整结构与本节配套版一致时，可以直接运行。每次只改一组数值，观察效果再继续。

```css
* { box-sizing: border-box; }
body { margin: 0; padding: 1rem; font-family: system-ui, sans-serif; color: #263c32; background: #f5f7f2; }
h1, #instructions { text-align: center; }
.stage-scroll { overflow-x: auto; padding: .5rem; }
#page { position: relative; width: 100%; min-width: 620px; max-width: 1000px; height: 640px; margin: auto; border: 1px solid #bdd0c1; background: white; isolation: isolate; }
.container { position: absolute; top: 0; width: 17%; height: 100%; padding: 10px; background: #e8eee8; }
#left-container { left: 0; }
#right-container { right: 0; }
.plant-holder { position: relative; height: 14%; }
.plant { position: absolute; top: 0; left: 0; width: 100%; height: 105%; object-fit: contain; z-index: 3; cursor: grab; touch-action: none; user-select: none; }
.plant:focus-visible { outline: 3px solid #a26300; outline-offset: 2px; }
.plant.dragging { cursor: grabbing; z-index: 4; }
#terrarium { position: absolute; inset: 0; pointer-events: none; }
.jar-walls { position: absolute; left: 22%; bottom: 3%; width: 56%; height: 78%; border: 3px solid #a6c6c3; border-radius: 12%; background: rgb(190 220 216 / 45%); z-index: 2; }
.jar-top { position: absolute; left: 27%; bottom: 81%; width: 46%; height: 4%; border-radius: 8px; background: #c4dad5; z-index: 2; }
.jar-bottom { position: absolute; left: 27%; bottom: 2%; width: 46%; height: 2%; border-radius: 8px; background: #9ab9b0; z-index: 2; }
.dirt { position: absolute; left: 24%; bottom: 4%; width: 52%; height: 8%; border-radius: 0 0 3rem 3rem; background: #785940; z-index: 1; }
.jar-glossy-long, .jar-glossy-short { position: absolute; left: 6%; width: 3%; border-radius: 1rem; background: #fff; }
.jar-glossy-long { bottom: 18%; height: 22%; }
.jar-glossy-short { bottom: 44%; height: 8%; }
```

`#terrarium` 的inset:0使装饰容器覆盖整个page；瓶壁的left/bottom/width/height相对此区域计算，内部反光又相对瓶壁定位。`object-fit:contain`保留图片比例，并非把植物图裁成同一外形。图片透明边缘也占据元素的矩形尺寸，看到的叶片边缘未必就是可点击边界。

**检查点：** 此时没有JS也应看到左右植物架和玻璃瓶，但不能拖动。尝试改变瓶壁宽度或泥土颜色，并解释影响的元素；如果所有植物叠成一团，先检查holder高度和定位，而不是加更多z-index。

## 8. DOM与事件：代码为何能移动页面里的元素

DOM是浏览器把文档解析后提供的对象树。HTML文本中的 `id="plant1"` 对应一个图像节点，可以用JavaScript取得：

```javascript
const plant = document.getElementById('plant1');
console.log(plant, plant.offsetParent);
plant.style.left = '20px';
```

这段代码可在配套页面Console执行。若plant为null，检查id是否正确、节点是否已存在。把下列脚本标签放在head中：

```html
<script src="./script.js" defer></script>
```

对这里的外部经典脚本，defer让脚本在HTML解析完成后运行；不等于等待所有图片都已下载。async不保证执行时DOM已经构建到你需要的位置，不能直接互换。

旧课逐条调用 `dragElement(document.getElementById('plant1'))` 直到plant14，便于初学者看见逐个绑定。理解后可以写：

```javascript
document.querySelectorAll('.plant').forEach(dragElement);
```

`querySelectorAll`拿到全部匹配节点，forEach逐个把节点传入函数。这说明class同样可以用于JS选择。`forEach(dragElement)`传的是函数；`forEach(dragElement())`会先执行函数，再把返回值交给forEach，含义不同。

## 9. 闭包：每株植物保留自己的历史坐标

闭包不是“括号里套一层函数”这么简单，而是函数能继续访问它创建时所在的词法环境。先在Console做一个与植物无关的小实验：

```javascript
function makeCounter() {
  let count = 0;
  return function increment() {
    count += 1;
    return count;
  };
}
const a = makeCounter();
const b = makeCounter();
console.log(a(), a(), b()); // 1 2 1
```

a和b来自不同的makeCounter调用，各自有一份count。外层调用结束后，返回函数仍能访问自己的count，这比“外部不能访问局部变量”更能展示闭包的作用。

拖动同理：每次 `dragElement(plant)` 为一株植物创建pointerId、previousX和previousY；事件处理函数保留对这株plant和这些变量的访问。不要把它们随意搬到全局，否则多个植物的交互会更容易相互覆盖。

## 10. 拖动算法：先算清楚，再写事件

### 10.1 一次拖动包含三个阶段

```text
按下 pointerdown → 记住指针与初始坐标
移动 pointermove → 算本次位移 → 更新植物位置 → 记住新坐标
松开/取消 → 清除“正在拖动”的状态 → 后续移动不再改位置
```

click表示一次点击完成，不能连续提供拖动过程，因此不能仅靠click实现跟随移动。

### 10.2 用具体数字推演方向

假设上一帧指针x=100，现在x=124，植物原left=30：

```text
dx = 124 - 100 = 24
newLeft = 30 + 24 = 54
```

指针向右24px，植物也向右24px。下一帧指针回到119：dx=119−124=−5，left从54变49。每一帧结束后更新previousX，才能计算“本次位移”，避免反复累加从最初起点算出的总位移。

旧课写法是 `pos1 = pos3 - event.clientX`，再用 `offsetLeft - pos1`；与这里的“现在减过去，再加dx”等价。不能只把其中一个减号改成加号。

不要直接写 `plant.style.left = event.clientX + 'px'`：clientX相对视口，left相对holder，混用参照会产生跳动。当前算法利用视口坐标的**差值**，在未缩放、拖动期间参照稳定的画布上更新布局偏移；它不是所有变换/缩放场景的通用坐标转换。

### 10.3 为何移动监听不能轻易丢失

旧课在document上挂 `onpointermove` 与 `onpointerup`，使指针移出图片后仍可继续处理，松手后将两者置空。本节保留位移原理，配套版改用pointer capture：按下时让该植物捕获当前pointerId，此后相关事件继续发给它。

释放、取消或丢失捕获都要结束拖动；`pointerId === null`表示空闲。`touch-action:none`只作用在可拖动物体上，减少触摸拖动被页面滚动接管，不对整个页面一律禁用滚动。

## 11. 完整交互代码与逐段讲解

保存为 `script.js`，与第7节CSS及配套HTML一起使用。鼠标左键/主要指针用于拖动；本节不讲多指协作。

```javascript
// Adapted for teaching from the original terrarium's per-plant closure and delta movement.
// Pointer capture replaces document-wide onpointermove/onpointerup assignments.
document.querySelectorAll('.plant').forEach(dragElement);

function dragElement(plant) {
  let pointerId = null;
  let previousX = 0;
  let previousY = 0;

  plant.addEventListener('pointerdown', startDrag);
  plant.addEventListener('pointermove', moveDrag);
  plant.addEventListener('pointerup', stopDrag);
  plant.addEventListener('pointercancel', stopDrag);
  plant.addEventListener('lostpointercapture', stopDrag);
  plant.addEventListener('keydown', moveByKeyboard);

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0 || pointerId !== null) return;
    event.preventDefault();
    plant.focus({ preventScroll: true });
    pointerId = event.pointerId;
    previousX = event.clientX;
    previousY = event.clientY;
    plant.classList.add('dragging');
    plant.setPointerCapture(pointerId);
  }

  function moveDrag(event) {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - previousX;
    const dy = event.clientY - previousY;
    plant.style.left = plant.offsetLeft + dx + 'px';
    plant.style.top = plant.offsetTop + dy + 'px';
    previousX = event.clientX;
    previousY = event.clientY;
  }

  function stopDrag(event) {
    if (event.pointerId !== pointerId) return;
    const finishedId = pointerId;
    pointerId = null;
    plant.classList.remove('dragging');
    if (plant.hasPointerCapture(finishedId)) plant.releasePointerCapture(finishedId);
  }

  function moveByKeyboard(event) {
    const moves = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
    const delta = moves[event.key];
    if (!delta || pointerId !== null) return;
    event.preventDefault();
    plant.style.left = plant.offsetLeft + delta[0] + 'px';
    plant.style.top = plant.offsetTop + delta[1] + 'px';
  }
}
```

**startDrag：** 忽略非主要指针和重复按下；阻止默认行为，聚焦当前植物；记下pointerId、视口坐标，并改变光标。`setPointerCapture`必须针对正在活动的指针调用。

**moveDrag：** 只有当前拖动指针才能更新位置。先算dx/dy，再设置left/top，最后更新previousX/Y；写入CSS时要拼接px，不能写入没有单位的非零长度。

**stopDrag：** 保存旧id后立刻把状态设为空闲，再移除dragging并释放捕获。释放可能触发lostpointercapture，再进函数时id不匹配就返回，避免重复清理。

**moveByKeyboard：** 用方向键映射得到 `[dx,dy]`，每次移动10px。调用preventDefault避免方向键同时滚动页面。这里只演示替代输入；进一步的实时位置播报和更完善的交互语义可作为扩展。

**明确边界：** 参考版可以把植物拖到瓶外，不判断“是否真的进入瓶子”；移动图像没有改变DOM父子关系。它也不会保存位置。布局重排、缩放和越界限制需要额外设计，不能误认为画出玻璃瓶就自动有了碰撞检测。

## 12. 跟练检查与调试

| 操作 | 预期结果 | 不符合时先查 |
|---|---|---|
| 禁用script.js并刷新 | 看得见布局，不能拖动 | HTML/CSS与JS职责是否分清 |
| 拖动第一株，再拖第二株 | 各自从现有位置继续 | 闭包变量是否被错误共用 |
| 向右拖约30px | left增加约30px | dx符号和坐标参照 |
| 松手后继续移动指针 | 植物不跟随 | pointerId是否清空、是否取消捕获 |
| Tab聚焦植物，按右方向键 | 右移10px | tabindex、keydown、焦点样式 |
| 刷新页面 | 回到架子上 | 这不是持久化功能 |
| 窄屏查看 | 画布容器可横向滚动 | 是否错误隐藏整个页面溢出 |

在Elements中选中植物，Console使用 `$0.offsetLeft` 和 `$0.style.left` 对照布局偏移与行内样式；`$0`是开发者工具提供的选中节点引用，不是你应写入应用的变量。

遇到 `Cannot read properties of null` 先查选择器与脚本时机；遇到图片跟着“虚影”拖动，查draggable属性；只有装饰层能被点到，查pointer-events；元素被剪掉，查祖先overflow。每次只改一个因素，并记录改动前后。

## 13. 课堂问答与答案

先回答，再展开核对。

<details><summary>1. 为什么图片移到瓶子里，原植物架的位置仍保留？</summary>

holder仍在原来的正常布局位置；移动的是绝对定位的img。代码没有把img从holder移动到terrarium节点下。

</details>

<details><summary>2. previousX要在每次move之后更新吗？</summary>

要。当前实现逐帧累加位移；若一直用按下时坐标，就会把越来越大的总位移重复相加。如果改为“起点位置+总位移”的另一算法，则应保存元素起点而不是混用两种算法。

</details>

<details><summary>3. 两株植物的处理函数名字相同，为什么仍能各自记住状态？</summary>

每次dragElement调用创建新的词法环境，事件监听器引用各自环境中的plant和坐标变量。函数名称相同不代表它们共享同一个闭包实例。

</details>

<details><summary>4. `z-index:9999`是否一定能覆盖页面所有元素？</summary>

不能。z-index受层叠上下文约束；还需检查父级层叠关系和overflow裁剪，不能只不断增大数值。

</details>

## 14. 作业、评价与来源

**基础必做：** 完成三文件，至少放置4株不同植物，说明一个HTML属性、一组CSS定位关系和一次拖动坐标计算。交付源文件、初始/布置后截图及第12节前三个交互检查结果；不得只有成品截图。

**进阶二选一：** ①沿用旧课CSS作业，用Flex/Grid重构植物架，先保持静态布局，再分析拖动参照是否变化；②研究一个DOM API，用它实现“当前植物回到原位”，解释如何存储初始位置。再进一步才考虑localStorage或边界限制。

评价建议：结构与资源正确20%、可解释的布局25%、拖动及释放正确30%、调试记录和原理解释25%。作业在本课程已有平时练习权重内安排，不另加考核项目。

本节参考旧课[HTML教程](labs/terrarium/1-intro-to-html/translations/README.zh-cn.md)、[CSS教程](labs/terrarium/2-intro-to-css/translations/README.zh-cn.md)、[DOM与闭包教程](labs/terrarium/3-intro-to-DOM-and-closures/translations/README.zh-cn.md)。原材料来自Microsoft Web Dev for Beginners；旧拖动源码注明受W3Schools示例启发，旧瓶体CSS注明CodePen来源，相关署名保留在原文件中。

完整配套文件：[HTML](labs/terrarium/guided/index.html)、[CSS](labs/terrarium/guided/style.css)、[JavaScript](labs/terrarium/guided/script.js)。图片复用旧课本地文件，不重复下载。[MDN offsetLeft](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft)及[pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture)用于核对属性与事件行为。
