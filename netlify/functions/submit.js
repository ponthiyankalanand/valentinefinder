const { MongoClient, ServerApiVersion } = require('mongodb');

const userDbUri = "mongodb+srv://ponthiyankalanand:tWMhydJVYFUOzm9N@cluster0.efaq6.mongodb.net/userDB?ssl=true&retryWrites=true&w=majority";
const responseDbUri = "mongodb+srv://ponthiyankalanand:tWMhydJVYFUOzm9N@cluster0.efaq6.mongodb.net/responseDB?ssl=true&retryWrites=true&w=majority";

const responseDbClient = new MongoClient(responseDbUri, {
  serverApi: { version: ServerApiVersion.v1 },
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 3000,
  autoSelectFamily: false,
});

const connectToDatabase = async () => {
  await responseDbClient.connect();
};

exports.handler = async (event, context) => {
  await connectToDatabase();

  const { name, id, hash } = JSON.parse(event.body);

  if (!name || !id || !hash) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Name, ID, and hash are required' }),
    };
  }

  try {
    const responseDb = responseDbClient.db();
    const responsesCollection = responseDb.collection('responses');

    await responsesCollection.insertOne({ name, id, hash });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Happy :)' }),
    };
  } catch (err) {
    console.error('Error saving data to responseDB:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Sad :(' }),
    };
  }
};
