import { IncentivesAPI } from 'amazon-incentives-api';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Function to create a gift card
export async function createGiftCard() {

    // Load environment variables
    const secretAccessKey = process.env.AMAZON_SECRET_ACCESS_KEY;
    const accessKeyId = process.env.AMAZON_ACCESS_KEY_ID;
    const partnerId = process.env.AMAZON_PARTNER_ID;

    // Endpoint configuration
    const endpoint = { host: 'agcod-v2-gamma.amazon.com', region: 'us-east-1' };

    // Initialize IncentivesAPI client
    const client = new IncentivesAPI({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        partnerId: partnerId,
        endpoint: endpoint,
    });

    try {
        // Generate a unique request ID
        const uniqueRequestId = partnerId + Date.now();

        // Create the gift card
        const creationRequestResponse = await client.createGiftCard({
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

/**
 * 
 */
async function getAvailableFunds() {
    try {
        let availableFundsResponse = await client.getAvailableFunds();
        console.log(availableFundsResponse);
    } catch (error) {
        console.error('Error fetching available funds:', error);
    }
}
// getAvailableFunds();




// Scratchpad:
// https://s3.amazonaws.com/AGCOD/htmlSDKv2/htmlSDKv2_NAEUFE/index.html

// AGCOD Credentials Sandbox:
// https://www.amazon.com/gc/corp/account/keys/sandbox