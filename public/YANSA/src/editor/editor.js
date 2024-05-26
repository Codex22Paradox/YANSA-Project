const token = sessionStorage.getItem("token"); // Recupera il token dal session storage
const username = sessionStorage.getItem("username");
const saveButton = document.getElementById("save");
const titleInput = document.getElementById("titolo");
let title = document.getElementById("titolo_eff");
const btnCerca = document.getElementById("cerca-btn");
const search = document.getElementById("cerca");
const btnRating = document.getElementById("ratingInvia");
const publicSwitch = document.getElementById("notePublic");
const ratings = [];
const modalIstruzioni = new bootstrap.Modal(document.getElementById("modalIstruzioni"));
const templateCat = `<div class="col-auto">
<input type="checkbox" class="btn-check mt-3 rounded-5 radio-input" id="%ID" autocomplete="off" name="engine">
<label class="btn btn-outline-success border-success text-white mt-3 rounded-5" for="%ID" >%CAT</label></div>`;
for (let i = 1; i < 6; i++) {
    ratings.push(document.getElementById("star" + i));
}
let categories;
let categoriesList;
let interval;
const renderCategories = categories => {
    let html = "";
    categories.forEach(element => {
        let row = templateCat.replace("%ID", element).replace("%ID", element);
        row = row.replace("%CAT", element);
        html += row;
    });
    if (categories.length == 0) {
        html = "";
    }
    document.getElementById("categories").innerHTML = html;
};
const renderSingleCategory = category => {
    let html = templateCat.replace("%ID", category).replace("%ID", category);
    html = html.replace("%CAT", category);
    document.getElementById("categories").innerHTML += html;
};
//Inizializza Editor.js
const editor = new EditorJS({
    /**
     * Id dell'elemento che dovrebbe contenere l'Editor
     */
    holder: "editorjs", tools: {
        underline: Underline, Color: {
            class: ColorPlugin, config: {
                colorCollections: ["#EC7878", "#9C27B0", "#673AB7", "#3F51B5", "#0070FF", "#03A9F4", "#00BCD4", "#4CAF50", "#8BC34A", "#CDDC39", "#FF1300", "#FF4500", "#FF6347", "#FF7F50", "#FF8C00", "#FFA500", "#FFD700", "#FFFF00", "#ADFF2F", "#7FFF00", "#7CFC00", "#00FF00", "#32CD32", "#98FB98", "#90EE90", "#00FA9A", "#00FF7F", "#3CB371", "#2E8B57", "#228B22", "#008000", "#006400", "#9ACD32", "#6B8E23", "#808000", "#556B2F", "#66CDAA", "#8FBC8F", "#20B2AA", "#008B8B", "#008080", "#00FFFF", "#E0FFFF", "#AFEEEE", "#7FFFD4", "#40E0D0", "#48D1CC", "#00CED1", "#5F9EA0", "#4682B4", "#B0C4DE", "#B0E0E6", "#ADD8E6", "#87CEEB", "#87CEFA", "#00BFFF", "#1E90FF", "#6495ED", "#7B68EE", "#6A5ACD", "#483D8B", "#7F00FF", "#9400D3", "#9932CC", "#BA55D3", "#800080", "#D8BFD8", "#DDA0DD", "#EE82EE", "#FF00FF", "#DA70D6", "#C71585", "#DB7093", "#FF1493", "#FF69B4"],
                defaultColor: "#FF1300",
                type: "text",
                customPicker: true
            }
        }, Marker: {
            class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
            config: {
                defaultColor: "#FFBF00",
                type: "marker",
                icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`
            }
        }, textAlign: TextAlign, delimiter: Delimiter, tooltip: {
            class: Tooltip, config: {
                location: "right",
                underline: true,
                placeholder: "Inserisci commento",
                highlightColor: "#FFEFD5",
                backgroundColor: "#154360",
                textColor: "#FDFEFE",
                holder: "editorjs"
            }
        }, inlineCode: {
            class: InlineCode, shortcut: "CMD+SHIFT+M", inlineToolbar: true
        }, header: {
            class: Header, inlineToolbar: true
        }, list: {
            class: List, inlineToolbar: true
        }, quote: {
            class: Quote, inlineToolbar: true
        }, table: {
            class: Table, inlineToolbar: true
        } /*,
        image: SimpleImage*/
    }, autofocus: true, placeholder: "Inizia a scrivere.."
});
let snapshot;
let snapshotCat;
let noteTitle;
const getStatusInstruction = async () => {
    const response = await fetch("/getInstructions", {
        method: "GET", headers: {
            Authorization: sessionStorage.getItem("token"), "content-type": "application/json"
        }
    });
    const res = await response.json();
    console.log(res);
    return res.result;
}

const updateInstructions = async () => {
    const response = await fetch("/updateInstructions", {
        method: "POST", headers: {
            Authorization: sessionStorage.getItem("token"), "content-type": "application/json"
        }
    });
    const res = await response.json();
    console.log(res);
    return res.result;
}
editor.isReady
    .then(async () => {
        new DragDrop(editor);
        console.log("Editor.js is ready to work!");
        const statusInstruction = await getStatusInstruction();
        if (sessionStorage.getItem("editorType") === "new") {
            if (!statusInstruction) {
                modalIstruzioni.show();
                await updateInstructions()
            }
            fetch("/categories", {
                method: "GET", headers: {
                    Authorization: sessionStorage.getItem("token"), "content-type": "application/json"
                }
            })
                .then(res => res.json())
                .then(res => {
                    let html = "";
                    res.result.forEach(element => {
                        let row = templateCat.replace("%ID", element).replace("%ID", element);
                        row = row.replace("%CAT", element);
                        html += row;
                    });
                    document.getElementById("categories").innerHTML = html;
                });
        } else if (sessionStorage.getItem("editorType") === "modify") {
            if (!statusInstruction) {
                modalIstruzioni.show();
                await updateInstructions()
            }
            fetch("/getNote/" + sessionStorage.getItem("noteName"), {
                method: "GET", headers: {
                    "content-type": "application/json", Authorization: sessionStorage.getItem("token")
                }
            })
                .then(res => res.json())
                .then(res => {
                    return JSON.parse(res.Result);
                })
                .then(res => {
                    publicSwitch.removeAttribute("disabled");
                    if (res.visible) {
                        publicSwitch.setAttribute("checked", "");
                    }
                    noteTitle = res.title;
                    console.log(res);
                    titleInput.value = noteTitle;
                    document.getElementById("titolo_eff").innerText = noteTitle;
                    title = title.innerText;
                    editor.render(res.data).then(() => {
                        editor.save().then(data => {
                            snapshot = data;
                        });
                    });
                    fetch("/categories", {
                        method: "GET", headers: {
                            Authorization: sessionStorage.getItem("token"), "content-type": "application/json"
                        }
                    })
                        .then(res => res.json())
                        .then(res => {
                            categories = res.result;
                            renderCategories(categories);
                        })
                        .then(() => {
                            console.log(res);
                            res.categories.forEach(element => {
                                document.getElementById(element).checked = true;
                            });
                            snapshotCat = res.categories;
                        });
                });
        } else if (sessionStorage.getItem("editorType") === "view") {
            document.getElementById("ratingInput").classList.remove("d-none");
            document.getElementById("titleInput").classList.add("d-none");
            btnRating.setAttribute("disabled", "");
            editor.readOnly.toggle();
            fetch("/getNote/" + sessionStorage.getItem("noteName"), {
                method: "GET", headers: {
                    "content-type": "application/json", Authorization: sessionStorage.getItem("token")
                }
            })
                .then(res => res.json())
                .then(res => {
                    console.log(JSON.parse(res.Result));
                    return JSON.parse(res.Result);
                })
                .then(res => {
                    noteTitle = res.title;
                    console.log(res);
                    titleInput.value = noteTitle;
                    document.getElementById("titolo_eff").innerText = noteTitle;
                    editor.render(res.data);
                    categories = res.categories;
                    renderCategories(categories);
                    res.categories.forEach(element => {
                        const cat = document.getElementById(element);
                        cat.checked = true;
                        cat.setAttribute("disabled", "");
                    });
                    fetch("/userRating/" + noteTitle + "-" + sessionStorage.getItem("noteAuthor"), {
                        method: "GET", headers: {
                            "content-type": "application/json", Authorization: sessionStorage.getItem("token")
                        }
                    })
                        .then(res => res.json())
                        .then(res => {
                            if (res.result) {
                                ratings.forEach(element => element.setAttribute("disabled", ""));
                                document.getElementById("star" + res.result.valore).checked = true;
                                btnRating.setAttribute("disabled", "");
                            }
                        });
                });
        }
    })
    .catch(reason => {
        console.log(`Editor.js initialization failed because of ${reason}`);
    });

saveButton.onclick = () => {
    if (sessionStorage.getItem("editorType") === "new") {
        editor.save().then(data => {
            categoriesList = document.querySelectorAll(".radio-input");
            let check = false;
            const categoriesListSend = [];
            categoriesList.forEach(element => {
                if (element.checked) {
                    categoriesListSend.push(element.id);
                    check = true;
                }
            });
            if (check) {
                fetch("/savenote/new", {
                    method: "POST", headers: {
                        "content-type": "application/json", Authorization: sessionStorage.getItem("token")
                    }, body: JSON.stringify({
                        title: document.getElementById("titolo_eff").innerText, contents: data.blocks
                    })
                })
                    .then(res => res.json())
                    .then(res => {
                        console.log(res);
                        sessionStorage.setItem("editorType", "modify");
                        sessionStorage.setItem("noteName", document.getElementById("titolo_eff").innerText);
                        window.location.reload();
                    })
                    .then(() => {
                        fetch("/addCategory/" + document.getElementById("titolo_eff").innerText, {
                            method: "POST", headers: {
                                "content-type": "application/json", Authorization: sessionStorage.getItem("token")
                            }, body: JSON.stringify({
                                categories: categoriesListSend
                            })
                        });
                    })
                    .catch(err => console.log(err));
            } else {
                alert("Scegli almeno una categoria");
            }
        });
    } else if (sessionStorage.getItem("editorType") === "modify") {
        editor.save().then(data => {
            categoriesList = document.querySelectorAll(".radio-input");
            let check = false;
            const categoriesListSend = [];
            categoriesList.forEach(element => {
                if (element.checked) {
                    categoriesListSend.push(element.id);
                    check = true;
                }
            });
            if (check) {
                const deleted = [];
                snapshot.blocks.forEach((element, i) => {
                    let present = false;
                    for (let j = 0; j < data.blocks.length; j++) {
                        if (element.id == data.blocks[j].id) {
                            present = true;
                        }
                    }
                    if (!present) {
                        deleted.push({pos: i});
                    }
                });
                const added = [];
                data.blocks.forEach((element, i) => {
                    let present = false;
                    for (let j = 0; j < snapshot.blocks.length; j++) {
                        if (element.id == snapshot.blocks[j].id) {
                            present = true;
                        }
                    }
                    if (!present) {
                        added.push({pos: i, data: data.blocks[i]});
                    }
                });
                const modified = [];
                snapshot.blocks.forEach((element, i) => {
                    let checkChanged = false;
                    let changed;
                    let posChange;
                    for (let j = 0; j < data.blocks.length; j++) {
                        if (element.id == data.blocks[j].id && (element.type !== data.blocks[j].type || JSON.stringify(element.data) !== JSON.stringify(data.blocks[j].data))) {
                            checkChanged = true;
                            changed = data.blocks[j];
                            posChange = j;
                        }
                    }
                    console.log("changed")
                    console.log(changed)
                    if (checkChanged) {
                        modified.push({pos: i, data: changed.data});
                    }
                });
                console.log("modified")
                console.log(modified)
                if (title !== document.getElementById("titolo_eff").innerText) {
                    fetch("/saveNote/modify", {
                        method: "POST", headers: {
                            "content-type": "application/json", Authorization: sessionStorage.getItem("token")
                        }, body: JSON.stringify({
                            added: added,
                            deleted: deleted,
                            modified: modified,
                            title: title,
                            newTitle: document.getElementById("titolo_eff").innerText,
                            public: publicSwitch.checked
                        })
                    })
                        .then(res => res.json())
                        .then(res => {
                            console.log("res");
                            console.log(res);
                        });
                } else {
                    fetch("/saveNote/modify", {
                        method: "POST", headers: {
                            "content-type": "application/json", Authorization: sessionStorage.getItem("token")
                        }, body: JSON.stringify({
                            added: added,
                            deleted: deleted,
                            modified: modified,
                            title: title,
                            newTitle: "",
                            public: publicSwitch.checked
                        })
                    })
                        .then(res => res.json())
                        .then(res => {
                            console.log("res");
                            console.log(res);
                        });
                }

                const catAdd = [];
                categoriesListSend.forEach(element => {
                    let checkAdd = true;
                    for (let i = 0; i < snapshotCat.length; i++) {
                        if (element == snapshotCat[i]) {
                            checkAdd = false
                        }
                    }
                    if (checkAdd) {
                        catAdd.push(element);
                    }
                })
                const catDel = [];
                snapshotCat.forEach(element => {
                    let checkDel = false;
                    for (let i = 0; i < categoriesListSend.length; i++) {
                        if (categoriesListSend[i] === element) {
                            checkDel = true;
                        }
                    }
                    if (!checkDel) {
                        catDel.push(element);
                    }
                })
                if (catAdd.length > 0) {
                    fetch('/addCategory/' + document.getElementById("titolo_eff").innerText, {
                        method: "POST", headers: {
                            "content-type": "application/json", "Authorization": sessionStorage.getItem("token")
                        }, body: JSON.stringify({
                            categories: catAdd
                        })
                    }).then(res => res.json())
                        .then(res => console.log(res))
                }
                if (catDel.length > 0) {
                    fetch('/deleteCategory/' + document.getElementById("titolo_eff").innerText, {
                        method: "POST", headers: {
                            "content-type": "application/json", "Authorization": sessionStorage.getItem("token")
                        }, body: JSON.stringify({
                            categories: catDel
                        })
                    }).then(res => res.json())
                        .then(res => console.log(res))
                }
            } else {
                alert("Selezionare almeno una categoria");
            }
        });
    }
};

document.getElementById("homeButton").onclick = () => {
    window.location.href = "./home.html";
};

document.getElementById("searchButton").onclick = () => {
    window.location.href = "./ricerca.html";
};

document.getElementById("ratingInput").onclick = () =>{
  btnRating.removeAttribute("disabled");
}

titleInput.onblur = () => {
    document.getElementById("titolo_eff").innerText = titleInput.value;
};

btnRating.onclick = () => {
    let checked;
    for (let i = 0; i < ratings.length; i++) {
        if (ratings[i].checked) {
            checked = i + 1;
        }
    }
    fetch("/insertRating/" + sessionStorage.getItem("noteName"), {
        method: "POST", headers: {
            "content-type": "application/json", Authorization: sessionStorage.getItem("token")
        }, body: JSON.stringify({
            rating: checked
        })
    })
        .then(res => res.json())
        .then(res => {
            if (res.result == "ok") {
                btnRating.setAttribute("disabled", "");
            }
        });
};

btnCerca.onclick = () => {
    if (sessionStorage.getItem("editorType") !== "view") {
        const snapshotCatTmp = document.querySelectorAll(".radio-input");
        const categoriesListSend = [];
        snapshotCatTmp.forEach(element => {
            if (element.checked) {
                categoriesListSend.push(element.id);
            }
        });
        renderCategories(categories);
        renderSingleCategory(search.value);
        categoriesListSend.forEach(element => {
            document.getElementById(element).checked = true;
        })
        document.getElementById(search.value).checked = true;
        search.value = "";
    }
};

/*search.oninput = () => {
    if(sessionStorage.getItem("editorType") !== "view"){
        const searchArray = categories.filter((element) => element.includes(search.value));
        if(searchArray.length > 0){
            renderCategories(searchArray);
        }
    }
}*/

if (sessionStorage.getItem("token") === null || (sessionStorage.getItem("noteName") === null && sessionStorage.getItem("editorType") !== "new")) {
    window.location.href = "./home.html";
}

if (sessionStorage.getItem("editorType") == "modify") {
    interval = setInterval(() => {
        saveButton.click();
    }, 1000 * 60);
}

window.onbeforeunload = () => {
    clearInterval(interval)
}

document.getElementById("setting").onclick = () => {
    window.location.href = "./setting.html";
};

document.getElementById("accountButton").onclick = () => {
    window.location.href = "./account.html";
};

let titoloEff = document.getElementById("titolo_eff");
let titoloInput = document.getElementById("titoloInput");

titoloEff.addEventListener("dblclick", function () {
    if (sessionStorage.getItem("editorType") === "modify" || sessionStorage.getItem("editorType") === "new") {
        titoloEff.classList.add("d-none");
        titoloInput.classList.remove("d-none");
    }
});

titleInput.addEventListener("blur", function () {
    if (sessionStorage.getItem("editorType") === "modify" || sessionStorage.getItem("editorType") === "new") {
        titoloEff.classList.remove("d-none");
        titoloInput.classList.add("d-none");
    }
});


let darkModeCheckbox = document.getElementById('darkMode');
let darkModeState = sessionStorage.getItem('darkMode');
let body = document.body;
let html = document.documentElement;
let offcanvasElements = document.querySelectorAll('.offcanvas');
if (darkModeState === 'true') {
    darkModeCheckbox.checked = true;
    let tabs = document.querySelectorAll('.tab');
    let navCards = document.querySelectorAll('.navigation-card');
    let bgDarkLightElements = document.querySelectorAll('.bg-dark-light');
    document.getElementById("editorjs-container").classList.remove("editorjs-container");
    document.getElementById("editorjs-container").classList.add("editorjs-container-dark");
    tabs.forEach(tab => {
        tab.classList.remove('tab');
        tab.classList.add('tab-dark');
    });

    navCards.forEach(navCard => {
        navCard.classList.remove('navigation-card');
        navCard.classList.add('navigation-card-dark');
    });
    offcanvasElements.forEach(offcanvasElement => {
        offcanvasElement.classList.replace('offcanvas-light', 'offcanvas-dark');
    });

    bgDarkLightElements.forEach(element => {
        element.classList.replace('bg-dark-light', 'bg-dark');
    });
    body.classList.remove('body');
    body.classList.add('body-dark');

    html.setAttribute('data-bs-theme', 'dark');
} else if (darkModeState === 'false') {
    darkModeCheckbox.checked = false;
    document.getElementById("editorjs-container").classList.add("editorjs-container");
    document.getElementById("editorjs-container").classList.remove("editorjs-container-dark");
    let darkTabs = document.querySelectorAll('.tab-dark');
    let darkNavCards = document.querySelectorAll('.navigation-card-dark');
    let bgDarkElements = document.querySelectorAll('.bg-dark');

    darkTabs.forEach(tab => {
        tab.classList.remove('tab-dark');
        tab.classList.add('tab');
    });

    darkNavCards.forEach(navCard => {
        navCard.classList.remove('navigation-card-dark');
        navCard.classList.add('navigation-card');
    });

    bgDarkElements.forEach(element => {
        element.classList.replace('bg-dark', 'bg-dark-light');
    });

    body.classList.remove('body-dark');
    body.classList.add('body');
    offcanvasElements.forEach(offcanvasElement => {
        offcanvasElement.classList.replace('offcanvas-dark', 'offcanvas-light');
    });

    html.setAttribute('data-bs-theme', 'light');
}

document.getElementById('darkMode').addEventListener('change', function () {
    let body = document.body;
    let html = document.documentElement;
    let offcanvasElements = document.querySelectorAll('.offcanvas');

    if (this.checked) {
        sessionStorage.setItem('darkMode', 'true');
        let tabs = document.querySelectorAll('.tab');
        let navCards = document.querySelectorAll('.navigation-card');
        let bgDarkLightElements = document.querySelectorAll('.bg-dark-light');
        document.getElementById("editorjs-container").classList.remove("editorjs-container");
        document.getElementById("editorjs-container").classList.add("editorjs-container-dark");
        tabs.forEach(tab => {
            tab.classList.remove('tab');
            tab.classList.add('tab-dark');
        });

        navCards.forEach(navCard => {
            navCard.classList.remove('navigation-card');
            navCard.classList.add('navigation-card-dark');
        });
        offcanvasElements.forEach(offcanvasElement => {
            offcanvasElement.classList.replace('offcanvas-light', 'offcanvas-dark');
        });

        bgDarkLightElements.forEach(element => {
            element.classList.replace('bg-dark-light', 'bg-dark');
        });
        body.classList.remove('body');
        body.classList.add('body-dark');

        html.setAttribute('data-bs-theme', 'dark');
    } else {
        sessionStorage.setItem('darkMode', 'false');
        let darkTabs = document.querySelectorAll('.tab-dark');
        let darkNavCards = document.querySelectorAll('.navigation-card-dark');
        let bgDarkElements = document.querySelectorAll('.bg-dark');
        document.getElementById("editorjs-container").classList.add("editorjs-container");
        document.getElementById("editorjs-container").classList.remove("editorjs-container-dark");
        darkTabs.forEach(tab => {
            tab.classList.remove('tab-dark');
            tab.classList.add('tab');
        });

        darkNavCards.forEach(navCard => {
            navCard.classList.remove('navigation-card-dark');
            navCard.classList.add('navigation-card');
        });

        bgDarkElements.forEach(element => {
            element.classList.replace('bg-dark', 'bg-dark-light');
        });

        body.classList.remove('body-dark');
        body.classList.add('body');
        offcanvasElements.forEach(offcanvasElement => {
            offcanvasElement.classList.replace('offcanvas-dark', 'offcanvas-light');
        });

        html.setAttribute('data-bs-theme', 'light');
    }
});