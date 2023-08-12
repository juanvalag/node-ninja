import express, { Express } from 'express';
import { dirname, sep } from 'path';
import { fileURLToPath } from 'url';
import { HomeController } from './controllers/home.controller.js';
import { GameController } from './controllers/game.controller.js';
import { APP_TITLE } from './utils/constants.js';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url)) + sep;
const cfg = {
    dev: ((process.env.NODE_ENV ?? 'dev').trim().toLowerCase() !== 'production'),
    port: process.env.NODE_PORT ?? 8000,
    domain: process.env.QUIZ_WEB_DOMAIN,
    wsDomain: process.env.QUIZ_WS_DOMAIN,
    dir: {
        root: __dirname,
        static: __dirname + 'static' + sep,
        views: __dirname + 'views' + sep
    }
};

const app: Express = express();
app.set('view engine', 'ejs');
app.set('views', cfg.dir.views);

const controllers = [new HomeController(app), new GameController(app)];
app.use(express.static(cfg.dir.static))

// 404 error
app.use((req, res) => {
    res.status(404).render('error', { title: APP_TITLE, error: 'Not found?' });
});

app.listen(cfg.port, () => {
    console.log(`Server started at ${cfg.domain}`);
});

export { app }