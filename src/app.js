let db;

const dbType = process.env.VECTOR_DB_TYPE || "redis";

if (dbType === 'pgvector') {
    db = require('./vectorStores/pgvector.js');
} else if (dbType === 'redis') {
    db = require('./vectorStores/redis.js');
} else {
    db = require('./vectorStores/array.js');
}

module.exports = {
    upsertDocuments: db.upsertDocuments,
    querySimilar: db.querySimilar
};