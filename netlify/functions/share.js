const { MongoClient, ServerApiVersion } = require('mongodb');

const userDbUri = "mongodb+srv://ponthiyankalanand:tWMhydJVYFUOzm9N@cluster0.efaq6.mongodb.net/userDB?ssl=true&retryWrites=true&w=majority";

const userDbClient = new MongoClient(userDbUri, {
    serverApi: { version: ServerApiVersion.v1 },
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 3000,
    autoSelectFamily: false,
});

const connectToDatabase = async () => {
    await userDbClient.connect();
};

exports.handler = async (event, context) => {
    await connectToDatabase();

    const { name, id, hash } = JSON.parse(event.body);

    if (!name || !id || !hash) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Name, ID, and hash are required' }),
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow CORS from all origins
            },
        };
    }

    try {
        const userDb = userDbClient.db();
        const usersCollection = userDb.collection('users');

        await usersCollection.insertOne({ name, id, hash });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User details saved!' }),
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow CORS from all origins
            },
        };
    } catch (err) {
        console.error('Error saving user data to userDB:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error saving user data' }),
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow CORS from all origins
            },
        };
    }
};
