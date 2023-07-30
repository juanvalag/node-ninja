import express from 'express';

const cfg = {
    port: process.env.PORT || 3000
};

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

// body parsing
app.use(express.urlencoded({ extended: true }));
// use .all to handle initial GET and POST
app.all('/', (req, res, next) => {
    /* 
    When the recevied data is sent from the browser default HTML5 form
    The data sent follows these rules: https://www.w3.org/TR/2012/WD-html5-20120329/form-submission.html#constructing-form-data-set
    (the checkbox value is sent only if the checkbox was selected)
    */
    if (req.method === 'GET' || req.method === 'POST') {
        console.dir(req.body);
        res.render('form', {
            title: 'Parse HTTP POST data',
            data: req.body
        });
    }
    else {
        next();
    }
});

app.listen(cfg.port, () => {
    console.log(`Example app listening at http://localhost:${cfg.port}`);
});