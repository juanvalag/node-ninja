import dotenv from 'dotenv';
import mysqlPromise from 'mysql2/promise';
import httpReferrer from './httpreferrer.js';

// load .env configuration
dotenv.config();
// connect to MySQL
const db = await mysqlPromise.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// count handler
export default async function (req) {
    // hash of referring URL
    const hash = httpReferrer(req);
    // no referrer?
    if (!hash) return null;
    // fetch browser IP address and user agent
    const
        ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        ua = req.get('User-Agent') || null;
    try {
        console.log('Before insert...');
        // store page hit
        await db.execute(
            'INSERT INTO `hit` (hash, ip, ua) VALUES (UNHEX(?), ?, ?);',
            [hash, ip, ua]
        );
        // fetch page hit count
        const [res] = await db.query(
            'SELECT COUNT(1) AS `count` FROM `hit` WHERE hash = UNHEX(?);',
            [hash]);
        return res?.[0]?.count;
    }
    catch (err) {
        console.log(err);
        throw new Error('DB error', { cause: err });
    }
}
