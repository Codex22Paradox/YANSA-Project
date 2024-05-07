import {createRequire} from "module";
import {File, Storage} from "megajs";
import * as url from "url";
import * as path from "path";
import fs from 'fs';

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const require = createRequire(import.meta.url);

// Leggi il file di configurazione
const conf = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/mega.json'), 'utf8'));

// Crea la connessione allo storage una sola volta
const storage = new Storage({
    email: conf.email, password: conf.password,
}).ready;
let folder;
const root = await storage;
const existingFolder = root.find(conf.directory);
if (existingFolder) {
    folder = existingFolder;
} else {
    folder = await root.mkdir(conf.directory);
}

export const megaFunction = {
    uploadFileToStorage: async (name, data) => {
        const filePath = path.join(name);
        console.log(filePath);
        const file = await folder.upload(filePath, data).complete;
        const link = await file.link();
        console.log(link);
        return link;
    }, downloadFileFromLink: async (link) => {
        try {
            const file = await File.fromURL(link, {downloadWorkers: 4}); // Utilizza il metodo fromURL della classe File
            await file.loadAttributes(); // Assicurati che il file sia completamente caricato
            const stream = file.download(); // Scarica il file come un flusso di dati
            const fileName = file.name; // Recupera il nome del file
            return {stream, fileName};
        } catch (error) {
            console.error(error);
        }
    },
}
