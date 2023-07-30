import express from 'express';

const cfg = {
    port: process.env.PORT || 3000
};

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(cfg.port, () => {
    console.log(`Example app listening at http://localhost:${cfg.port}`);
});