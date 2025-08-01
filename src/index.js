const express = require('express');

const {upsertDocuments, querySimilar} = require('./app.js');

const app = express()
const port = 3023

app.use(express.json())

app.post('/upsert', (req, res)=> {
    const { docs } = req.body;
    upsertDocuments(docs);
    res.json({message: 'Upserted successfully'});
});

app.post('/query', (req, res)=> {
    const { embedding } = req.body;
    const results = querySimilar(embedding);
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