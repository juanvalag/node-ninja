class QuestionDao {
    async countQuestions() {
        return 0;
    }
    async addQuestion(question: unknown, answer: unknown) {
        return 1;
    }
}

export default new QuestionDao();