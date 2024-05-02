import {createRequire} from "module";
import {databaseFunction} from "./server/database.js";

const express = require('express');
const path = require('path');
const app = express();
const require = createRequire(import.meta.url);

// Utilizza il middleware express.json() per analizzare le richieste JSON
app.use(express.json());

// Fornisce la cartella "public"
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


app.get('/notesAccount/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const userId = await databaseFunction.getUserId(username);
        const appunti = await databaseFunction.getAppuntiByUser(userId);
        res.json(appunti);
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