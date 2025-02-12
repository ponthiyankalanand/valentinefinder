const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB URIs
const responseDbUri = "mongodb+srv://ponthiyankalanand:tWMhydJVYFUOzm9N@cluster0.efaq6.mongodb.net/responseDB?ssl=true&retryWrites=true&w=majority";

// MongoDB Client
const responseDbClient = new MongoClient(responseDbUri, {
    serverApi: { version: ServerApiVersion.v1 },
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 3000,
    autoSelectFamily: false,
});

// Cache the connection to avoid reconnecting on every request
let isConnected = false;

const connectToDatabase = async () => {
    if (isConnected) return; // If already connected, skip reconnecting
    await responseDbClient.connect();
    isConnected = true;
};

// Common CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://valantinefinder.netlify.app', // Allow specific origin
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST and OPTIONS
    'Access-Control-Allow-Headers': 'Content-Type', // Allow Content-Type header
};

// Handle preflight CORS requests (OPTIONS)
const handlePreflight = () => ({
    statusCode: 200,
    body: 'sending response for CORS',
    headers: corsHeaders,
});

exports.handler = async (event) => {
    // Handle preflight CORS request (OPTIONS)
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight();
    }

    // Handle POST request
    if (event.httpMethod === 'POST') {
        await connectToDatabase();

        const { name, id, hash } = JSON.parse(event.body);

        if (!name || !id || !hash) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Name, ID, and hash are required' }),
                headers: corsHeaders,
            };
        }

        try {
            const responseDb = responseDbClient.db();
            const responsesCollection = responseDb.collection('responses');

            await responsesCollection.insertOne({ name, id, hash });

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Happy :)' }),
                headers: corsHeaders,
            };
        } catch (err) {
            console.error('Error saving data to responseDB:', err);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Sad :(' }),
                headers: corsHeaders,
            };
        }
    }

    // Handle unsupported HTTP methods
    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
        headers: corsHeaders,
    };
};