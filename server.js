// Import required modules
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();

// MongoDB URI
const userDbUri = "mongodb+srv://ponthiyankalanand:tWMhydJVYFUOzm9N@cluster0.efaq6.mongodb.net/userDB?ssl=true&retryWrites=true&w=majority";
const responseDbUri = "mongodb+srv://ponthiyankalanand:tWMhydJVYFUOzm9N@cluster0.efaq6.mongodb.net/responseDB?ssl=true&retryWrites=true&w=majority";

// Enable CORS for all domains (for testing purposes)
app.use(cors());

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
        body: 'sending response for CORS',
        headers: {
            'Access-Control-Allow-Origin': 'https://valantinefinder.netlify.app', // Allow specific origin
            'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST and OPTIONS
            'Access-Control-Allow-Headers': 'Content-Type', // Allow Content-Type header
        },
    };
};

// Common CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://valantinefinder.netlify.app', // Allow specific origin
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST and OPTIONS
    'Access-Control-Allow-Headers': 'Content-Type', // Allow Content-Type header
};

exports.handler = async (event, context) => {
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

// Middleware to parse JSON data
app.use(bodyParser.json());

// MongoDB client initialization
const userDbClient = new MongoClient(userDbUri, {
    serverApi: {
        version: ServerApiVersion.v1,
    },
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 3000,
    autoSelectFamily: false,
});

const responseDbClient = new MongoClient(responseDbUri, {
    serverApi: {
        version: ServerApiVersion.v1,
    },
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 3000,
    autoSelectFamily: false,
});

// Connect to the databases
async function connectToDatabases() {
    try {
        await userDbClient.connect();
        console.log('Connected to userDB');
        await responseDbClient.connect();
        console.log('Connected to responseDB');
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
}

// Call the function to connect to the databases
connectToDatabases();


// Handle URL with or without `id` parameter
app.get('/', async (req, res) => {
    const { id } = req.query; // Extract the 'id' query parameter from the URL

    if (id) {
        // If `id` parameter is provided, fetch related data from the database
        try {
            const responseDb = responseDbClient.db();
            const responsesCollection = responseDb.collection('responses');

            // Query the database for the data that matches the provided `id`
            const response = await responsesCollection.findOne({ id });

            if (!response) {
                return res.status(404).json({ error: 'No data found for the provided ID' });
            }

            // Return the data associated with the `id`
            res.status(200).json({ response });
        } catch (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ error: 'Error fetching data' });
        }
    } else {
        // If no `id` parameter is provided, handle the request differently
        res.status(200).json({ message: 'Welcome! Please provide an ID in the query string for more details.' });
    }
});



// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
