import { BaseController } from './base.controller.js';
import express from 'express';

export class GameController extends BaseController {
    constructor(app: express.Application) {
        super(app, '/game');
    }
    setRoutes() {

        return this.router;
    }
}