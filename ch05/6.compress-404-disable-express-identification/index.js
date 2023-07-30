import express from 'express';
import compression from 'compression';

const cfg = {
    port: process.env.PORT || 3000
};

const app = express();
// do not identify Express
app.disable('x-powered-by');

// HTTP compression
app.use(compression());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use(express.static('static'));

// 404 error
app.use((req, res) => {
    res.status(404).send('Not found');
});

app.listen(cfg.port, () => {
    console.log(`Example app listening at http://localhost:${cfg.port}`);
});