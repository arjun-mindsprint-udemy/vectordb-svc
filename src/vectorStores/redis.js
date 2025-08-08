const { createClient } = require('redis');
const { getSimilarity } = require('../similarity_metrics/similarityMetrics');

const redisUrl = process.env.REDIS_URL;
const client = createClient({ url: redisUrl });

client.connect();

const VECTOR_KEY = 'vectors';

async function upsertDocuments(docs) {
    for (const doc of docs) {
        await client.hSet(VECTOR_KEY, doc.id, JSON.stringify(doc));
    }
}

async function querySimilar(embedding, topK = 3, metric='cosine') {
    const allDocs = await client.hVals(VECTOR_KEY);
    const docs = allDocs.map(str => JSON.parse(str));
    const similarityFn = getSimilarity(metric);
    const results = docs
        .map(doc => ({
            ...doc,
            score: similarityFn(embedding, doc.embedding)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    return results;
}

module.exports = { upsertDocuments, querySimilar };