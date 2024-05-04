import {createRequire} from "module";
import {Storage} from "megajs";
import {v4 as uuidv4} from 'uuid';
import * as url from "url";
import * as path from "path";
import fs from 'fs';

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const require = createRequire(import.meta.url);

// Leggi il file di configurazione
const conf = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/mega.json'), 'utf8'));

// Crea la connessione allo storage una sola volta
const storage = new Storage({
    email: conf.email,
    password: conf.password,
}).ready;

export const megaFunction = {
    findFileInStorage: async (name) => {
        const filePath = path.join('YANSA', name); // Aggiunge il nome della cartella al nome del file
        return await storage.find(filePath);
    },
    getFileFromStorage: async (name) => {
        const filePath = path.join('YANSA', name); // Aggiunge il nome della cartella al nome del file
        const file = await (await storage).find(filePath);
        if (file) {
            return file; // Restituisce l'oggetto File se esiste
        } else {
            throw new Error('File not found'); // Lancia un errore se il file non esiste
        }
    },
    uploadFileToStorage: async (name, data) => {
        const uniqueName = uuidv4() + '_' + name; // Genera un nome univoco per il file
        const filePath = path.join(__dirname, 'YANSA', uniqueName); // Crea il percorso del file nella cartella YANSA
        await (await storage).upload(filePath, data).complete;
    },
}
