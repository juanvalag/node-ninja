export NODE_ENV=development
# database credentials (root)
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=pgpassword

# quiz user credentials (app)
export POSTGRES_SERVER=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=quiz
export POSTGRES_QUIZUSER=quizuser
export POSTGRES_QUIZPASS=quizpass

# application settings
export QUIZ_TITLE="Multiplayer Quiz"
export QUIZ_WEB_DOMAIN=http://quiz.localhost
export QUIZ_WS_DOMAIN=ws://quizws.localhost/
export QUIZ_QUESTIONS_MAX=500