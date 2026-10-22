import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { StoreProvider } from '@/lib/store';
import AppShell from '@/components/AppShell';
import { themeConfig } from '@/lib/theme';
import './globals.css';
import 'reactflow/dist/style.css';

export const metadata: Metadata = {
  title: 'AI-FDE 工程管理实训平台',
  description: '业务问题到 AI 系统交付的一体化工作环境 · POC 原型演示',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <ConfigProvider locale={zhCN} theme={themeConfig}>
            <StoreProvider>
              <AppShell>{children}</AppShell>
            </StoreProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
