import { useState } from 'react';
import { initialCases, industryNames, filterCases, toggleFavorite } from './model.js';

export function FilterBar({ keyword, industry, onlyFavorites, onKeywordChange,
  onIndustryChange, onOnlyFavoritesChange, onReset }) {
  return <section className="filters" aria-label="案例筛选">
    <label>标题关键词
      <input value={keyword} onChange={event => onKeywordChange(event.target.value)} />
    </label>
    <label>行业
      <select value={industry} onChange={event => onIndustryChange(event.target.value)}>
        <option value="all">全部行业</option>
        <option value="telecom">通信</option><option value="retail">零售</option>
      </select>
    </label>
    <label className="checkbox">
      <input type="checkbox" checked={onlyFavorites}
        onChange={event => onOnlyFavoritesChange(event.target.checked)} />只看收藏
    </label>
    <button type="button" onClick={onReset}>清空筛选</button>
  </section>;
}

export function CaseCard({ item, isFavorite, onToggleFavorite }) {
  return <li>
    <h3>{item.title}</h3>
    <p>行业：{industryNames[item.industry]} · 难度：{item.difficulty === 'beginner' ? '入门' : '进阶'}</p>
    <button type="button" aria-pressed={isFavorite}
      aria-label={`${isFavorite ? '取消收藏' : '收藏'}：${item.title}`}
      onClick={() => onToggleFavorite(item.id)}>
      {isFavorite ? '取消收藏' : '收藏'}
    </button>
  </li>;
}

export function CaseList({ items, favoriteIds, onToggleFavorite }) {
  if (items.length === 0) return <p>没有匹配的案例，请调整筛选条件。</p>;
  return <ul className="cards">{items.map(item =>
    <CaseCard key={item.id} item={item} isFavorite={favoriteIds.includes(item.id)}
      onToggleFavorite={onToggleFavorite} />
  )}</ul>;
}

export default function CasesPage() {
  const [keyword, setKeyword] = useState('');
  const [industry, setIndustry] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const visible = filterCases(initialCases, keyword, industry, onlyFavorites, favoriteIds);

  function handleToggleFavorite(id) {
    setFavoriteIds(previous => toggleFavorite(previous, id));
  }
  function handleReset() {
    setKeyword('');
    setIndustry('all');
    setOnlyFavorites(false);
  }
  return <section aria-labelledby="cases-title">
    <h2 id="cases-title">步骤三：共享状态与单向数据流</h2>
    <p>练习数据仅保存在本页内存中；刷新或切换步骤会重置。</p>
    <FilterBar keyword={keyword} industry={industry} onlyFavorites={onlyFavorites}
      onKeywordChange={setKeyword} onIndustryChange={setIndustry}
      onOnlyFavoritesChange={setOnlyFavorites} onReset={handleReset} />
    <p role="status">显示 {visible.length} / {initialCases.length} 条 · 已收藏 {favoriteIds.length} 条</p>
    <CaseList items={visible} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
  </section>;
}
