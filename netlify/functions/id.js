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