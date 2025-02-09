import {
  generateAIComment,
  selectMostRelevantNews,
} from "../services/aiService";
import { getNewsArticles } from "../services/newsService";
import { sendTweet } from "../services/twitter";

interface NewsCommandOptions {
  dryRun?: boolean;
}

export async function newsCommand({ dryRun = false }: NewsCommandOptions = {}) {
  try {
    // ニュース記事を取得
    const articles = await getNewsArticles();

    // 記事がない場合は終了
    if (articles.length === 0) {
      console.log("共有できるニュース記事が見つかりませんでした。");
      return;
    }

    // AIによる最適なニュース記事の選択
    const selectedArticle = await selectMostRelevantNews(articles);
    console.log("選択された記事:", selectedArticle.title);

    // AI によるコメントを生成
    const aiComment = await generateAIComment(selectedArticle);

    // ツイート本文を作成
    const tweetText = `${aiComment}\n\n${selectedArticle.url}`;

    if (dryRun) {
      console.log("【ドライラン】以下のツイートを投稿します:");
      console.log(tweetText);
      return;
    }

    // ツイートを投稿
    await sendTweet(tweetText);
    console.log("ニュース記事を投稿しました！");
  } catch (error) {
    console.error("ニュース投稿中にエラーが発生しました:", error);
    throw error;
  }
}
