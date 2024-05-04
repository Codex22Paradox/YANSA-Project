import {createRequire} from "module";
import {databaseFunction} from "./server/database.js";
import session from 'express-session';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import {megaFunction} from "./server/mega.js";

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
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


app.get('/notesAccount/:username/:username2', async (req, res) => {
    const username = req.params.username;
    const username2 = req.params.username2;
    try {
        if (username !== username2) {
            const appunti = await databaseFunction.getPublicNotesByUser(username);
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
app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const result = await databaseFunction.login(username, password);
        if (result) {
            // Crea un token
            const token = jwt.sign({id: username}, 'your-secret-key', {
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

