import { parseStringPromise } from "xml2js";

interface NewsArticle {
  title: string;
  url: string;
  description: string;
  publishedAt: Date;
  source: string;
}

interface RSSItem {
  title: string[];
  link: string[];
  description?: string[];
  pubDate: string[];
}

const RSS_FEED = {
  url: "https://news.yahoo.co.jp/rss/topics/business.xml",
  source: "Yahoo!ニュース",
};

// URLからクエリパラメータを削除する関数
function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.origin + urlObj.pathname;
  } catch {
    return url;
  }
}

export async function getNewsArticles(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(RSS_FEED.url);
    const xmlText = await response.text();
    const result = await parseStringPromise(xmlText);

    const items = result.rss.channel[0].item as RSSItem[];
    return (
      items
        .map((item) => ({
          title: item.title[0],
          url: cleanUrl(item.link[0]),
          description: item.description?.[0] || "",
          publishedAt: new Date(item.pubDate[0]),
          source: RSS_FEED.source,
        }))
        // 日付順にソート（新しい順）
        .sort(
          (a: NewsArticle, b: NewsArticle) =>
            b.publishedAt.getTime() - a.publishedAt.getTime(),
        )
    );
  } catch (error) {
    console.error("ニュース記事の取得中にエラーが発生しました:", error);
    throw error;
  }
}
