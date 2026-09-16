# 打字游戏：事件驱动

材料：`labs/typing-game/`。中文步骤在 `typing-game/translations/README.zh-cn.md`。成品：[solution/index.html](labs/typing-game/solution/index.html)（`index.js` / `index.css`）。

## 事件驱动

你不知道用户何时点「开始」、何时按键，所以不能写死顺序。**注册监听器**，事件来了再跑。常见：`click`、`input`、`select`、`contextmenu`。本游戏用前两个。优先 `addEventListener` + 箭头函数，比 HTML 里写 `onclick=` 更灵活。

## 界面三件套

`index.html` / `style.css` / `script.js`。需要：`#quote` 展示句子、`#message` 状态、`#typed-value` 输入框（加 `aria-label`）、`#start` 按钮。

样式两类：`.highlight` 当前词；`.error` 打错。**用 class 改外观，不要在 JS 里写死颜色。**

## 逻辑

1. **click 开始**：随机抽一句 → `split(' ')` 成词数组 → 每个词包一层 `<span>` 以便高亮 → 记 `startTime`。
2. **input 打字**：当前词全对且是最后一个 → 祝贺并算秒；词末空格且拼对 → 清空输入、`wordIndex++`、高亮移到下一词；前缀匹配 → 去掉 error；否则加上 `.error`。

```javascript
document.getElementById('start').addEventListener('click', () => { /* 抽句、拆词、计时 */ });
typedValueElement.addEventListener('input', () => {
  const currentWord = words[wordIndex];
  const typedValue = typedValueElement.value;
  if (typedValue === currentWord && wordIndex === words.length - 1) {
    messageElement.innerText = `完成，用时 ${(Date.now() - startTime) / 1000} 秒`;
  } else if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) {
    typedValueElement.value = '';
    wordIndex++;
  } else if (currentWord.startsWith(typedValue)) {
    typedValueElement.className = '';
  } else {
    typedValueElement.className = 'error';
  }
});
```

完整实现见 `labs/typing-game/solution/index.js`。

示例用 `innerHTML` 插入自己写死的英文词，风险低；**一旦句子来自用户或接口，就必须改成 `createElement` + `textContent`**。FDE 案例摘要同理。第 8 讲收 XSS。

可加：结束时 `removeEventListener`、禁用输入框、`localStorage` 存最快成绩。作业见 `labs/typing-game/typing-game/translations/assignment.zh-cn.md`。
