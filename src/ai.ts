class AI {
    generateTweet(prompt: string): string {
        // 簡単なツイート生成ロジック
        const responses = [
            `今日の気分は: ${prompt}`,
            `私の考え: ${prompt}`,
            `みんなに伝えたいこと: ${prompt}`,
            `最近思ったこと: ${prompt}`,
            `これについてどう思いますか？: ${prompt}`
        ];
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }
}

export default AI;