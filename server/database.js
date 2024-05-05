import {createRequire} from "module";

const require = createRequire(import.meta.url);
const mysql = require('mysql2');
const dbConfig = require("../assets/conf.json");
const types = ['titolo', 'testo']; // Tipi di componenti da cercare
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
    }, getPublicNotesByUser: async (userId) => {
        const sql = 'SELECT * FROM appunto WHERE autore = ? AND visibilita = ?';
        const [results] = await db.promise().query(sql, [userId, 1]);
        for (let i = 0; i < results.length; i++) {
            results[i].averageRating = await databaseFunction.getAverageRating(results[i].id);
        }
        return results;
    }, getAllNotesByUser: async (userId) => {
        const sql = 'SELECT * FROM appunto WHERE autore = ?';
        const [results] = await db.promise().query(sql, [userId]);
        for (let i = 0; i < results.length; i++) {
            results[i].averageRating = await databaseFunction.getAverageRating(results[i].id);
        }
        return results;
    }, getAverageRating: async (appuntoId) => {
        const sql = 'SELECT AVG(valore) as averageRating FROM valutazione WHERE idAppunto = ?';
        const [results] = await db.promise().query(sql, [appuntoId]);
        return results[0].averageRating;
    }, insertRating: async (username, appuntoId, rating) => {
        const checkSql = 'SELECT * FROM valutazione WHERE idUtente = (SELECT id FROM utente WHERE username = ?) AND idAppunto = ?';
        const [results] = await db.promise().query(checkSql, [username, appuntoId]);
        if (results.length === 0) {
            const insertSql = 'INSERT INTO valutazione (idUtente, idAppunto, valore) VALUES ((SELECT id FROM utente WHERE username = ?), ?, ?)';
            const [insertResults] = await db.promise().query(insertSql, [username, appuntoId, rating]);
            return insertResults;
        } else {
            return null;
        }
    }, searchNotes: async (searchString) => {
        if (!searchString) {
            throw new Error('Search string cannot be empty');
        }
        const pattern = '%' + searchString + '%';
        const sqlAppunto = 'SELECT id, nome, (LENGTH(nome) - LENGTH(REPLACE(nome, ?, ""))) / LENGTH(?) as count FROM appunto WHERE nome LIKE ? ORDER BY count DESC';
        const sqlComponente = 'SELECT idAppunto, (LENGTH(contenuto) - LENGTH(REPLACE(contenuto, ?, ""))) / LENGTH(?) as count FROM componente WHERE contenuto LIKE ? AND tipo IN (?) GROUP BY idAppunto ORDER BY count DESC';
        const [resultsAppunto] = await db.promise().query(sqlAppunto, [searchString, searchString, pattern]);
        const [resultsComponente] = await db.promise().query(sqlComponente, [searchString, searchString, pattern, types]);
        return {resultsAppunto, resultsComponente};
    }, login: async (username, password) => {
        const sql = 'SELECT * FROM utente WHERE username = ? AND password = ?';
        const [results] = await db.promise().query(sql, [username, password]);
        return results.length > 0;
    }, updateUsername: async (oldUsername, newUsername) => {
        const sql = 'UPDATE utente SET username = ? WHERE username = ?';
        const [results] = await db.promise().query(sql, [newUsername, oldUsername]);
        return results;
    }, updateEmail: async (username, newEmail) => {
        const sql = 'UPDATE utente SET mail = ? WHERE username = ?';
        const [results] = await db.promise().query(sql, [newEmail, username]);
        return results;
    }, updatePassword: async (username, oldPassword, newPassword) => {
        const checkSql = 'SELECT * FROM utente WHERE username = ? AND password = ?';
        const [checkResults] = await db.promise().query(checkSql, [username, oldPassword]);
        if (checkResults.length > 0) {
            const sql = 'UPDATE utente SET password = ? WHERE username = ?';
            const [results] = await db.promise().query(sql, [newPassword, username]);
            return results;
        } else {
            throw new Error('Old password is incorrect');
        }
    }, updateProfilePicture: async (username, newImagePath) => {
        const sql = 'UPDATE utente SET img = ? WHERE username = ?';
        const [results] = await db.promise().query(sql, [newImagePath, username]);
        return results;
    },

    /*
    {
        title: "title",
        author: "autor",
        date: "date"
    }
    */
    saveNewNote: async (note) => {
        const getSql = `SELECT nome, autore
                        FROM appunto
                        WHERE nome = ?
                          AND autore = (SELECT u.id
                                        FROM utente AS u
                                        WHERE u.username = ?)`;
        const [getResults] = await db.promise().query(getSql, [note.title, note.author]);
        if (getResults.length === 0) {
            const sql = `INSERT INTO appunto (nome, autore, dataCreazione)
                         VALUES (?, ?, ?)`;
            try {
                const idSql = 'SELECT id FROM utente WHERE username = ?';
                const [userId] = await db.promise().query(idSql, [note.author]);
                const [results] = await db.promise().query(sql, [note.title, userId[0].id, note.date]);
                return results;
            } catch (error) {
                return null;
            }
        } else {
            return null;
        }
    },

    saveComponent: async (element, id, position) => {
        const sql = `INSERT INTO componente (idAppunto, tipo, posizione, contenuto)
                     VALUES (?, ?, ?, ?)`;
        try {
            const elemData = JSON.stringify(element.data);
            const [result] = db.promise().query(sql, [id, element.type, position, elemData]);
            return result;
        } catch (error) {
            console.log(error)
            return null;
        }
    },

    modifyComponentPos: async (element, newPos) => {
        const sql = `UPDATE componente
                     SET posizione = ?
                     WHERE id = ?`;
        try {
            const [result] = db.promise().query(sql, [newPos, element]);
            return result;
        } catch (error) {
            return null;
        }
    },

    getNote: async (title) => {
        const sql = `SELECT a.nome,
                            a.visibilita,
                            a.dataCreazione,
                            a.dataModifica,
                            u.username,
                            c.tipo,
                            c.posizione,
                            c.contenuto
                     FROM appunto AS a
                              JOIN componente AS c ON a.id = c.idAppunto
                              JOIN utente AS u ON u.id = a.autore
                     WHERE a.nome = ?`;
        try {
            const [results] = await db.promise().query(sql, [title]);
            console.log("res1")
            console.log(results)
            return results;
        } catch (error) {
            console.log(error)
            return null;
        }
    },

    getNoteData: async (title) => {
        const sql = `SELECT a.id, a.nome, a.visibilita, u.username, a.dataCreazione, a.dataModifica, c.nome AS nomeCat
                     FROM appunto AS a
                              JOIN utente AS u ON a.autore = u.id
                              JOIN categoriaAppunto AS ca ON a.id = ca.idAppunto
                              JOIN categoria AS c ON ca.idCategoria = c.id
                     WHERE a.nome = ?`;
        try {
            const [results] = await db.promise().query(sql, [title]);
            const returnable = {
                id: results[0].id,
                nome: results[0].nome,
                visibilita: results[0].visibilita,
                username: results[0].username,
                dataCreazione: results[0].dataCreazione,
                dataModifica: results[0].dataModifica,
                categorie: []
            }
            results.forEach((element) => {
                returnable.categorie.push(element.nomeCat);
            })
            return returnable;
        } catch (error) {
            return null;
        }
    },

    deleteNote: async (noteTitle) => {
        const sql = `DELETE
                     FROM appunto
                     WHERE nome = ?`;
        try {
            const [results] = await db.promise().query(sql, [noteTitle]);
            return results;
        } catch (error) {
            return null;
        }
    },

    getAllNotesByCategory: async (category) => {
        const sql = `SELECT a.nome
                     FROM appunto AS a
                              JOIN categoriaAppunto AS ca ON a.id = ca.idAppunto
                              JOIN categoria AS c ON ca.idCategoria = c.id
                     WHERE c.nome = ?
                       AND a.visibilita <> 0`;
        try {
            const results = await db.promise().query(sql, [category]);
            return results[0];
        } catch (error) {
            console.log(error)
            return null;
        }
    }, register: async (username, password, email) => {
        const sql = 'INSERT INTO utente (username, password, mail) VALUES (?, ?, ?)';
        try {
            const [results] = await db.promise().query(sql, [username, password, email]);
            return results;
        } catch (error) {
            console.error(error);
            return null;
        }
    }, followUser: async (followerUsername, followedUsername) => {
        const getFollowerIdSql = 'SELECT id FROM utente WHERE username = ?';
        const getFollowedIdSql = 'SELECT id FROM utente WHERE username = ?';
        const insertFollowSql = 'INSERT INTO utenteFollow (idUtenteSegue, idUtenteSeguito) VALUES (?, ?)';

        try {
            const [followerResults] = await db.promise().query(getFollowerIdSql, [followerUsername]);
            const [followedResults] = await db.promise().query(getFollowedIdSql, [followedUsername]);

            if (followerResults.length > 0 && followedResults.length > 0) {
                const followerId = followerResults[0].id;
                const followedId = followedResults[0].id;

                const [insertResults] = await db.promise().query(insertFollowSql, [followerId, followedId]);
                return insertResults;
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    unfollowUser: async (followerUsername, followedUsername) => {
        const getFollowerIdSql = 'SELECT id FROM utente WHERE username = ?';
        const getFollowedIdSql = 'SELECT id FROM utente WHERE username = ?';
        const deleteFollowSql = 'DELETE FROM utenteFollow WHERE idUtenteSegue = ? AND idUtenteSeguito = ?';

        try {
            const [followerResults] = await db.promise().query(getFollowerIdSql, [followerUsername]);
            const [followedResults] = await db.promise().query(getFollowedIdSql, [followedUsername]);

            if (followerResults.length > 0 && followedResults.length > 0) {
                const followerId = followerResults[0].id;
                const followedId = followedResults[0].id;

                const [deleteResults] = await db.promise().query(deleteFollowSql, [followerId, followedId]);
                return deleteResults;
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    followCategory: async (username, categoryName) => {
        const getUserIdSql = 'SELECT id FROM utente WHERE username = ?';
        const getCategoryIdSql = 'SELECT id FROM categoria WHERE nome = ?';
        const insertFollowSql = 'INSERT INTO categoriaFollow (idUtente, idCategoria) VALUES (?, ?)';

        try {
            const [userResults] = await db.promise().query(getUserIdSql, [username]);
            const [categoryResults] = await db.promise().query(getCategoryIdSql, [categoryName]);

            if (userResults.length > 0 && categoryResults.length > 0) {
                const userId = userResults[0].id;
                const categoryId = categoryResults[0].id;

                const [insertResults] = await db.promise().query(insertFollowSql, [userId, categoryId]);
                return insertResults;
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    unfollowCategory: async (username, categoryName) => {
        const getUserIdSql = 'SELECT id FROM utente WHERE username = ?';
        const getCategoryIdSql = 'SELECT id FROM categoria WHERE nome = ?';
        const deleteFollowSql = 'DELETE FROM categoriaFollow WHERE idUtente = ? AND idCategoria = ?';

        try {
            const [userResults] = await db.promise().query(getUserIdSql, [username]);
            const [categoryResults] = await db.promise().query(getCategoryIdSql, [categoryName]);

            if (userResults.length > 0 && categoryResults.length > 0) {
                const userId = userResults[0].id;
                const categoryId = categoryResults[0].id;

                const [deleteResults] = await db.promise().query(deleteFollowSql, [userId, categoryId]);
                return deleteResults;
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }

};