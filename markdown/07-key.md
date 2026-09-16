# fetch、CORS 与三种 UI 状态

FSO Part 2 把 notes 从硬编码数组换成 `GET /api/notes`，讲 axios/fetch、effect 依赖、在 React 里增删改。FDE 同构：`cases/page.tsx` 的 `import { cases }` 必须离开。

## 把静态 import 换成 effect

```tsx
useEffect(() => {
  let cancelled = false;
  setStatus('loading');
  fetch(`${API}/api/cases?industry=${encodeURIComponent(industry)}`)
    .then(async (res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    })
    .then((data) => { if (!cancelled) { setList(data); setStatus('ok'); } })
    .catch(() => { if (!cancelled) setStatus('error'); });
  return () => { cancelled = true; };
}, [industry, difficulty, kw]);
```

与 FSO 完全一致的要点：依赖变了要重拉；卸载后忽略响应；**先 `res.ok`**；三种 UI——loading、error、空列表。

推荐服务端过滤 `?industry=&difficulty=&q=`，因为案例会过百。过渡期可前端滤，但必须先走 HTTP。

## 环境变量与 CORS

`NEXT_PUBLIC_API_URL=http://127.0.0.1:3101`。浏览器从 3100 打 3101 会预检。漏 CORS 时 Network 里是 OPTIONS/CORS 红字，**不是**业务 500。

## 写操作

Discover 的 `setExtractStatus` 只改 Context。集成后 `PATCH /api/extracts/:id`。乐观更新可以，失败必须回滚。FSO Part 2d 改 note 的 importance 就是这个模式。

按页拉取：进 `/cases` 只拉 cases，不要一次下载整个 `ProjectDataset`。断掉 API 时案例库必须出现可重试错误条，不能白屏或「暂无案例」。
