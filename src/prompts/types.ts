export interface PromptConfig {
  topic: string;
  mood: string;
  context: string;
}

export type PromptFunction = (params?: string) => PromptConfig;
