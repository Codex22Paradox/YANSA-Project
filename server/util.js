import { databaseFunction } from "./database.js";

export const createNoteJson = (array) => {
    array.sort((a, b) => a.posizione - b.posizione);
    const json = {
        author: array[0].username,
        dateCreation: array[0].dataCreazione,
        title: array[0].title,
        visible: array[0].visibilita,
        data: {
            time: new Date(),
            version: "2.29.1",
            blocks: []
        }
    }
    array.forEach(element => {
        json.data.blocks.push({
            type: element.tipo,
            data: JSON.parse(element.contenuto)
        })
    });
    return json;
}

const setRatings = async (array) => {
    array.forEach(async element => {
        element.valutazione = await databaseFunction.getAverageRating();
    });
    return array;
}

/*
{
    id: results[0].id,
    nome: results[0].nome,
    visibilita: results[0].visibilita,
    username: results[0].username,
    dataCreazione: results[0].dataCreazione,
    dataModifica: results[0].dataModifica,
    categorie: []
    valutazione: valutazione
}
*/
export const createFeed = async (array) => {
    const date = new Date();
    array = array.filter((element) => Math.round((date - new Date(element.dataCreazione)) / (1000*60*60*24)) > 7);
    array = setRatings(array);
    array.sort((a, b) => b.valutazione - a.valutazione);
    return array;
}