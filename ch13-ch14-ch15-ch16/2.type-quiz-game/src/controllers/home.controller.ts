import { BaseController } from './base.controller.js';
import express from 'express';
import QuestionsService from '../services/questions.service.js';
import { APP_TITLE } from '../utils/constants.js';

export class HomeController extends BaseController {
    constructor(app: express.Application) {
        super(app, '/');
    }
    setRoutes() {
        this.router.get('/', this.getHome);
    }

    async getHome(req: express.Request, res: express.Response) {
        if (req.query.import) {
            res.redirect(`/?imported=${await QuestionsService.importQuestions()}`)
        } else {
            res.render('home', {
                title: APP_TITLE,
                questions: await QuestionsService.countQuestions(),
                maxQuestions: QuestionsService.maxQuestions,
                imported: req.query?.imported
            })
        }
    }
}