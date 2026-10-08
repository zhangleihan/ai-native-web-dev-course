import { useState } from 'react';
import { initialCases } from './model.js';
export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const visible = initialCases.filter(item => item.title.includes(keyword.trim()));
  return <section aria-labelledby="search-title">
    <h2 id="search-title">步骤二：状态与受控输入</h2>
    <label>标题关键词<input value={keyword} onChange={event => setKeyword(event.target.value)} /></label>
    <p role="status">找到 {visible.length} 条案例</p>
    {visible.length === 0 ? <p>没有匹配的案例</p> :
      <ul>{visible.map(item => <li key={item.id}>{item.title}</li>)}</ul>}
  </section>;
}
