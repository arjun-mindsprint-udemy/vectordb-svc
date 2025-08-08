const express = require('express');
require('dotenv').config();

const { upsertDocuments, querySimilar } = require('./app.js');

const app = express()
const port = 3023
const topK = 3
const metric = "cosine"

app.use(express.json())

app.post('/upsert', async (req, res) => {
    try {
        const { docs } = req.body;
        await upsertDocuments(docs);
        res.json({ message: 'Upserted successfully' });
    } catch (error) {
        console.error('Upsert error:', error);
        res.status(500).json({ error: 'Upsert failed', details: error.message });
    }
});

app.post('/query', async (req, res) => {
    const { embedding, topK, metric} = req.body;
    const results = await querySimilar(embedding, topK, metric);
    textList = results.map(d => d.text)
    console.log("textList: ", textList)
    res.json({ textList });
});

app.get('/health', (req, res) => {
    res.json({ status: "UP" });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});