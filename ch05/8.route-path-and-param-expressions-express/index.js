import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, sep } from 'path';
import compression from 'compression';
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
/*  
    Por defecto las rutas en express son case insensitive
    Para habilitar la diferenciación de mayusculas se usa:
        app.set('case sensitive routing', true);

    Por defecto se ignoran los slash al final de la ruta
    lo que da que /hello/ y /hello sean la misma ruta
    Para deshabilitar este comportamiento se usa:
        app.set('strict routing', true);
*/
app.set('view engine', 'ejs');
app.set('views', cfg.dir.views);
app.use(compression());
/* 
    Para los métodos POST,PUT,DELETE,etc
    express también provee sus propios métodos
        app.post('/', (req, res) => {});
        app.put('/', (req, res) => {});
        app.delete('/', (req, res) => {});
    para manejar todos los métodos en una sola ruta:
        app.all('/', (req, res) => {});
*/
app.get('/', (req, res) => {
    res.render('message', { title: 'Hello World!' });
});
/*
    Usando expresiones Path-to-RegExp
    para parametros de url y otras expresiones
    mas info en: https://www.npmjs.com/package/path-to-regexp#:~:text=and%20populate%20keys.-,Named%20Parameters,-Named%20parameters%20are
*/
app.get('/author/:name/book/:bookName', (req, res, next) => {
    const author = req.params.name, book = req.params.bookName;
    res.render('message', { title: `${author} wrote the book ${book}` });
});
app.get('/cal*/', (req, res) => {
    res.render('message', { title: `Usando Path-to-RegExp para cualquier ruta que inicie en cal` });
});
app.get('/:scream(a+h$)/', (req, res) => {
    res.render('message', { title: `Usando Path-to-RegExp para gritar ${req.params.scream}` });
});
/*  
    Usando expresiones Regex
*/
app.get(/.+Script$/, (req, res) => {
    res.render('message', { title: `Usando Regex para las rutas ECMAScript y JavaScript` });
});


app.use(express.static(cfg.dir.static));
app.use((req, res) => {
    res.status(404).render('message', { title: 'Not found' });
});
app.listen(cfg.port, () => {
    console.log(`Example app listening at http://localhost:${cfg.port}`);
});
export { cfg, app };