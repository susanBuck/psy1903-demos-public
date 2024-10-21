import { config } from 'dotenv';
config();

import snoowrap from 'snoowrap';
import Sentiment from 'sentiment';

/**
 * 
 */
export async function queryReddit() {

    let r = new snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT,
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD,
    });

    let sentiment = new Sentiment();

    let subreddit = 'mentalhealth';
    let query = 'sleep'
    let sum = 0;
    let count = 0;

    r.getSubreddit(subreddit).search({
        query: query,
        sort: 'new', // Sorting option: relevance, hot, top, new, comments
        time: 'all', // Time filter: all, day, hour, month, week, year
        limit: 50
    }).then(posts => {

        posts.forEach((post, index) => {
            let sentimentResults = sentiment.analyze(post.selftext);
            sum += sentimentResults.score;
            count++;

            // results.push(`TITLE: ${index + 1}. ${post.title}`)
            // results.push(`URL: ${post.url}`);
            // results.push(`SUBREDDIT: ${post.subreddit_name_prefixed}`);
            // results.push(`SENTIMENT SCORE: ${sentimentResults.score}`);
        });

        let results = {
            subreddit: subreddit,
            query: query,
            sentiment_mean: sum / count
        }

        console.log(results);

        return results;

    })
}