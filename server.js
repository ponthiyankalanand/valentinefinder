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

// CORS middleware to allow all origins (for development purposes)
const corsOptions = {
    origin: '*',  // Allow all origins, adjust this for production security
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
};
app.use(cors(corsOptions));

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
// Serve the index.html when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle URL with or without `id` parameter
app.get('/id', async (req, res) => {
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

// API to submit data (ensure proper CORS handling)
app.post('/submit', async (req, res) => {
    const { name, id, hash } = req.body;

    if (!name || !id || !hash) {
        return res.status(400).json({ error: 'Name, ID, and hash are required' });
    }

    try {
        const responseDb = responseDbClient.db();
        const responsesCollection = responseDb.collection('responses');

        await responsesCollection.insertOne({ name, id, hash });

        res.status(200).json({ message: 'Happy :)' });
    } catch (err) {
        console.error('Error saving data to responseDB:', err);
        res.status(500).json({ error: 'Sad :(' });
    }
});

// API to share data (ensure proper CORS handling)
app.post('/share', async (req, res) => {
    const { name, id, hash } = req.body;

    if (!name || !hash || !id) {
        return res.status(400).json({ error: 'Name and ID are required' });
    }

    try {
        const userDb = userDbClient.db();
        const usersCollection = userDb.collection('users');

        await usersCollection.insertOne({ name, id, hash });

        res.status(200).json({ message: 'User details saved!' });
    } catch (err) {
        console.error('Error saving user data to userDB:', err);
        res.status(500).json({ error: 'Error saving user data' });
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
