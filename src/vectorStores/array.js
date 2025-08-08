const vectorStore = []
const { getSimilarity } = require('../similarity_metrics/similarityMetrics');

async function upsertDocuments(docs) {
    vectorStore.push(...docs);
    return Promise.resolve();
}

async function querySimilar(embedding, topK = 3, metric = 'cosine') {
    console.log("vectorStore: ", vectorStore)
    const similarityFn = getSimilarity(metric);
    results = vectorStore
    .map(doc => ({ ...doc, score: similarityFn(embedding, doc.embedding)}))
    .sort((a,b) => b.score - a.score)
    .slice(0, topK);
    return Promise.resolve(results)
}

module.exports = {upsertDocuments, querySimilar};