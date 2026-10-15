import Link from 'next/link';
export default function HomePage() {
  return <main><h1>React → Next.js → Ant Design</h1>
    <p>用同一份案例数据理解组件、页面路由与界面组件库的分工。</p>
    <ol><li>先读 lib/cases.js 的数据模型。</li><li>追踪 app/cases/page.jsx 如何给客户端组件传入数据。</li><li>在表单提交后观察表格更新。</li></ol>
    <p>仅供课堂练习：新增内容只保存在浏览器组件内存中，刷新后恢复初始数据。</p>
    <Link href="/cases">开始案例管理练习</Link>
  </main>;
}
