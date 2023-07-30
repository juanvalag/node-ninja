import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import httpReferrer from './httpreferrer.js';

// load .env configuration
dotenv.config();
// connect to MongoDB
const client = new MongoClient(
    `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_INITDB_HOST}:${process.env.MONGO_INITDB_PORT}/`,
    { useNewUrlParser: true, useUnifiedTopology: true }
);
await client.connect();

const
    db = client.db(process.env.MONGO_INITDB_DATABASE),
    hit = db.collection('hit');

// add collection index
await hit.createIndex({ hash: 1, time: 1 });

// count handler
export default async function (req) {
    // hash of referring URL
    const hash = httpReferrer(req);
    // no referrer?
    if (!hash) return null;
    // fetch browser IP address and user agent
    const
        ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        ua = req.get('User-Agent') || null,
        time = new Date();
    try {
        // store page hit
        await hit.insertOne({ hash, ip, ua, time });
        /* 
        Contar solo las visitas de diferente IP, pero es mejor con aggregate
        return (await hit.distinct('ip', { hash })).length;
         */
        return hit.countDocuments({ hash });
    }
    catch (err) {
        throw new Error('DB error', { cause: err });
    }
}
