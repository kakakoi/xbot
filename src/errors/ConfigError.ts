export class ConfigError extends Error {
  constructor(
    message: string,
    public readonly key?: string,
    public readonly value?: unknown,
  ) {
    super(message);
    this.name = "ConfigError";
  }
}
