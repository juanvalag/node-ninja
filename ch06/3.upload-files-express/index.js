import express from 'express';
import formidable from 'formidable';
import { fileURLToPath } from 'url';
import { dirname, parse, sep } from 'path';
const
    __dirname = dirname(fileURLToPath(import.meta.url)) + sep,
    cfg = {
        port: process.env.PORT || 3000,
        dir: {
            root: __dirname,
            uploads: __dirname + 'uploads' + sep
        }
    };
// Express initiation
const app = express();
// use EJS templates
app.set('view engine', 'ejs');
app.set('views', 'views');
// static assets
app.use(express.static(cfg.dir.uploads));

/* 
El middleware de express del parseo del body ya NO se requiere
porque formidable hace el parseo automaticamente
*/

// render form
// use .all to handle initial GET and POST
app.all('/', (req, res, next) => {
    if (req.method === 'GET' || req.method === 'POST') {
        // parse uploaded file data
        const VALID_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'svg'];
        const form = formidable({
            uploadDir: cfg.dir.uploads,
            keepExtensions: true,
            filter: (part) => VALID_IMAGE_EXTS.includes(part.originalFilename?.split('.')?.pop())
        });
        form.parse(req, (err, data, files) => {
            if (err) {
                next(err);
                return;
            }
            if (files?.images && files.images.length > 0) {
                data.filename = files.images[0].originalFilename;
                data.filetype = files.images[0].mimetype;
                data.filesize = Math.ceil(files.images[0].size / 1024) + ' KB';
                data.uploadto = files.images[0].filepath;
                data.imageurl = '/' + files.images[0].newFilename;
            }
            res.render('form', { title: 'Parse HTTP POST file data', data });
        });
    }
    else {
        next();
    }
});

// start server
app.listen(cfg.port, () => {
    console.log(`Example app listening at http://localhost:${cfg.port}`);
});