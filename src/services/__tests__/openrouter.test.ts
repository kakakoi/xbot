import { OpenRouterService } from "../openrouter";

describe("OpenRouterService", () => {
  const mockConfig = {
    apiKey: "test-key",
    model: "test-model",
    temperature: 0.7,
  };

  it("should be initialized with config", () => {
    const service = new OpenRouterService(mockConfig);
    expect(service).toBeInstanceOf(OpenRouterService);
  });

  it("should generate tweet", async () => {
    const service = new OpenRouterService(mockConfig);
    // TODO: Add more specific tests with mock fetch
    expect(service.generateTweet).toBeDefined();
  });
});
