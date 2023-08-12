import express from 'express';

export abstract class BaseController {
    public path: string;
    public router: express.Router;

    constructor(app: express.Application, path: string) {
        this.router = express.Router();
        this.path = path;
        app.use(path, this.router);
        this.setRoutes();
    }

    abstract setRoutes(): void;
}