import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, sep } from 'path';
import compression from 'compression';
import { helloRouter } from './routes/hello.js';
const __dirname = dirname(fileURLToPath(import.meta.url)) + sep;
const cfg = {
    port: process.env.PORT || 3000,
    dir: {
        root: __dirname,
        static: __dirname + 'static' + sep,
        views: __dirname + 'views' + sep
    }
};
console.dir(cfg, { depth: null, color: true });
const app = express();
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', cfg.dir.views);
app.use(compression());

app.use('/hello', helloRouter);

app.use(express.static(cfg.dir.static));
app.use((req, res) => {
    res.status(404).render('message', { title: 'Not found' });
});
app.listen(cfg.port, () => {
    console.log(`Example app listening at http://localhost:${cfg.port}`);
});
export { cfg, app };