import {createRequire} from "module";

const require = createRequire(import.meta.url);
const mysql = require('mysql2');
const dbConfig = require("./asset.json");

const db = mysql.createConnection(dbConfig);
db.connect((err) => {
    if (err) {
        console.log("Errore di connessione al database: ", err);
    }
    console.log("Connesso al database!");
});

export const databaseFunction = {
    getUserId: async (username) => {
        const sql = 'SELECT id FROM utente WHERE username = ?';
        const [results] = await db.promise().query(sql, [username]);
        return results[0].id;
    },
    getPublicNotesByUser: async (userId) => {
        const sql = 'SELECT * FROM appunto WHERE autore = ? AND visibilita = ?';
        const [results] = await db.promise().query(sql, [userId, 1]);
        for (let i = 0; i < results.length; i++) {
            results[i].averageRating = await databaseFunction.getAverageRating(results[i].id);
        }
        return results;
    },
    getAllNotesByUser: async (userId) => {
        const sql = 'SELECT * FROM appunto WHERE autore = ?';
        const [results] = await db.promise().query(sql, [userId]);
        for (let i = 0; i < results.length; i++) {
            results[i].averageRating = await databaseFunction.getAverageRating(results[i].id);
        }
        return results;
    },
    getAverageRating: async (appuntoId) => {
        const sql = 'SELECT AVG(valore) as averageRating FROM valutazione WHERE idAppunto = ?';
        const [results] = await db.promise().query(sql, [appuntoId]);
        return results[0].averageRating;
    },
    insertRating: async (username, appuntoId, rating) => {
        const checkSql = 'SELECT * FROM valutazione WHERE idUtente = (SELECT id FROM utente WHERE username = ?) AND idAppunto = ?';
        const [results] = await db.promise().query(checkSql, [username, appuntoId]);
        if (results.length === 0) {
            const insertSql = 'INSERT INTO valutazione (idUtente, idAppunto, valore) VALUES ((SELECT id FROM utente WHERE username = ?), ?, ?)';
            const [insertResults] = await db.promise().query(insertSql, [username, appuntoId, rating]);
            return insertResults;
        } else {
            return null;
        }
    },
    searchNotes: async (searchString) => {
        if (!searchString) {
            throw new Error('Search string cannot be empty');
        }
        const pattern = '%' + searchString + '%';
        const sqlAppunto = 'SELECT id, nome, (LENGTH(nome) - LENGTH(REPLACE(nome, ?, ""))) / LENGTH(?) as count FROM appunto WHERE nome LIKE ?';
        const sqlComponente = 'SELECT idAppunto, (LENGTH(contenuto) - LENGTH(REPLACE(contenuto, ?, ""))) / LENGTH(?) as count FROM componente WHERE contenuto LIKE ? GROUP BY idAppunto';
        const [resultsAppunto] = await db.promise().query(sqlAppunto, [searchString, searchString, pattern]);
        const [resultsComponente] = await db.promise().query(sqlComponente, [searchString, searchString, pattern]);
        return {resultsAppunto, resultsComponente};
    },
};