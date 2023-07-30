import express from 'express';
import { createServer } from 'https';
import fs from 'fs';

const cfg = {
    port: process.env.PORT || 3000
};

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

createServer(
    {
        key: fs.readFileSync('./server.key'),
        cert: fs.readFileSync('./server.crt')
    },
    app
).listen(cfg.port);