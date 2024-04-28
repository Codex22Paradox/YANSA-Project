const express = require('express');
const path = require('path');

const app = express();

// Utilizza il middleware express.json() per analizzare le richieste JSON
app.use(express.json());

// Fornisce la cartella "public"
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});