# 课后练习

1. 把单张案例卡抽成 `CaseCard`，props 为 `case: CaseItem` 与 `onOpen(id)`，列表 `key={c.id}`（按教师指定的分支提交）。
2. 登录密码改成受控 `password` state。NOTES 写清：校验必须发生在 `POST /api/auth/login`。
3. 指出 `startRun` 的定时器在哪被清理（函数名）。思考：若漏清理，快速连点「启动」会发生什么。
