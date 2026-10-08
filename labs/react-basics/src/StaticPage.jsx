import { initialCases, industryNames } from './model.js';
function StaticCard({ item }) {
  return <li><h3>{item.title}</h3><p>行业：{industryNames[item.industry]}</p></li>;
}
export default function StaticPage() {
  return <section aria-labelledby="static-title">
    <h2 id="static-title">步骤一：静态组件</h2>
    <p>先看组件、props、map 与 key；这里还没有状态。</p>
    <ul className="cards">{initialCases.map(item => <StaticCard key={item.id} item={item} />)}</ul>
  </section>;
}
