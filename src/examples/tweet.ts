import { TwitterApi } from 'twitter-api-v2';
import { config } from '../config/config';

async function sendTweet(text: string) {
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

        const timestamp = new Date().toLocaleString('ja-JP');
        const tweet = await client.v2.tweet(`${text} (${timestamp})`);
        console.log('ツイート成功:', tweet.data);
        return tweet;
    } catch (error: any) {
        console.error('\n=== Twitter API エラー ===');
        if (error.data) {
            console.error('エラー詳細:', {
                タイトル: error.data.title,
                ステータス: error.data.status,
                詳細: error.data.detail,
                タイプ: error.data.type
            });
        }
        
        console.error('\n推奨される対応:');
        console.error('1. Twitter Developer Portalで以下を確認:');
        console.error('   - User authentication settingsでOAuth 1.0aが有効になっているか');
        console.error('   - App permissionsで"Read and Write"が有効になっているか');
        console.error('2. 設定後、プロジェクトの再生成が必要な場合があります');
        console.error('3. アクセストークンとシークレットを再生成してください');
        
        throw error;
    }
}

// テストツイート
sendTweet('APIテスト投稿 #test')
    .then(() => console.log('処理完了'))
    .catch(() => process.exit(1));
