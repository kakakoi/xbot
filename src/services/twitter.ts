import { TwitterApi } from 'twitter-api-v2';
import type { TwitterConfig } from '../types/config';
import { BaseService } from './base';

export class TwitterService extends BaseService {
  private client: TwitterApi;

  constructor(config: TwitterConfig) {
    super();
    this.client = new TwitterApi({
      appKey: config.apiKey,
      appSecret: config.apiSecretKey,
      accessToken: config.accessToken,
      accessSecret: config.accessTokenSecret,
    });
  }

  async tweet(text: string): Promise<string> {
    const me = await this.client.v2.me();
    console.log(`ツイート実行: @${me.data.username}`);
    const tweet = await this.client.v2.tweet(text);
    return tweet.data.id;
  }
}
