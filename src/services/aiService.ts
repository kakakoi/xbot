import { openrouterConfig } from "../config/config";
import { newsAnalysisPrompts } from "../prompts/newsAnalysis";
import { OpenRouterService } from "./openrouter";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
}

export async function generateAIComment(article: NewsArticle): Promise<string> {
  try {
    const openrouter = new OpenRouterService(openrouterConfig);
    const prompt = newsAnalysisPrompts.marketImpact(article.title);

    return await openrouter.generateTweet(prompt);
  } catch (error) {
    console.error("AIコメントの生成中にエラーが発生しました:", error);
    throw error;
  }
}

export async function selectMostRelevantNews(
  articles: NewsArticle[],
): Promise<NewsArticle> {
  try {
    // 最新の10件のニュースタイトルを取得
    const recentTitles = articles.slice(0, 10).map((a) => a.title);

    const openrouter = new OpenRouterService(openrouterConfig);
    const prompt = newsAnalysisPrompts.selectRelevant(recentTitles);

    const response = await openrouter.generateTweet(prompt);
    // レスポンスから数値を抽出
    const index = Number.parseInt(response.match(/\d+/)?.[0] || "0");

    return articles[index] || articles[0];
  } catch (error) {
    console.error("ニュース選択中にエラーが発生しました:", error);
    throw error;
  }
}
