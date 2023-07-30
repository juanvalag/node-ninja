import express from 'express';

const cfg = {
    port: process.env.PORT || 3000
};

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
// render form
app.get('/', (req, res) => {
    console.dir(req.query);
    res.render('form', {
        title: 'Parse HTTP GET data',
        data: req.query
    });
});

app.listen(cfg.port, () => {
    console.log(`Example app listening at http://localhost:${cfg.port}`);
});