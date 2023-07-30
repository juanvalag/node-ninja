import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, sep } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url)) + sep;


const cfg = {
    port: process.env.PORT || 3000,
    dir: {
        root: __dirname,
        static: __dirname + 'static' + sep
    }
};
console.dir(cfg, { depth: null, color: true });

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use(express.static(cfg.dir.static));

app.listen(cfg.port, () => {
    console.log(`Example app listening at http://localhost:${cfg.port}`);
});

export { cfg, app };