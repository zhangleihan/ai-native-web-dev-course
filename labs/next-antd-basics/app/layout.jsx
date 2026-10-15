import { AntdRegistry } from '@ant-design/nextjs-registry';
import Link from 'next/link';
import './globals.css';
export const metadata = { title: '案例库 · Next.js 与 Ant Design 入门' };
export default function RootLayout({ children }) {
  return <html lang="zh-CN"><body>
    <header><nav aria-label="主导航"><Link href="/">学习说明</Link><Link href="/cases">案例管理</Link></nav></header>
    <AntdRegistry>{children}</AntdRegistry>
  </body></html>;
}
