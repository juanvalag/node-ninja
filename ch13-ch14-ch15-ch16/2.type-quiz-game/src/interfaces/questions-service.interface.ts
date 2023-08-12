export interface IQuestionsService {
    importQuestions: () => Promise<number>;
    countQuestions: () => Promise<number>;
}