import { ApiErrorResponse } from '@/types/common';
import { tokenStorage } from './tokenStorage';

export interface FormattedError {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export function parseApiError(error: any): FormattedError {
  if (!error.response) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.',
    };
  }

  const { status, data } = error.response;
  const errorData = data as ApiErrorResponse;

  const code = errorData?.error?.code || 'UNKNOWN_ERROR';
  const defaultMessage = errorData?.message || 'Đã có lỗi xảy ra trong quá trình xử lý.';

  // 1. Handle HTTP 401 Unauthorized
  if (status === 401) {
    tokenStorage.clearAll();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/login')) {
      window.location.href = '/auth/login?reason=session_expired';
    }
    return {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    };
  }

  // 2. Handle HTTP 403 Forbidden / Tenant Scoping Violation
  if (status === 403) {
    const isTenantError = code === 'UNAUTHORIZED_TENANT_ACCESS';
    return {
      status: 403,
      code,
      message: isTenantError
        ? 'Bạn không có quyền truy cập dữ liệu của Hợp tác xã khác (Tenant Scoping Violation).'
        : (defaultMessage || 'Bạn không có quyền thực hiện thao tác này.'),
    };
  }

  // 3. Handle HTTP 409 Conflict / Concurrency State Invalid
  if (status === 409) {
    return {
      status: 409,
      code,
      message: defaultMessage || 'Dữ liệu đã bị thay đổi bởi thao tác khác hoặc trạng thái không hợp lệ. Vui lòng tải lại trang.',
    };
  }

  // 4. Handle HTTP 422 Unprocessable Entity / Validation Errors
  if (status === 422) {
    return {
      status: 422,
      code: code || 'VALIDATION_FAILED',
      message: defaultMessage || 'Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại.',
      fieldErrors: errorData?.errors || {},
    };
  }

  // 5. Handle HTTP 500 Server Errors
  if (status >= 500) {
    return {
      status,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Lỗi hệ thống máy chủ. Vui lòng liên hệ quản trị viên.',
    };
  }

  return {
    status,
    code,
    message: defaultMessage,
  };
}
