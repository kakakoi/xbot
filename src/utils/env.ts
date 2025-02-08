import 'dotenv/config'; // 最初に.envをロード
import { ConfigError } from '../errors/ConfigError';

export function validateEnv(requiredKeys: string[]): void {
  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new ConfigError(
      '必要な環境変数が設定されていません',
      'MISSING_ENV',
      missing,
    );
  }
}

export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new ConfigError(`環境変数"${key}"が設定されていません`, key);
  }
  return value;
}

export function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export function getNumericEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;

  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new ConfigError(
      `Environment variable "${key}" must be a number`,
      key,
      value,
    );
  }
  return num;
}
