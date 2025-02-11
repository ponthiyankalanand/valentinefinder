const { MongoClient, ServerApiVersion } = require('mongodb');

const userDbUri = "mongodb+srv://ponthiyankalanand:tWMhydJVYFUOzm9N@cluster0.efaq6.mongodb.net/userDB?ssl=true&retryWrites=true&w=majority";
const responseDbUri = "mongodb+srv://ponthiyankalanand:tWMhydJVYFUOzm9N@cluster0.efaq6.mongodb.net/responseDB?ssl=true&retryWrites=true&w=majority";

const userDbClient = new MongoClient(userDbUri, {
    serverApi: {
        version: ServerApiVersion.v1,
    },
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 3000,
    autoSelectFamily: false
});

const responseDbClient = new MongoClient(responseDbUri, {
    serverApi: {
        version: ServerApiVersion.v1,
    },
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 3000,
    autoSelectFamily: false
});

const connectToDatabases = async () => {
  await userDbClient.connect();
  await responseDbClient.connect();
};

exports.handler = async (event, context) => {
  await connectToDatabases();

  const { userName } = event.queryStringParameters;

  if (!userName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'User name is required' }),
    };
  }

  try {
    const userDb = userDbClient.db();
    const usersCollection = userDb.collection('users');

    const user = await usersCollection.findOne({ name: userName }, { projection: { id: 1, _id: 0 } });

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    const userId = user.id;

    const responseDb = responseDbClient.db();
    const responsesCollection = responseDb.collection('responses');

    const distinctHashes = await responsesCollection.find({ hash: { $in: [userId] } }).project({ hash: 1, _id: 0 }).toArray();

    return {
      statusCode: 200,
      body: JSON.stringify({ distinctHashes }),
    };
  } catch (err) {
    console.error('Error fetching distinct hashes:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching data' }),
    };
  }
};
