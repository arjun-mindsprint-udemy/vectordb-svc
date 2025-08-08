function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (normA * normB);
}

function dotSimilarity(a, b) {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function euclideanSimilarity(a, b) {
    const dist = Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
    return 1 / (1 + dist); // Higher is more similar
}

function getSimilarity(metric) {
    if (metric === 'dot') return dotSimilarity;
    if (metric === 'euclidean') return euclideanSimilarity;
    return cosineSimilarity; // default
}

module.exports = { cosineSimilarity, dotSimilarity, euclideanSimilarity, getSimilarity};