import { APIError } from '../types/error';

export abstract class BaseService {
  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const text = await response.text();
      throw new APIError(
        'API request failed',
        response.status,
        response.statusText,
        text,
      );
    }
    return response.json();
  }

  protected async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
