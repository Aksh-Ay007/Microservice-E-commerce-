/**
 * Common API response types for better type safety
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  details?: any;
  statusCode?: number;
}

// Auth responses
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

// Order responses
export interface OrderResponse {
  success: boolean;
  orders?: any[];
  order?: any;
}

// Payment responses
export interface PaymentSessionResponse {
  sessionId: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
}
