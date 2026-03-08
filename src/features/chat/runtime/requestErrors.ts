import { AuthRequiredError, EdgeFunctionError } from '@/services/aiGateway';
import type { ChatRequestError } from '@/features/chat/state/types';

export function toRequestError(error: unknown): ChatRequestError {
  if (error instanceof AuthRequiredError) {
    return {
      status: 401,
      code: 'auth_required',
      message: '登录状态已失效，请重新登录后再试。',
    };
  }

  if (error instanceof EdgeFunctionError) {
    if (error.status === 401) {
      return {
        status: 401,
        code: error.code,
        requestId: error.requestId,
        message: 'AI 网关鉴权失败，请刷新页面后重试。',
      };
    }

    if (error.status === 0) {
      return {
        status: 0,
        code: error.code,
        requestId: error.requestId,
        message: '网络连接异常，暂时无法调用 AI。',
      };
    }

    return {
      status: error.status,
      code: error.code,
      requestId: error.requestId,
      message: error.message || 'AI 服务暂时不可用，请稍后重试。',
    };
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return {
      status: 499,
      code: 'aborted',
      message: '请求已取消。',
    };
  }

  return {
    status: 500,
    code: 'unknown_error',
    message: 'AI 服务暂时不可用，请稍后重试。',
  };
}
