"use client";
import {ConfigProvider} from 'antd';
import zhCN from 'antd/locale/zh_CN';
export default function ChineseProvider({children}){return <ConfigProvider locale={zhCN}>{children}</ConfigProvider>;}
