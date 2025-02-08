export interface TwitterApiErrorData {
  title?: string;
  status?: number;
  detail?: string;
  type?: string;
}

export interface TwitterRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  day?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

export interface TwitterApiError extends Error {
  code?: number;
  data?: TwitterApiErrorData;
  rateLimit?: TwitterRateLimit;
}
