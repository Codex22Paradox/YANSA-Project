//Inizializza Editor.js
const editor = new EditorJS({
    /**
     * Id dell'elemento che dovrebbe contenere l'Editor
     */
    holder: 'editorjs',
    tools: {
        textAlign: TextAlign, delimiter: Delimiter,
        tooltip: {
            class: Tooltip,
            config: {
                location: 'right',
                underline: true,
                placeholder: 'Inserisci commento',
                highlightColor: '#FFEFD5',
                backgroundColor: '#154360',
                textColor: '#FDFEFE',
                holder: 'editorjs',
            }
        },
        Color: {
            class: ColorPlugin,
            config: {
                colorCollections: ['#EC7878', '#9C27B0', '#673AB7', '#3F51B5', '#0070FF', '#03A9F4', '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FF1300', '#FF4500', '#FF6347', '#FF7F50', '#FF8C00', '#FFA500', '#FFD700', '#FFFF00', '#ADFF2F', '#7FFF00', '#7CFC00', '#00FF00', '#32CD32', '#98FB98', '#90EE90', '#00FA9A', '#00FF7F', '#3CB371', '#2E8B57', '#228B22', '#008000', '#006400', '#9ACD32', '#6B8E23', '#808000', '#556B2F', '#66CDAA', '#8FBC8F', '#20B2AA', '#008B8B', '#008080', '#00FFFF', '#E0FFFF', '#AFEEEE', '#7FFFD4', '#40E0D0', '#48D1CC', '#00CED1', '#5F9EA0', '#4682B4', '#B0C4DE', '#B0E0E6', '#ADD8E6', '#87CEEB', '#87CEFA', '#00BFFF', '#1E90FF', '#6495ED', '#7B68EE', '#6A5ACD', '#483D8B', '#7F00FF', '#9400D3', '#9932CC', '#BA55D3', '#800080', '#D8BFD8', '#DDA0DD', '#EE82EE', '#FF00FF', '#DA70D6', '#C71585', '#DB7093', '#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB', '#FAEBD7', '#F5F5DC', '#FFE4C4', '#FFEBCD', '#F5DEB3', '#FFF8DC', '#FFFACD', '#FAFAD2', '#FFFFE0', '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#F4A460', '#DEB887', '#D2B48C', '#BC8F8F', '#FFE4E1', '#FFDEAD', '#000000', '#696969', '#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC', '#F5F5F5', '#FFFFFF'],
                defaultColor: '#FF1300',
                type: 'text',
                customPicker: true
            }
        },
        Marker: {
            class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
            config: {
                defaultColor: '#FFBF00',
                type: 'marker',
                icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`
            }
        },
        header: {
            class: Header, inlineToolbar: true
        },
        list: {
            class: List, inlineToolbar: true
        },
        inlineCode: {
            class: InlineCode, shortcut: 'CMD+SHIFT+M', inlineToolbar: true
        },
        marker: {
            class: Marker, shortcut: 'CMD+SHIFT+M', inlineToolbar: true
        },
        quote: {
            class: Quote, inlineToolbar: true,
        },
    },
    autofocus: true,
    placeholder: 'Let`s write an awesome story!',
});

editor.isReady.then(() => {
    new Undo({editor});
    new DragDrop(editor);
    console.log('Editor.js is ready to work!')
}).catch((reason) => {
    console.log(`Editor.js initialization failed because of ${reason}`)
});
