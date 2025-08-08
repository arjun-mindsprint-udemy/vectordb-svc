const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.PGVECTOR_URL
});

// Ensure the table exists (run once at startup)
async function ensureTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS vectors (
            id TEXT PRIMARY KEY,
            embedding VECTOR(1536), -- adjust dimension as needed
            text TEXT
        );
    `);
}
ensureTable();

async function upsertDocuments(docs) {
    const client = await pool.connect();
    try {
        for (const doc of docs) {
            await client.query(
                `INSERT INTO vectors (id, embedding, text)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (id) DO UPDATE SET embedding = $2, text = $3`,
                [
                    doc.id,
                    `[${doc.embedding.join(',')}]`, // pgvector expects array-like string
                    doc.text
                ]
            );
        }
    } finally {
        client.release();
    }
}

async function querySimilar(embedding, topK = 3) {
    let operator = '<=>'; // Euclidean by default
    if (metric === 'cosine') operator = '<=>'; // pgvector uses <=> for cosine if normalized
    if (metric === 'dot') operator = '<#>';    // dot product
    // See pgvector docs for exact operator usage


    const res = await pool.query(
        `SELECT id, text, embedding ${operator} $1 AS score
         FROM vectors
         ORDER BY score ASC
         LIMIT $2`,
        [`[${embedding.join(',')}]`, topK]
    );
    // Lower score = more similar for <#> operator
    return res.rows.map(row => ({
        id: row.id,
        text: row.text,
        score: row.score // convert distance to similarity (optional)
    }));
}

module.exports = { upsertDocuments, querySimilar };