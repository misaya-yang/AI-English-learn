/**
 * Format a chat session timestamp using the rules baked into the chat history sidebar.
 *
 * - Today → `HH:MM` (zh-CN locale)
 * - Yesterday → 昨天
 * - Within the past week → 周X label
 * - Older → short month/day (zh-CN)
 */
export const formatChatDate = (timestamp: number, now: Date = new Date()): string => {
  const date = new Date(timestamp);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) {
    return '昨天';
  }
  if (diffDays < 7) {
    return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
  }
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};
