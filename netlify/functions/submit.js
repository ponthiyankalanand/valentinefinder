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

// Handle preflight CORS requests (OPTIONS)
const handlePreflight = () => {
    return {
        statusCode: 200,
        body: '',
        headers: {
            'Access-Control-Allow-Origin': 'https://valantainfinder.netlify.app/.netlify/functions/submit',  // Allow all origins (replace '*' with your frontend URL in production)
            'Access-Control-Allow-Methods': 'OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    };
};

exports.handler = async (event, context) => {
    // Handle preflight CORS request (OPTIONS)
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight();
    }

    await connectToDatabase();

    const { name, id, hash } = JSON.parse(event.body);

    if (!name || !id || !hash) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Name, ID, and hash are required' }),
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow all origins (replace '*' with your frontend URL in production)
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    }

    try {
        const responseDb = responseDbClient.db();
        const responsesCollection = responseDb.collection('responses');

        await responsesCollection.insertOne({ name, id, hash });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Happy :)' }),
            headers: {
                'Access-Control-Allow-Origin': '*',  // Allow all origins (replace '*' with your frontend URL in production)
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    } catch (err) {
        console.error('Error saving data to responseDB:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Sad :(' }),
            headers: {
                'Access-Control-Allow-Origin': '*',  // Allow all origins (replace '*' with your frontend URL in production)
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    }
};
