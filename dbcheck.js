
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ponthiyankal01:PeoXR0Tg6ol4VWqr@cluster0.efaq6.mongodb.net/userDB?ssl=true&retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
        },
        tls: true,  // Just enable TLS without specifying the version
        tlsAllowInvalidCertificates: true,  // Optionally allow invalid certificates if necessary
        serverSelectionTimeoutMS: 3000,
        autoSelectFamily: false,
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);
