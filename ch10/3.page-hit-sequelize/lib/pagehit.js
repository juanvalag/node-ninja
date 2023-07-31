import dotenv from 'dotenv';
import Sequelize from 'sequelize';
import httpReferrer from './httpreferrer.js';
// load .env configuration
dotenv.config();

// initialize ORM connection
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        dialect: 'mysql'
    }
);
// define Hit class
class Hit extends Sequelize.Model { }
Hit.init(
    {
        hash: {
            type: Sequelize.STRING(32),
            allowNull: false
        },
        ip: {
            type: Sequelize.STRING(15),
            allowNull: true
        },
        ua: {
            type: Sequelize.STRING(200),
            allowNull: true
        }
    },
    {
        indexes: [
            { fields: ['hash', 'createdAt'] }
        ],
        sequelize,
        modelName: 'hit'
    }
);

// synchronize model with database
await sequelize.sync();

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
        // store page hit
        await Hit.create(
            { hash, ip, ua }
        );
        // fetch page hit count
        const res = await Hit.findAndCountAll({
            where: { hash }
        });
        return res?.count;
    }
    catch (err) {
        throw new Error('DB error', { cause: err });
    }
}