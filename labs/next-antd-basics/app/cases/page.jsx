import CaseWorkbench from '../../components/CaseWorkbench.jsx';
import { initialCases } from '../../lib/cases.js';
export default function CasesPage() {
  return <main><h1>案例管理</h1>
    <p>页面负责初始数据，客户端组件负责输入、筛选和新增。</p>
    <CaseWorkbench initialItems={initialCases} />
  </main>;
}
