# 项目关联

本讲有 **两条线**：`labs/` 里三个小项目练肌肉；FDE 案例库是这些肌肉将来要长到哪。

## 动手目录（已在本课程仓库）

| 项目 | 打开 | 对应能力 |
|---|---|---|
| JS 基础 | 浏览器 Console，对照 `labs/js-basics/*/translations/README.zh-cn.md` | `CaseItem` 的类型与 `filter` |
| 花艺瓶 | `labs/terrarium/solution/index.html` 或从 `1-intro-to-html` 自搭 | 语义 HTML、选择器、定位、DOM 闭包 |
| 打字游戏 | `labs/typing-game/solution/` 或自建三文件 | `click`/`input`、当前词与计时 |

植物图：`labs/terrarium/solution/images/`。课堂不要改 FDE 的 `web/src` 来做花艺瓶。

若用本教材的静态服务（8766），成品地址例如：

- http://127.0.0.1:8766/labs/terrarium/solution/index.html
- http://127.0.0.1:8766/labs/typing-game/solution/index.html

## FDE 上的落点

`CaseItem` 每个字段都要在 `/cases` UI 上找得到。筛选只存在该页 `useState`，刷新会丢。

登录页密码框是非受控装饰，对照打字游戏里「输入框的 `value` 必须被 JS 读到」——FDE 现在读都没读。

第 4 讲 React 会把 `getElementById` + 改 `className` 换成组件 state；你必须还能说出底层发生了什么。
