// Import required modules
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize the Express application
const app = express();
const port = 3000; // You can use any port you prefer

// Middleware to parse JSON data
app.use(bodyParser.json());

// MongoDB URIs
const userDbUri = "mongodb+srv://ponthiyankalanand:tWMhydJVYFUOzm9N@cluster0.efaq6.mongodb.net/userDB?ssl=true&retryWrites=true&w=majority";
const responseDbUri = "mongodb+srv://ponthiyankalanand:tWMhydJVYFUOzm9N@cluster0.efaq6.mongodb.net/responseDB?ssl=true&retryWrites=true&w=majority";

// Connect to the userDB and responseDB using MongoClient
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

// Establish connections to the databases
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

// Define the API endpoint to receive the data and store it in the responseDB
app.post('/api/submit', async (req, res) => {
    const { name, id, hash } = req.body;
    console.log("getApi",name, id, hash);

    // Ensure the required data exists
    if (!name || !id || !hash) {
        return res.status(400).json({ error: 'Name, ID, and hash are required' });
    }

    try {
        const responseDb = responseDbClient.db();
        const responsesCollection = responseDb.collection('responses');

        // Insert a new document into the 'responses' collection
        await responsesCollection.insertOne({ name, id, hash });

        // Send a success response
        res.status(200).json({ message: 'Happy :)' });
    } catch (err) {
        console.error('Error saving data to responseDB:', err);
        res.status(500).json({ error: 'Sad :(' });
    }
});

// Define the API endpoint to store user data in userDB (share endpoint)
app.post('/api/share', async (req, res) => {
    const { name, id, hash } = req.body;
    console.log("shareAPI;",name, id, hash);

    // Ensure the required data exists
    if (!name || !hash || !id) {
        return res.status(400).json({ error: 'Name and ID are required' });
    }

    try {
        const userDb = userDbClient.db();
        const usersCollection = userDb.collection('users');

        // Insert a new document into the 'users' collection
        await usersCollection.insertOne({ name, id, hash });

        // Send a success response
        res.status(200).json({ message: 'User details saved!' });
    } catch (err) {
        console.error('Error saving user data to userDB:', err);
        res.status(500).json({ error: 'Error saving user data' });
    }
});
app.get('/api/distinct-hashes', async (req, res) => {
    const { userName } = req.query;

    if (!userName) {
        return res.status(400).json({ error: 'User name is required' });
    }

    try {
        console.log(userName);

        // Access userDB and the 'users' collection
        const userDb = userDbClient.db(); // Use the client instance for userDB
        const usersCollection = userDb.collection('users');

        // Step 1: Get the id from the 'user' collection where the user matches 'userName'
        const user = await usersCollection.findOne({ name: userName }, { projection: { id: 1, _id: 0 } });
        console.log("user", user);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Extract the user ID
        const userId = user.id;

        // Access responseDB and the 'responses' collection
        const responseDb = responseDbClient.db(); // Use the client instance for responseDB
        const responsesCollection = responseDb.collection('responses');

        // Step 2: Query UserResponse for hashes that match the user ID
        const distinctHashes = await responsesCollection.find({ hash: { $in: [userId] } }).project({ hash: 1, _id: 0 }).toArray();

        console.log(distinctHashes);

        // Return the result
        res.status(200).json({ distinctHashes });

    } catch (err) {
        console.error('Error fetching distinct hashes:', err);
        res.status(500).json({ error: 'Error fetching data' });
    }
});


// Default route for the homepage (redirects to index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the HTML file
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
