import { IQuestionsService } from '../interfaces/questions-service.interface.js';
import QuestionsDao from '../daos/questions.dao.js';
import { cleanString, formatAnswer } from '../utils/utils.js';
import fetch from 'node-fetch';

class QuestionsService implements IQuestionsService {
    maxQuestions = parseInt(process.env.QUIZ_QUESTIONS_MAX ?? '100', 10);
    private maxApiCalls = 10;
    private maxApiFetch = 50;
    private quizApi = `https://opentdb.com/api.php?amount=${this.maxApiFetch}`;

    async importQuestions() {
        let imported = 0;

        const qCount = await QuestionsDao.countQuestions();

        if (qCount < this.maxQuestions) {

            // fetch questions from API
            const questions = (await Promise.allSettled(

                // make multiple API calls
                Array(Math.min(this.maxApiCalls, Math.ceil((this.maxQuestions - qCount) / this.maxApiFetch)))
                    .fill(this.quizApi)
                    .map((url, idx) => fetch(`${url}#${idx}`))

            )
                .then(response => Promise.allSettled(response.map(res => res.value?.json())))
                .then(json => json.map(j => j.value?.results || [])))
                .flat()
                .map(q => {

                    // format question and answers
                    const
                        question = cleanString(q.category.replace(/.+:/, '')) + ': ' + cleanString(q.question),
                        answer = [
                            { text: cleanString(q.correct_answer), correct: true },
                            ...q.incorrect_answers.map(i => ({ text: cleanString(i), correct: false }))
                        ].sort((a, b) => {
                            return formatAnswer(a.text) > formatAnswer(b.text) ? 1 : -1;
                        });

                    return { question, answer };

                });

            // add to database in sequence
            for (let q of questions) {
                imported += (await QuestionsDao.addQuestion(q.question, q.answer) ? 1 : 0);
            }

        }

        return imported;
    };

    async countQuestions() {
        return QuestionsDao.countQuestions();
    }
}

export default new QuestionsService();