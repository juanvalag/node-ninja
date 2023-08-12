// PostgreSQL database methods
import EventEmitter from 'events';
import pg from 'pg';

// data type parsers
pg.types.setTypeParser(pg.types.builtins.INT2, v => parseInt(v, 10));
pg.types.setTypeParser(pg.types.builtins.INT4, v => parseInt(v, 10));
pg.types.setTypeParser(pg.types.builtins.INT8, v => parseFloat(v));

const pool = new pg.Pool({
    host: process.env.POSTGRES_SERVER,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_QUIZUSER,
    password: process.env.POSTGRES_QUIZPASS
});

/**
 * Obtiene el número de preguntas almacenadas en la base de datos.
 * COUNT(1) lo que hace es que reemplaza todos los registros del conjunto de resultados con 1,
 * contando así todas las preguntas de la tabla. No hay una diferencia medible entre COUNT(1) y COUNT(*)
 * porque semanticamente representan lo mismo
 * @returns {Promise<number>} una promesa con el número de preguntas.
 */
export async function questionCount() {

    const res = await dbSelect('SELECT COUNT(1) FROM question;');
    return res?.[0]?.count;

}


/**
 * Añade una pregunta con las respectivas respuestas a la base de datos.
 * Se hace con una transacción, se inserta primero el texto de la pregunta
 * luego las respuestas haciendo referencia al id de la pregunta insertada
 * @param {string} question - texto de la pregunta
 * @param {Object[]} answers - respuestas a guardar
 * @param {string} answers[].text - texto de la respuesta
 * @param {string} answers[].correct - si la respuesta es correcta o no
 * @returns {boolean} - si se guardó la pregunta con las respuestas.
 */
export async function questionAdd(question, answers) {

    const client = await pool.connect();
    let commit = false;

    try {

        // new transaction
        await client.query('BEGIN');

        // add question
        const qId = await dbInsert({
            client,
            table: 'question',
            values: {
                text: question
            },
            return: 'id'
        })

        if (qId) {

            // insert answers in sequence
            let inserted = 0;
            for (let item of answers) {

                const a = await dbInsert({
                    client,
                    table: 'answer',
                    values: {
                        question_id: qId,
                        text: item.text,
                        correct: item.correct
                    }
                });

                if (a) inserted++;

            }

            // answers added?
            commit = inserted === answers.length;

        }

    }
    catch (err) {
    }
    finally {

        // commit or rollback transaction
        if (commit) {
            await client.query('COMMIT');
        }
        else {
            await client.query('ROLLBACK');
        }

        client.release();
    }

    return commit;

}


/**
 * Inserta un nuevo juego en la base de datos.
 * El juego inicia con una pregunta aleatoria de todas las ingresadas a la base de datos
 * @param {Object} gameData - información del nuevo juego
 * @param {number} gameData.questions_asked - número de preguntas ya hechas. Se restringe entre 1 y 50
 * @param {number} gameData.timeout_answered - tiempo en segundos después de la primera respuesta. Se restringe entre 5 y 60
 * @param {number} gameData.score_correct - puntaje por respuesta correcta. Se restringe entre -100 y 100
 * @param {number} gameData.score_fastest - puntaje por respuesta correcta más rápida. Se restringe entre -100 y 100.
 * @param {number} gameData.score_incorrect - puntaje por respuesta incorrecta. Se restringe entre -100 y 100.
 * @param {number} gameData.score_noanswer - puntaje por no responder. Se restringe entre -100 y 100.
 * @returns {number} el id del juego ingresado
 */
export async function gameCreate(gameData) {

    const qCount = await questionCount();

    return await dbInsert({
        table: 'game',
        values: {
            question_offset: Math.floor(Math.random() * qCount), // random starting question
            questions_asked: clamp(1, gameData.questions_asked, 50),
            timeout_answered: clamp(5, gameData.timeout_answered, 60),
            score_correct: clamp(-100, gameData.score_correct, 100),
            score_fastest: clamp(-100, gameData.score_fastest, 100),
            score_incorrect: clamp(-100, gameData.score_incorrect, 100),
            score_noanswer: clamp(-100, gameData.score_noanswer, 100)
        },
        return: 'id'
    });

}


/**
 * Asigna la fecha actual a time_started del juego con id gameId, iniciando así un juego
 * @param {number} gameId - id del juego a iniciar.
 * @returns {Object} el registro del juego actualizado.
 */
export async function gameStart(gameId) {

    return await dbUpdate({
        table: 'game',
        values: { time_started: 'NOW()' },
        where: { id: gameId }
    });

}


/**
 * Elimina el juego con id gameId de la base de datos.
 * Como se tiene una eliminación en cascada en las tablas player y pubsub, se eliminan esos registros
 * @param {number} gameId - id del juego a eliminar.
 * @returns el número de registros eliminados
 */
export async function gameRemove(gameId) {

    return await dbDelete({
        table: 'game',
        values: { id: gameId }
    });

}

/**
 * @typedef Game
 * @property {number} id
 * @property {number} question_offset
 * @property {number} questions_asked
 * @property {number} timeout_answered
 * @property {number} score_fastest
 * @property {number} score_correct
 * @property {number} score_noanswer
 * @property {string} time_created
 * @property {string} time_started
 */
/**
 * Obtiene el juego con id gameId
 * @param {number} gameId 
 * @returns {Game}
 */
export async function gameFetch(gameId) {

    const game = await dbSelect('SELECT * FROM game WHERE id=$1;', [gameId]);
    return game?.[0];

}


/**
 * Crea un nuevo registro de jugador en la base de datos.
 * @param {number} game_id - id al juego al que pertenece
 * @param {string} name - nombre del jugador
 * @returns {number} id del jugador ingresado
 */
export async function playerCreate(game_id, name) {

    return await dbInsert({
        table: 'player',
        values: { game_id, name },
        return: 'id'
    });

}


/**
 * Eliminar el jugador con id playerId de la base de datos 
 * @param {number} playerId 
 * @returns el número de registros eliminados
 */
export async function playerRemove(playerId) {

    return await dbDelete({
        table: 'player',
        values: { id: playerId }
    });

}

/**
 * @typedef Player
 * @property {number} id
 * @property {number} game_id
 * @property {string} name
 */
/**
 * Obtener el jugador con id gameId
 * @param {number} gameId - id del jugador a obtener
 * @returns {Player}
 */
export async function playersFetch(gameId) {

    return await dbSelect('SELECT * FROM player WHERE game_id=$1;', [gameId]);

}

/**
 * @typedef AnswerDto
 * @property {string} text
 * @property {boolean} correct
 */
/**
 * @typedef QuestionDto
 * @property {string} text
 * @property {AnswerDto[]} answers
 */
/**
 * Obtiene la siguiente pregunta con sus posibles respuestas, ordenadas por id, después de la pregunta qNum
 * @param {number} qNum pregunta antes de la que se
 * @returns {QuestionDto}
 */
export async function questionFetch(qNum) {

    // fetch question
    const
        qCount = await questionCount(),
        // Si el número de preguntas que se pide es menor que las que hay en la base se retorna la siguiente después de esa x pregunta
        // Si es igual a las que hay se retorna la pregunta cero
        // Si es mayor se retorna el residuo de n preguntas que se pide/n preguntas en la base
        question = await dbSelect('SELECT * FROM question ORDER BY id LIMIT 1 OFFSET $1', [qNum % qCount]);
    if (question.length !== 1) return null;

    const answers = await dbSelect('SELECT * FROM answer WHERE question_id=$1 ORDER BY id;', [question[0].id]);
    if (!answers.length) return null;

    return {
        text: question[0].text,
        answers: answers.map(a => { return { text: a.text, correct: a.correct } })
    };

}


/**
 * Realiza un query a la base de datos, 
 * @param {string} sql - SELECT query parametrizado a realizar 
 * @param {*[]} arg - parametros a reemplazar en el query
 * @returns {Promise<Player[]|Game[]>} una promesa con un array de objetos que representan las filas obtenidas
 */
async function dbSelect(sql, arg = []) {

    const client = await pool.connect();

    try {
        const result = await client.query(sql, arg);
        return result?.rows;
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.release();
    }

}


/**
 * Inserta un nuevo registro en la tabla table.
 * Las columnas son los keys de values y los valores de c/columna son los valores correspondientes en el objeto values.
 * Retorna el valor del nuevo registro en la columna return.
 * @param {Object} insertCommand - data a insertar
 * @param {string} insertCommand.table - tabla en la que se insertará
 * @param {Object.<string, number|string>} insertCommand.values - objeto con pares columna y valor a insertar
 * @param {string} insertCommand.return - campo a retornar del nuevo registro
 * @param {pg.PoolClient} [insertCommand.client] - cliente PostgreSQL donde se ejecutará el query.
 * @returns {Promise<boolean|string|number>} si se insertó el registro o el valor de la columna return del nuevo registro
 */
async function dbInsert(insertCommand) {

    const
        colToReturn = insertCommand.return ? ` RETURNING ${insertCommand.return}` : '',
        cols = Object.keys(insertCommand.values),
        paramPlaceholders = cols.map((v, i) => `$${i + 1}`),
        sql = `INSERT INTO ${insertCommand.table} (${cols.join()}) VALUES(${paramPlaceholders.join()})${colToReturn};`,
        client = insertCommand.client ?? await pool.connect();

    let success = false;

    try {

        // run insert
        const i = await client.query(sql, Object.values(insertCommand.values));

        // successful?
        success = i.rowCount === 1;

        // return value?
        if (success && insertCommand.return) {
            success = i.rows[0][insertCommand.return];
        }

    }
    catch (err) {
    }
    finally {
        if (!insertCommand.client) client.release();
    }

    return success;

}


/**
 * Actualiza uno o varios registros en la tabla table.
 * Las columnas y nuevos los valores están en las llaves y valores de values
 * Las columnas con los valores actuales para la condición están en las llaves y los valores de where 
 * @param {Object} updateCommand - data a actualizar
 * @param {string} updateCommand.table
 * @param {Object.<string, number|string>} updateCommand.values
 * @param {Object.<string, number|string>} updateCommand.where
 * @param {pg.PoolClient} [updateCommand.client] - cliente PostgreSQL donde se ejecutará el query.
 * @returns {Promise<number>} numero de registros actualizados
 */
async function dbUpdate(updateCommand) {

    const
        params = [...Object.values(updateCommand.values), ...Object.values(updateCommand.where)],
        cols = Object.keys(updateCommand.values),
        colsWithEqualToPlaceholder = cols.map((k, i) => `${k}=$${i + 1}`),
        whereCols = Object.keys(updateCommand.where),
        cond = whereCols.map((k, i) => `${k}=$${i + colsWithEqualToPlaceholder.length + 1}`),
        sql = `UPDATE ${updateCommand.table} SET ${colsWithEqualToPlaceholder.join()} WHERE ${cond.join()};`,
        client = updateCommand.client ?? await pool.connect();

    let updated = 0;

    try {

        // run update
        const u = await client.query(sql, params);

        // successful?
        updated = u.rowCount;

    }
    catch (err) {
    }
    finally {
        if (!updateCommand.client) client.release();
    }

    return updated;

}


/**
 * Elimina uno o varios registros en la tabla table.
 * Las columnas con los valores actuales para la condición están en las llaves y los valores de values.
 * Se unen con AND estas columnas y sus valores en la condición. 
 * @param {Object} delCommand - data a eliminar
 * @param {string} delCommand.table
 * @param {Object.<string, number|string>} delCommand.values
 * @param {pg.PoolClient} [delCommand.client] - cliente PostgreSQL donde se ejecutará el query.
 * @returns {Promise<number|boolean>} numero de registros eliminados o false si no se pudo eliminar
 */
async function dbDelete(delCommand) {

    const
        colsWithEqualToPlaceholders = Object.keys(delCommand.values).map((v, i) => `${v}=$${i + 1}`),
        sql = `DELETE FROM ${delCommand.table} WHERE ${colsWithEqualToPlaceholders.join(' AND ')};`,
        client = delCommand.client ?? await pool.connect();

    let deleted = false;

    try {

        // run delete
        const d = await client.query(sql, Object.values(delCommand.values));
        deleted = d.rowCount;

    }
    catch (err) {
    }
    finally {
        if (!delCommand.client) client.release();
    }

    return deleted;

}

/**
 * Clase que por medio del método listen (que no es parte de EventEmitter) inicia un query de escucha
 * para que el cliente de PostgeSQL reciba notificaciones en el canal `pubsub_insert` de PostgreSQL.
 * 
 * Este canal está definido en 001-quiz.sql: cuando se ejecuta pg_notify dentro del trigger después de cada inserción en la tabla pubsub,
 * pg_notify recibe el canal a notificar (`pubsub_insert`) y el mensaje (la fila insertada como un json, por medio de la funcion `row_to_json`).
 * 
 * Una vez se reciba una notificación de PostreSQL se emite un evento normal del EventEmitter
 * con id de evento como 'event:<id del juego>' y un objeto parametro que contiene el id del juego actual,
 * el tipo de evento, y los datos de ese evento.
 * 
 * EventEmitter en una clase que emula el manejo de eventos como pasa en el navegador,
 * donde el usuario hace mouse clicks, presiona teclas, etc y se ejecutan callbacks.
 * 
 * Permite enviar un mensaje a varios listeners cuando ocurre un evento.
 * Esta clase tiene dos funciones fundamentales on y emit
 * @example
 * const EventEmitter = require('events'); 
 * const eventEmitter = new EventEmitter();
 * eventEmmiter.on('idEvento', (param1, paramN...) => { 
 * // 23
 * console.log(param1);
 * });
 * eventEmitter.emit('idEvento', 23);
 * @extends EventEmitter
 */
class PubSub extends EventEmitter {

    //posiblemente delay se iba a usar para retrasar el recibimiento de eventos de alguna manera
    constructor(delay) {
        super();
    }

    async listen() {

        if (this.listening) return;
        this.listening = true;

        const client = await pool.connect();

        client.on('notification', event => {

            try {
                // debe ser `pubsub_insert` que está definido en 001-quiz.sql y es el canal al que se está escuchando
                console.log(event.channel);
                const payload = JSON.parse(event.payload);
                if (payload) {

                    this.emit(
                        `event:${payload.game_id}`,
                        {
                            gameId: payload.game_id,
                            type: payload.type,
                            data: payload.data
                        }
                    );

                }
            }
            catch (e) {
            }

        });

        client.query('LISTEN pubsub_insert;');

    }

}

/**
 * objeto que escuchará los eventos de la base en el canal `pubsub_insert`
 * emitiendolos a sus listeners para que este servidor se entere de lo que está pasando con el juego. 
 */
export const pubsub = new PubSub();
await pubsub.listen();


/**
 * Inserta un nuevo registro en la tabla pubsub con la información del evento suministrada.
 * Este nuevo registro representa un evento del juego.
 * Al insertar un evento todos los servidores web o websocket conectados a la base que esten escuchando el canal
 * `pubsub_insert` (definido por medio del trigger de la tabla pubsub en 001-quiz.sql) recibiran los datos del evento.
 * @param {number} game_id 
 * @param {string} type 
 * @param {Object.<string, number|string>} data 
 * @returns {Promise<number>} el id del nuevo registro
 */
export async function broadcast(game_id, type, data) {

    return await dbInsert({
        table: 'pubsub',
        values: { game_id, type, data },
        return: 'id'
    });

}


/**
 * Restringe que el número value esté en el rango entre min y max.
 * @param {number} min mínimo número posible en el rango
 * @param {string|number} value número a restringir, si es un string no convertible a número se transforma a cero
 * @param {number} max máximo número posible en el rango
 * @returns value si min <= value <= max. max si value > max, value < min retorna min
 */
function clamp(min = 0, value = 0, max = 0) {

    return Math.max(min, Math.min(parseInt(value || '0', 10) || 0, max));

}