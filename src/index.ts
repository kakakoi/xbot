import { config } from '../config/config';
import { AI } from './ai';
import { Tweet } from './tweet';

async function main() {
  const ai = new AI();
  const tweet = new Tweet();

  const prompt = '今日の気分はどうですか？';
  const generatedTweet = await ai.generateTweet(prompt);

  await tweet.postTweet(generatedTweet);
}

main().catch(console.error);
