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