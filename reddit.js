import { config } from 'dotenv';
config();

import snoowrap from 'snoowrap';
import Sentiment from 'sentiment';

/**
 * 
 */
export async function queryReddit(req) {

    let r = new snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT,
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD,
    });

    let sentiment = new Sentiment();
    let sum = 0;
    let count = 0;

    let subreddit = req.subreddit;
    let query = req.query;
    let limit = parseInt(req.limit);

    let response = await r.getSubreddit(subreddit).search({
        query: query,
        sort: 'new', // Sorting option: relevance, hot, top, new, comments
        time: 'all', // Time filter: all, day, hour, month, week, year
        limit: limit
    }).then(posts => {

        let postsData = [];

        posts.forEach((post, index) => {
            let sentimentResults = sentiment.analyze(post.selftext);

            sum += sentimentResults.score;
            count++;

            postsData.push({
                title: post.title,
                url: post.url,
                subreddit: post.subreddit_name_prefixed,
                sentimentResults: sentimentResults,
                text: truncateText(post.selftext, 400)
            });
        });

        let results = {
            subreddit: subreddit,
            query: query,
            sentimentMean: sum / count,
            postsData: postsData
        }

        return results;

    })


    return response;
}


function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}
