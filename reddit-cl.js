
import dotenv from 'dotenv';
import readline from 'readline';
import snoowrap from 'snoowrap';
import Sentiment from 'sentiment';

// Load environment variables from .env file
dotenv.config();

// Initialize dependencies
let r = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
});
let rl = readline.createInterface(process.stdin, process.stdout);
let sentiment = new Sentiment();

// Prompt for input and perform search and analysis
rl.question('Enter subreddit,query: ', (response) => {
    let [subreddit, query] = response.split(',');

    let sum = 0;
    let count = 0;

    r.getSubreddit(subreddit).search({
        query: query,
        sort: 'new', // Sorting option: relevance, hot, top, new, comments
        time: 'all', // Time filter: all, day, hour, month, week, year
        limit: 25
    }).then(posts => {
        posts.forEach((post, index) => {
            let sentimentResults = sentiment.analyze(post.selftext);
            sum += sentimentResults.score;
            count++;

            console.log('-------');
            console.log(`TITLE: ${index + 1}. ${post.title}`);
            console.log(`URL: ${post.url}`);
            console.log(`SUBREDDIT: ${post.subreddit_name_prefixed}`);
            console.log(`SENTIMENT SCORE: ${sentimentResults.score}`);
        });
        console.log();
        output('================');
        output(`SUBREDDIT: ${subreddit}`)
        output(`QUERY: ${query}`)
        output(`SENTIMENT ANALYSIS MEAN FOR ALL POSTS: ${sum / count}`);
        output('================');
    }).finally(() => {
        rl.close();
    });
});

function output(content) {
    console.log('\x1b[32m%s\x1b[0m', content);
}
