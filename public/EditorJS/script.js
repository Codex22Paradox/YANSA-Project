// Crea una nuova istanza di Editor.js
const editor = new EditorJS({
  /**
   * Id dell'elemento che dovrebbe contenere l'Editor
   */
  holder: "editorjs",
  tools: {
    header: {
      class: Header,
      inlineToolbar: ["link"],
    },
    list: {
      class: List,
      inlineToolbar: true,
    },
  },
});

// Salva i dati quando si preme il pulsante di salvataggio
document.getElementById("save-button").addEventListener("click", function () {
  editor
    .save()
    .then(function (outputData) {
      console.log("Dati dell'articolo:", outputData);
    })
    .catch(function (error) {
      console.log("Errore di salvataggio:", error);
    });
});
