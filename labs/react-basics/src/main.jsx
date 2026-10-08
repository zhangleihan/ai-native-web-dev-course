import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import StaticPage from './StaticPage.jsx';
import SearchPage from './SearchPage.jsx';
import CasesPage from './App.jsx';
import './style.css';
function Tutorial() {
  const [step, setStep] = useState('1');
  return <main>
    <h1>React 基础：从静态组件到交互案例库</h1>
    <label>学习步骤<select value={step} onChange={event => setStep(event.target.value)}>
      <option value="1">一 · 组件与 props</option><option value="2">二 · 状态与搜索</option>
      <option value="3">三 · 筛选与收藏</option>
    </select></label>
    {step === '1' ? <StaticPage /> : step === '2' ? <SearchPage /> : <CasesPage />}
  </main>;
}
createRoot(document.getElementById('root')).render(<StrictMode><Tutorial /></StrictMode>);
