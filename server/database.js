import {createRequire} from "module";

const require = createRequire(import.meta.url);
const mysql = require('mysql2');
const dbConfig = require("../assets/conf.json");
const types = ['titolo', 'testo', 'paragraph']; // Tipi di componenti da cercare
const excludeWords = ["text"]
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
        let results = [];
        const sql = `
            SELECT a.id,
                   a.nome,
                   a.visibilita,
                   a.autore,
                   a.dataCreazione,
                   a.dataModifica,
                   ROUND(SUM((LENGTH(LOWER(c.contenuto)) - LENGTH(REPLACE(LOWER(c.contenuto), LOWER(?), ''))) /
                             LENGTH(LOWER(?)))) AS count
            FROM appunto AS a
                     JOIN componente AS c ON a.id = c.idAppunto
            WHERE c.tipo IN (?)
              AND MATCH(c.contenuto) AGAINST(? IN BOOLEAN MODE)
            GROUP BY a.id, a.nome, a.visibilita, a.autore, a.dataCreazione, a.dataModifica
            ORDER BY count DESC
        `;
        try {
            console.log('Search string:', searchString); // Log the search string
            const [queryResults] = await db.promise().query(sql, [searchString, searchString, types, '*' + searchString + '*']);
            // Convert the count to an integer
            results = queryResults.map(result => ({...result, count: parseInt(result.count)}));
            console.log('Search results:', results); // Log the results
            return results;
        } catch (error) {
            console.error('Search error:', error); // Log the error
        }
        return results;
    },

    login: async (username, password) => {
        const sql = 'SELECT * FROM utente WHERE username = ? AND password = ?';
        const [results] = await db.promise().query(sql, [username, password]);
        return results.length > 0;
    },

    updateUsername: async (oldUsername, newUsername) => {
        const sql = 'UPDATE utente SET username = ? WHERE username = ?';
        const [results] = await db.promise().query(sql, [newUsername, oldUsername]);
        return results;
    },

    updateEmail: async (username, newEmail) => {
        const sql = 'UPDATE utente SET mail = ? WHERE username = ?';
        const [results] = await db.promise().query(sql, [newEmail, username]);
        return results;
    },

    updatePassword: async (username, oldPassword, newPassword) => {
        const checkSql = 'SELECT * FROM utente WHERE username = ? AND password = ?';
        const [checkResults] = await db.promise().query(checkSql, [username, oldPassword]);
        if (checkResults.length > 0) {
            const sql = 'UPDATE utente SET password = ? WHERE username = ?';
            const [results] = await db.promise().query(sql, [newPassword, username]);
            return results;
        } else {
            throw new Error('Old password is incorrect');
        }
    },

    updateProfilePicture: async (username, newImagePath) => {
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
            const result = db.promise().query(sql, [id, element.type, position, elemData]);
            return result;
        } catch (error) {
            console.log(error)
            return null;
        }
    },

    modifyComponentPos: async (oldPos, newPos) => {
        const sql = `UPDATE componente
                     SET posizione = ?
                     WHERE posizione = ?`;
        try {
            const result = db.promise().query(sql, [newPos, oldPos]);
            return result;
        } catch (error) {
            console.log(error)
            return null;
        }
    },

    modifyComponentContent: async (idNote, pos, newContent) => {
        const sql = `UPDATE componente
                     SET contenuto = ?
                     WHERE posizione = ?
                       AND idAppunto = ?`;
        try {
            return db.promise().query(sql, [newContent, pos, idNote]);
        } catch (error) {
            return null;
        }
    },

    deleteComponent: async (pos) => {
        const sql = `DELETE
                     FROM componente
                     WHERE posizione = ?`;
        try {
            const result = await db.promise().query(sql, [pos]);
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
            console.log("err")
            console.log(error);
            return null;
        }
    },

    getNumComponents: async (id) => {
        const sql = `SELECT COUNT(*)
                     FROM componente
                     WHERE idAppunto = ?`;
        try {
            const result = await db.promise().query(sql, [id]);
            return result;
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
    },

    register: async (username, password, email) => {
        const sql = 'INSERT INTO utente (username, password, mail) VALUES (?, ?, ?)';
        try {
            const [results] = await db.promise().query(sql, [username, password, email]);
            return results;
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    followUser: async (followerUsername, followedUsername) => {
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
    },

    getFollowedUsers: async (username) => {
        const sql = `SELECT u2.username
                     FROM utente AS u
                              JOIN utenteFollow AS uf ON u.id = uf.idUtenteSegue
                              JOIN utente AS u2 ON u2.id = uf.idUtenteSeguito
                     WHERE u.username = ?`;
        try {
            const result = await db.promise().query(sql, [username]);
            return result[0];
        } catch (error) {
            return null;
        }
    },

    getAccountData: async (username) => {
        const sql = `SELECT username, mail, img
                     FROM utente
                     WHERE username = ?`;
        try {
            return db.promise().query(sql, [username]);
        } catch (error) {
            console.log(error);
            return null;
        }
    }, 

    getFeed: async (username) => {
        const sql = `
            SELECT appunto.id, appunto.nome, appunto.visibilita, appunto.autore, AVG(valutazione.valore) as rating
            FROM appunto
                     LEFT JOIN valutazione ON appunto.id = valutazione.idAppunto
            WHERE appunto.autore IN (SELECT idUtenteSeguito
                                     FROM utenteFollow
                                     WHERE idUtenteSegue = (SELECT id FROM utente WHERE username = ?))
              AND appunto.dataCreazione >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
              AND appunto.visibilita = 1
            GROUP BY appunto.id
            ORDER BY rating DESC
        `;
        try {
            const result = await db.promise().query(sql, [username]);
            return result[0];
        } catch (error) {
            console.error(error);
            return null;
        }
    }, 

    getFeedByCategories: async (username, categories) => {
        const categoriesString = categories.map(category => `'${category}'`).join(',');

        const sql = `
            SELECT appunto.id, appunto.nome, appunto.visibilita, appunto.autore, AVG(valutazione.valore) as rating
            FROM appunto
                     LEFT JOIN valutazione ON appunto.id = valutazione.idAppunto
                     INNER JOIN categoriaAppunto ON appunto.id = categoriaAppunto.idAppunto
                     INNER JOIN categoria ON categoriaAppunto.idCategoria = categoria.id
            WHERE categoria.nome IN (${categoriesString})
              AND appunto.visibilita = 1
              AND appunto.dataCreazione >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY appunto.id
            ORDER BY rating DESC
        `;
        try {
            const result = await db.promise().query(sql);
            return result[0];
        } catch (error) {
            console.error(error);
            return null;
        }
    }, 

    getFollowedCategories: async (username) => {
        // Prima query: otteniamo l'ID dell'utente
        const getUserIdSql = 'SELECT id FROM utente WHERE username = ?';
        const [userIdResult] = await db.promise().query(getUserIdSql, [username]);
        const userId = userIdResult[0].id;

        // Seconda query: otteniamo gli ID delle categorie seguite dall'utente
        const getFollowedCategoriesIdSql = 'SELECT idCategoria FROM categoriaFollow WHERE idUtente = ?';
        const [followedCategoriesIdResult] = await db.promise().query(getFollowedCategoriesIdSql, [userId]);
        const followedCategoriesIds = followedCategoriesIdResult.map(row => row.idCategoria);

        // Terza query: otteniamo i nomi delle categorie corrispondenti agli ID
        const getCategoriesNamesSql = 'SELECT nome FROM categoria WHERE id IN (?)';
        const [categoriesNamesResult] = await db.promise().query(getCategoriesNamesSql, [followedCategoriesIds]);

        // Creiamo un array con i nomi delle categorie
        return categoriesNamesResult.map(row => row.nome);
    }, 

    removeCategoriesFromNote: async (noteTitle, author, categories) => {
        // Get the note's ID
        const getNoteIdSql = 'SELECT id FROM appunto WHERE nome = ? AND autore = (SELECT id FROM utente WHERE username = ?)';
        const [noteIdResults] = await db.promise().query(getNoteIdSql, [noteTitle, author]);
        const noteId = noteIdResults[0].id;

        // Get the IDs of the categories
        const getCategoryIdsSql = 'SELECT id FROM categoria WHERE nome IN (?)';
        const [categoryIdsResults] = await db.promise().query(getCategoryIdsSql, [categories]);
        const categoryIds = categoryIdsResults.map(row => row.id);

        // Delete the rows in the `categoriaAppunto` table
        const deleteSql = 'DELETE FROM categoriaAppunto WHERE idAppunto = ? AND idCategoria IN (?)';
        const [deleteResults] = await db.promise().query(deleteSql, [noteId, categoryIds]);
        return deleteResults;
    }, 

    addCategoriesToNote: async (noteTitle, author, categories) => {
        // Normalize categories and remove duplicates
        categories = [...new Set(categories.map(category => category.trim().replace(/\s\s+/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())))];

        // Get the note's ID
        const getNoteIdSql = 'SELECT id FROM appunto WHERE nome = ? AND autore = (SELECT id FROM utente WHERE username = ?)';
        const [noteIdResults] = await db.promise().query(getNoteIdSql, [noteTitle, author]);
        const noteId = noteIdResults[0].id;

        // Process each category
        await Promise.all(categories.map(async (category) => {
            // Ensure the category exists
            const createCategorySql = 'INSERT IGNORE INTO categoria (nome) VALUES (?)';
            await db.promise().query(createCategorySql, [category]);

            // Get the category ID
            const getCategoryIdSql = 'SELECT id FROM categoria WHERE nome = ?';
            const [categoryIdResults] = await db.promise().query(getCategoryIdSql, [category]);
            const categoryId = categoryIdResults[0].id;

            // Associate the category with the note
            const associateSql = 'INSERT IGNORE INTO categoriaAppunto (idAppunto, idCategoria) VALUES (?, ?)';
            await db.promise().query(associateSql, [noteId, categoryId]);
        }));
    }, 

    changeNoteTitle: async (oldTitle, newTitle) => {
        const sql = `UPDATE appunto
                     SET nome = ?
                     WHERE nome = ?`;
        try {
            const result = db.promise().query(sql, [newTitle, oldTitle]);
            return result;
        } catch (error) {
            console.log("error")
            console.log(error)
            return null;
        }
    }, 

    searchUsers: async (searchString, currentUsername) => {
        const sql = `
            SELECT u.id,
                   u.username,
                   (SELECT COUNT(*) FROM utenteFollow WHERE idUtenteSeguito = u.id) AS followersCount,
                   (SELECT COUNT(*) FROM utenteFollow WHERE idUtenteSegue = u.id)   AS followingCount,
                   u.img                                                            AS profilePicture
            FROM utente u
            WHERE MATCH(u.username) AGAINST(? IN BOOLEAN MODE)
              AND u.username != ?
        `;
        try {
            const [results] = await db.promise().query(sql, [searchString + '*', currentUsername]);
            return results;
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    },

    searchCategories: async (searchString) => {
        const sql = `
            SELECT nome
            FROM categoria
            WHERE MATCH(nome) AGAINST(? IN BOOLEAN MODE)
        `;
        try {
            const [results] = await db.promise().query(sql, [searchString + '*']);
            return results;
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    },

    isCategoryFollowedByUser: async (username, category) => {
        const sql = `
            SELECT COUNT(*) as count
            FROM categoriaFollow
            WHERE idUtente = (SELECT id FROM utente WHERE username = ?)
              AND idCategoria = (SELECT id FROM categoria WHERE nome = ?)
        `;
        const [results] = await db.promise().query(sql, [username, category]);
        return results[0].count > 0;
    },

    isUserFollowedByUser: async (followerUsername, followedUsername) => {
        const sql = `
            SELECT COUNT(*) as count
            FROM utenteFollow
            WHERE idUtenteSegue = (SELECT id FROM utente WHERE username = ?)
              AND idUtenteSeguito = (SELECT id FROM utente WHERE username = ?)
        `;
        const [results] = await db.promise().query(sql, [followerUsername, followedUsername]);
        return results[0].count > 0;
    },

    getCategoryFollowersCount: async (categoryName) => {
        const sql = `
            SELECT COUNT(*) as count
            FROM categoriaFollow
            WHERE idCategoria = (SELECT id FROM categoria WHERE nome = ?)
        `;
        const [results] = await db.promise().query(sql, [categoryName]);
        return results[0].count;
    },

    getNoteRatingByUser: async (username, note, author) => {
        const sql = `SELECT v.valore FROM valutazione AS v 
        JOIN appunto AS a ON a.id = v.idAppunto
        JOIN utente AS ua ON ua.id = a.autore
        JOIN utente AS uv ON uv.id = v.idUtente
        WHERE a.nome = ? AND ua.username = ? AND uv.username = ?`;
        try {
            const result = db.promise().query(sql, [note, author, username]);
            return result;
        } catch (error) {
            return [];
        }
    }
};