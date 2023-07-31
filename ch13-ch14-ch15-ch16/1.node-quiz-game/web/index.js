// Express
import express from 'express';
import compression from 'compression';
// modules
import { questionCount, gameCreate, gameFetch } from './libshared/quizdb.js';
import { questionsImport } from './lib/questionsimport.js';
import * as libId from './libshared/libid.js';
// configuration
const cfg = {
    dev: ((process.env.NODE_ENV).trim().toLowerCase() !== 'production'),
    port: process.env.NODE_PORT || 8000,
    domain: process.env.QUIZ_WEB_DOMAIN,
    wsDomain: process.env.QUIZ_WS_DOMAIN,
    title: process.env.QUIZ_TITLE,
    questionsMax: parseInt(process.env.QUIZ_QUESTIONS_MAX, 10)
};
// Express initiation
const app = express();
// use EJS templates
app.set('view engine', 'ejs');
app.set('views', 'views');
// GZIP
app.use(compression());
// body parsing
app.use(express.urlencoded({ extended: true }));