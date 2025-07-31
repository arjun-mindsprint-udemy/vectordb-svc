const vectorStore = []

function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum+ val*val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum+ val*val, 0));
    return dot / (normA * normB);
}

function upsertDocuments(docs) {
    vectorStore.push(...docs);
}

function querySimilar(embedding, topK = 3) {
    console.log("vectorStore: ", vectorStore)
    results = vectorStore
    .map(doc => ({ ...doc, score: cosineSimilarity(embedding, doc.embedding)}))
    .sort((a,b) => b.score - a.score)
    .slice(0, topK);
    return results
}

module.exports = {upsertDocuments, querySimilar};