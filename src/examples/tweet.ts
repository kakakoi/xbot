import { TwitterApi } from 'twitter-api-v2';
import { config } from '../config/config';
import type { TwitterApiError } from '../types/twitter';

export async function sendTweet(text: string) {
  console.log('Twitter APIクライアントを初期化中...');

  const client = new TwitterApi({
    appKey: config.apiKey,
    appSecret: config.apiSecretKey,
    accessToken: config.accessToken,
    accessSecret: config.accessTokenSecret,
  });

  try {
    // API権限の確認
    console.log('アカウント情報を確認中...');
    const me = await client.v2.me();
    console.log(`認証成功: @${me.data.username}`);

    const tweet = await client.v2.tweet(text);
    console.log('ツイート成功:', tweet.data);
    return tweet;
  } catch (error) {
    if ((error as TwitterApiError).code === 429) {
      console.error('\n=== レート制限エラー ===');
      const rateLimit = (error as TwitterApiError).rateLimit;
      if (rateLimit?.day) {
        const dayReset = new Date(rateLimit.day.reset * 1000);
        console.error('24時間制限情報:');
        console.error(`- 残り回数: ${rateLimit.day.remaining}`);
        console.error(`- リセット時刻: ${dayReset.toLocaleString()}`);
      }
      console.error(
        'Twitter APIの制限に達しました。しばらく時間をおいて再実行してください。',
      );
    } else {
      console.error('\n=== Twitter API エラー ===');
      const twitterError = error as TwitterApiError;
      if (twitterError.data) {
        console.error('エラー詳細:', {
          タイトル: twitterError.data?.title || '不明',
          ステータス: twitterError.data?.status || 0,
          詳細: twitterError.data?.detail || '詳細不明',
          タイプ: twitterError.data?.type || '不明',
        });
      }

      console.error('\n推奨される対応:');
      console.error('1. Twitter Developer Portalで以下を確認:');
      console.error(
        '   - User authentication settingsでOAuth 1.0aが有効になっているか',
      );
      console.error(
        '   - App permissionsで"Read and Write"が有効になっているか',
      );
      console.error('2. 設定後、プロジェクトの再生成が必要な場合があります');
      console.error('3. アクセストークンとシークレットを再生成してください');
    }
    throw error;
  }
}

// テストコードは直接実行時のみ実行されるように修正
if (require.main === module) {
  sendTweet('APIテスト投稿 #test')
    .then(() => console.log('処理完了'))
    .catch(() => process.exit(1));
}
