import Link from 'next/link';
export default function HomePage() {
  return <main><h1>React → Next.js → Ant Design</h1>
    <p>用同一份案例数据理解组件、页面路由与界面组件库的分工。</p>
    <ol><li>先读 lib/cases.js 的数据模型。</li><li>追踪 app/cases/page.jsx 如何给客户端组件传入数据。</li><li>在表单提交后观察表格更新。</li></ol>
    <p>仅供课堂练习：新增内容只保存在浏览器组件内存中，刷新后恢复初始数据。</p>
    <h2>循序渐进的练习</h2><ol>
<li><Link href="/cases">基础案例管理</Link>：三条记录，理解筛选与新增。</li>
<li><Link href="/catalog">服务端案例目录</Link>：六条记录，学习网址参数、分页和详情。</li>
<li><Link href="/remote">接口请求</Link>：观察真实请求、无结果、失败与重试。</li>
<li><Link href="/workbench">案例编辑工作台</Link>：练习草稿回填、保存、取消和删除确认。</li>
</ol><p>目录与接口读取固定数据；工作台编辑的是本地副本，互不影响。</p>
  </main>;
}
