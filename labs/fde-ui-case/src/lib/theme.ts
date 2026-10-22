import type { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
    fontSize: 13,
    colorBgLayout: '#f4f6fb',
    colorBorderSecondary: '#e6ebf3',
    controlHeight: 32,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 56,
      headerPadding: '0 20px',
      siderBg: '#101728',
      bodyBg: '#f4f6fb',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(22,119,255,0.22)',
      darkItemHoverBg: 'rgba(255,255,255,0.06)',
      itemMarginInline: 8,
      itemHeight: 38,
    },
    Card: {
      headerFontSize: 14,
      paddingLG: 18,
    },
    Table: {
      headerBg: '#f7f9fc',
      cellPaddingBlockSM: 8,
    },
    Tabs: {
      horizontalItemPadding: '10px 0',
    },
    Descriptions: {
      labelBg: '#f7f9fc',
    },
  },
};

export const riskColor: Record<string, string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
};

export const permissionColor: Record<string, string> = {
  ALLOW: 'green',
  DENY: 'red',
  APPROVAL_REQUIRED: 'orange',
};

export const statusColor: Record<string, string> = {
  CREATED: 'default',
  RUNNING: 'processing',
  WAITING_TOOL: 'warning',
  WAITING_APPROVAL: 'warning',
  RETRYING: 'warning',
  FAILED: 'error',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

export const spanTypeColor: Record<string, string> = {
  context: '#8c8c8c',
  model: '#eb2f96',
  retrieval: '#13c2c2',
  tool: '#1677ff',
  handoff: '#722ed1',
  memory_read: '#52c41a',
  memory_write: '#389e0d',
  approval: '#fa541c',
  output: '#faad14',
};
