import {createRequire} from "module";
import {databaseFunction} from "./server/database.js";
import session from 'express-session';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import {v4 as uuidv4} from 'uuid';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
//import {megaFunction} from "./server/mega.js";
import {createNoteJson, executeMove} from "./server/util.js"

const require = createRequire(import.meta.url);
const tokenConfig = require("./assets/token.json");
const express = require('express');
const path = require('path');
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Utilizza il middleware express.json() per analizzare le richieste JSON
app.use(express.json());
// Fornisce la cartella "public"
app.use(express.static(path.join(__dirname, 'public')));
// Configura express-session
app.use(session({
    secret: tokenConfig.secret, resave: false, saveUninitialized: true, cookie: {maxAge: 2 * 60 * 60} // 2 ore
}));
// Middleware per verificare il token
app.use((req, res, next) => {
    if (req.path === '/login' || req.path === '/register') {
        // Salta la verifica del token per le rotte /login e /register
        next();
    } else {
        // Verifica il token per tutte le altre rotte
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(403).json({auth: false, message: 'No token provided.'});
        }
        jwt.verify(token, tokenConfig.secret, (err, decoded) => {
            if (err) {
                return res.status(500).json({auth: false, message: 'Failed to authenticate token.'});
            }
            // Se tutto va bene, salva la richiesta per l'uso in altre rotte
            req.userId = decoded.id;
            next();
        });
    }
});/**/
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

//Metodi post
app.post('/rateNote', async (req, res) => {
    const username = req.body.username;
    const appuntoId = req.body.appuntoId;
    const rating = req.body.rating;
    try {
        const result = await databaseFunction.insertRating(username, appuntoId, rating);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Errore del server');
    }
});
app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const result = await databaseFunction.login(username, password);
        if (result) {
            // Crea un token
            const token = jwt.sign({id: username}, tokenConfig.secret, {
                expiresIn: 2 * 60 * 60 // scade in 2 ore
            });
            // Restituisce il token
            res.status(200).json({auth: true, token: token});
        } else {
            res.status(401).json({auth: false, token: null});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.post('/updateUsername', async (req, res) => {
    const oldUsername = req.body.oldUsername;
    const newUsername = req.body.newUsername;
    try {
        const result = await databaseFunction.updateUsername(oldUsername, newUsername);
        if (result.affectedRows > 0) {
            res.status(200).json({message: 'Username updated successfully'});
        } else {
            res.status(404).json({message: 'Username not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.post('/updateEmail', async (req, res) => {
    const username = req.body.username;
    const newEmail = req.body.newEmail;
    try {
        const result = await databaseFunction.updateEmail(username, newEmail);
        if (result.affectedRows > 0) {
            res.status(200).json({message: 'Email updated successfully'});
        } else {
            res.status(404).json({message: 'Username not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.post('/updatePassword', async (req, res) => {
    const username = req.body.username;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    try {
        const result = await databaseFunction.updatePassword(username, oldPassword, newPassword);
        if (result.affectedRows > 0) {
            res.status(200).json({message: 'Password updated successfully'});
        } else {
            res.status(404).json({message: 'Username not found'});
        }
    } catch (error) {
        if (error.message === 'Old password is incorrect') {
            res.status(401).json({message: 'Old password is incorrect'});
        } else {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
});
app.post('/updateProfilePicture', multer().single('profilePicture'), async (req, res) => {
    const username = req.body.username;
    const profilePicture = req.file;
    try {
        const uniqueName = uuidv4() + '_' + profilePicture.originalname;
        await megaFunction.uploadFileToStorage(uniqueName, profilePicture.buffer);
        const result = await databaseFunction.updateProfilePicture(username, uniqueName);
        if (result.affectedRows > 0) {
            res.status(200).json({message: 'Profile picture updated successfully'});
        } else {
            res.status(404).json({message: 'Username not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
//TODO: capire cosa succede con (object.savecomponents)
app.post('/saveNote/new', async (req, res) => {
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const note = {
        title: req.body.title, author: req.userId, date: date
    }
    const blocks = req.body.contents;
    try {
        const result = await databaseFunction.saveNewNote(note);
        if (result.affectedRows > 0) {
            for (const element of blocks) {
                const i = blocks.indexOf(element);
                console.log(JSON.stringify(element.data))
                const results = await databaseFunction.saveComponent(element, result.insertId, i);
            }
            res.status(200).json({"Result": "OK"});
        } else {
            res.status(500).json({"Result": "Action failed"});
        }
    } catch (error) {
        res.status(500).send("a Internal server error");
    }
})
app.post('/feed', async (req, res) => {
    const type = req.body.type;
    const username = req.userId;
    const userId = await databaseFunction.getUserId(username)
    console.log("type")
    console.log(type)
    try {
        if (type === "user") {
            console.log("aaaaa")
            const result = await databaseFunction.getFollowedUsers(username);
            console.log("res");
            console.log(result);
            const array = [];
            for (const element of result) {
                const tmp = await databaseFunction.getPublicNotesByUser(userId);
                console.log("tmp")
                console.log(tmp)
                array.push(tmp);
            }
            console.log("res2")
            console.log(array);
        } else if (type === "category") {

        }
    } catch (error) {
        res.status(500).send("Something went wrong");
    }
})
app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    try {
        const result = await databaseFunction.register(username, password, email);
        if (result) {
            res.status(200).json({registration: true, message: 'Registration successful'});
        } else {
            res.status(400).json({registration: false, message: 'Registration failed'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.get('/followUser/:username', async (req, res) => {
    const followerUsername = req.userId;
    const followedUsername = req.params.username;
    try {
        const result = await databaseFunction.followUser(followerUsername, followedUsername);
        if (result) {
            res.status(200).json({followedAccount: true, message: 'Followed successfully'});
        } else {
            res.status(400).json({followedAccount: false, message: 'Follow failed'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.get('/unfollowUser/:username', async (req, res) => {
    const followerUsername = req.userId;
    const followedUsername = req.params.username;
    try {
        const result = await databaseFunction.unfollowUser(followerUsername, followedUsername);
        if (result) {
            res.status(200).json({unfollowedAccount: true, message: 'Unfollowed successfully'});
        } else {
            res.status(400).json({unfollowedAccount: false, message: 'Unfollow failed'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.get('/followCategory/:categoryName', async (req, res) => {
    const username = req.userId;
    const categoryName = req.params.categoryName;
    try {
        const result = await databaseFunction.followCategory(username, categoryName);
        if (result) {
            res.status(200).json({followedCategory: true, message: 'Category followed successfully'});
        } else {
            res.status(400).json({followedCategory: false, message: 'Follow category failed'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.get('/unfollowCategory/:categoryName', async (req, res) => {
    const username = req.userId;
    const categoryName = req.params.categoryName;
    try {
        const result = await databaseFunction.unfollowCategory(username, categoryName);
        if (result) {
            res.status(200).json({unfollowedCategory: true, message: 'Category unfollowed successfully'});
        } else {
            res.status(400).json({unfollowedCategory: false, message: 'Unfollow category failed'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
//added, modified e moved sono array che contengono i componenti modificati
app.post('/saveNote/modify', async (req, res) => {
    const added = req.body.added;
    const modified = req.body.modified;
    const deleted = req.body.deleted;
    const title = req.body.title;
    const newTitle = req.body.newTitle;
    const notePublic = req.body.public;
    try {
        const userId = await databaseFunction.getUserId(req.userId);
        await databaseFunction.changeNoteVisibility(userId, title, notePublic);
        let noteId = await databaseFunction.getNoteData(title);
        noteId = noteId.id;
        modified.forEach(async (element) => {
            const result = await databaseFunction.modifyComponentContent(noteId, element.pos, JSON.stringify(element.data));
        });
        let offset = 0;
        let componentNum = await databaseFunction.getNumComponents(noteId);
        componentNum = componentNum[0][0]["COUNT(*)"];
        deleted.sort((a, b) => a.pos - b.pos);
        deleted.forEach(async (element) => {
            const result = await databaseFunction.deleteComponent(element.pos + offset);
            for (let i = element.pos + offset + 1; i < componentNum; i++) {
                const result2 = await executeMove(i, -1);
            }
            offset--;
        });
        offset = 0;
        componentNum = await databaseFunction.getNumComponents(noteId);
        componentNum = componentNum[0][0]["COUNT(*)"];
        added.sort((a, b) => a.pos - b.pos);
        added.forEach(async (element) => {
            for (let i = componentNum - 1; i >= element.pos; i--) {
                const result2 = await executeMove(i, 1);
            }
            const result = await databaseFunction.saveComponent(element.data, noteId, element.pos);
            offset++;
        });
        offset = 0;
        if (newTitle !== "") {
            const result = await databaseFunction.changeNoteTitle(title, newTitle);
        }
        res.status(200).json({"result": "ok"});
    } catch (error) {
        console.log(error);
        res.status(500).send("Something went wrong");
    }
});
app.post('/categoryFeed', async (req, res) => {
    let category = req.body.category;
    const username = req.userId;
    if (category === null) {
        category = databaseFunction.getFollowedCategories(username);
    }
    try {
        const result = await databaseFunction.getFeedByCategories(category);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send("Something went wrong");
    }
});
app.post('/insertRating/:note', async (req, res) => {
    const noteTitle = req.params.note;
    const userName = req.userId;
    const rating = req.body.rating;
    try {
        const resultNote = await databaseFunction.getNoteData(noteTitle);
        const result = await databaseFunction.insertRating(userName, resultNote.id, rating);
        if (result) {
            res.status(200).json({"result": "ok"});
        } else {
            res.status(500).send("Something went wrong");
        }
    } catch (error) {
        res.status(500).send("Something went wrong");
    }
})
//Metodi get
app.get('/notesAccount/:username/', async (req, res) => {
    const username = req.userId;
    const username2 = req.params.username;
    try {
        if (username !== username2) {
            const id = await databaseFunction.getUserId(username2);
            const appunti = await databaseFunction.getPublicNotesByUser(id);
            res.json(appunti);
        } else {
            const userId = await databaseFunction.getUserId(username);
            const appunti = await databaseFunction.getAllNotesByUser(userId);
            res.json(appunti);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Errore del server');
    }
});
app.get('/searchNotes/:searchString', async (req, res) => {
    const searchString = req.params.searchString;
    try {
        const results = await databaseFunction.searchNotes(searchString);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('Errore del server');
    }
});
app.get('/getNote/:title', async (req, res) => {
    const title = req.params.title;
    const username = req.userId;
    try {
        const result = await databaseFunction.getNote(title);
        if (username === result[0].username) {
            const note = createNoteJson(result);
            res.status(200).json({"Result": JSON.stringify(note)})
        } else {
            if (result[0].visibilita !== 0) {
                const note = createNoteJson(result);
                res.status(200).json({"Result": JSON.stringify(note)})
            } else {
                res.status(401).json({"Result": "Unauthorized"})
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send("a Internal server error");
    }
});
app.get('/s/getNote/:title', async (req, res) => {
    const title = req.params.title;
    const username = req.userId;
    console.log("username")
    console.log(username)
    try {
        const result = await databaseFunction.getNoteData(title);
        if (username === result.username) {
            res.status(200).json({"Result": JSON.stringify(result)})
        } else {
            if (result[0].visibilita !== 0) {
                res.status(200).json({"Result": JSON.stringify(result)})
            } else {
                res.status(401).json({"Result": "Unauthorized"})
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send("a Internal server error 2");
    }
});
app.get('/category/:category', async (req, res) => {
    const categoria = req.params.category;
    const username = req.userId;
    try {
        const result = await databaseFunction.getAllNotesByCategory(categoria);
        const results = []
        for (const element of result) {
            const resultTmp = await databaseFunction.getNoteData(element.nome);
            results.push(resultTmp);
        }
        res.status(200).json({"Result": JSON.stringify(results)});
    } catch (error) {
        res.status(500).send("Something went wrong");
    }
});
app.get('/userFeed', async (req, res) => {
    const username = req.userId;
    try {
        const feed = await databaseFunction.getFeed(username);
        res.json(feed);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.get('/user/:username', async (req, res) => {
    const username = req.params.username;
    const userId = req.userId;
    try {
        let userData = await databaseFunction.getAccountData(username);
        userData = userData[0][0];
        console.log("res")
        console.log(userData)
        if (userData.username === userId) {
            userData = {
                username: userData.username, mail: userData.mail, img: userData.img
            }
        } else {
            userData = {
                username: userData.username, img: userData.img
            }
        }
        res.json({"Result": JSON.stringify(userData)});
    } catch (error) {
        res.status(500).send('a Internal Server Error');
    }
});
app.get('/userRating/:note', async (req, res) => {
    const username = req.userId;
    //:note è composto dal nome - autore
    const note = req.params.note.split('-')[0];
    const author = req.params.note.split('-')[1];
    try {
        const results = await databaseFunction.getNoteRatingByUser(username, note, author);
        res.status(200).json({ "result": results });
    } catch (error) {
        res.status(500).send('Something went wrong');
    }
})

//Metodi delete
app.delete('/deleteNote/:title', async (req, res) => {
    const title = req.params.title;
    const userName = req.userId;
    try {
        const result = await databaseFunction.getNoteData(title);
        console.log("res")
        console.log(result)
        if (result[0].username === userName) {
            const delRes = await databaseFunction.deleteNote(title);
            if (delRes !== null) {
                res.status(200).json({"Result": "ok"});
            } else {
                res.status(500).json({"Result": "Something went wrong"});
            }
        } else {
            res.status(401).send("Unauthorized");
        }
    } catch (error) {
        res.status(500).send("a Internal server error");
    }
});

app.post("/deleteCategory/:title", async (req, res) => {
    const username = req.userId;
    const categories = req.body.categories;
    const title = req.params.title;

    try {
        const result = await databaseFunction.removeCategoriesFromNote(title, username, categories);
        if (result) {
            res.status(200).json({message: "Categories removed successfully", result: true});
        } else {
            res.status(500).json({message: "An error occurred while removing categories"});
        }
    } catch (error) {
        res.status(500).json({message: "An error occurred while removing categories", error: error});
    }
});

app.post("/addCategory/:title", async (req, res) => {
    const username = req.userId;
    const categories = req.body.categories;
    const title = req.params.title;

    try {
        await databaseFunction.addCategoriesToNote(title, username, categories);
        res.status(200).json({message: "Categories added successfully", result: true});
    } catch (error) {
        res.status(500).json({message: "An error occurred while adding categories", error: error});
    }
});

app.get('/searchUsers/:searchString', async (req, res) => {
    const searchString = req.params.searchString;
    const currentUsername = req.userId;
    try {
        let results = await databaseFunction.searchUsers(searchString, currentUsername);
        console.log(results);
        for (let i = 0; i < results.length; i++) {
            console.log(results[i]);
            const isFollowed = await databaseFunction.isUserFollowedByUser(currentUsername, results[i].username);
            results[i] = {...results[i], isFollowed: isFollowed};
        }
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.toString()});
    }
});

app.get('/searchCategories/:searchString', async (req, res) => {
    const searchString = req.params.searchString;
    const currentUsername = req.userId;
    try {
        let results = await databaseFunction.searchCategories(searchString);
        for (let i = 0; i < results.length; i++) {
            const isFollowed = await databaseFunction.isCategoryFollowedByUser(currentUsername, results[i].nome);
            const followersCount = await databaseFunction.getCategoryFollowersCount(results[i].nome);
            results[i] = {...results[i], isFollowed: isFollowed, followersCount: followersCount};
        }
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.toString()});
    }
});

app.get('/followedCategories/', async (req, res) => {
    const username = req.userId;
    try {
        let categories = await databaseFunction.getFollowedCategories(username);
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});