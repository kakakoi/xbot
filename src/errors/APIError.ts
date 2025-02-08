export class APIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class TwitterError extends APIError {
  constructor(message: string, status?: number, details?: unknown) {
    super(message, status, 'TWITTER_API_ERROR', details);
    this.name = 'TwitterError';
  }
}

export class OpenRouterError extends APIError {
  constructor(message: string, status?: number, details?: unknown) {
    super(message, status, 'OPENROUTER_API_ERROR', details);
    this.name = 'OpenRouterError';
  }
}
