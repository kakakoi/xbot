import { APIError } from '../errors/APIError';

export function handleError(error: unknown): never {
  if (error instanceof APIError) {
    console.error(`[${error.name}] ${error.message}`);
    if (error.status) console.error(`Status: ${error.status}`);
    if (error.details) console.error('Details:', error.details);
  } else {
    console.error('[UnknownError]', error);
  }
  process.exit(1);
}
