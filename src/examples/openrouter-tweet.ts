import { config, openrouterConfig } from '../config/config';
import { OpenRouterService } from '../services/openrouter';
import { sendTweet } from './tweet';

async function generateAndTweet() {
    const openrouter = new OpenRouterService(openrouterConfig);
    
    try {
        const tweet = await openrouter.generateTweet({
            topic: '技術',
            mood: '楽しい',
            hashtags: ['#JavaScript', '#Programming']
        });
        
        console.log('生成されたツイート:', tweet);
        await sendTweet(tweet);
    } catch (error) {
        console.error('エラーが発生しました:', error);
        process.exit(1);
    }
}

generateAndTweet().catch(console.error);
