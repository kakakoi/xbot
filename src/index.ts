import { config, openrouterConfig } from './config/config';
import { OpenRouterService } from './services/openrouter';
import { TwitterService } from './services/twitter';

export async function run() {
  const openrouter = new OpenRouterService(openrouterConfig);
  const twitter = new TwitterService(config);

  try {
    const tweet = await openrouter.generateTweet({
      topic: '技術',
      mood: '楽しい',
    });

    await twitter.tweet(tweet);
    console.log('ツイートの投稿が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  run().catch(console.error);
}
