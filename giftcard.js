// https://developer.amazon.com/docs/incentives-api/incentives-api.html
import { IncentivesAPI } from 'amazon-incentives-api';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Function to create a gift card
export async function createGiftCard() {

    // Load environment variables
    // https://www.amazon.com/gc/corp/account/keys/sandbox
    let secretAccessKey = process.env.AMAZON_SECRET_ACCESS_KEY;
    let accessKeyId = process.env.AMAZON_ACCESS_KEY_ID;
    let partnerId = process.env.AMAZON_PARTNER_ID;

    // Endpoint configuration
    // https://developer.amazon.com/docs/incentives-api/incentives-api.html#sandbox-endpoints
    let endpoint = {
        host: 'agcod-v2-gamma.amazon.com',
        region: 'us-east-1'
    };

    // Initialize IncentivesAPI client
    let client = new IncentivesAPI({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        partnerId: partnerId,
        endpoint: endpoint,
    });

    try {
        // Generate a unique request ID
        let uniqueRequestId = partnerId + Date.now();

        // Create the gift card
        let creationRequestResponse = await client.createGiftCard({
            creationRequestId: uniqueRequestId,
            amount: 5,
            currencyCode: 'USD',
        });

        // Log the response
        console.log(creationRequestResponse);

        // Return the response
        return creationRequestResponse;
    } catch (error) {
        console.error('Error creating gift card:', error);
        throw error;
    }
}