window.onload = async () => {
    if (sessionStorage.getItem("token") === null) {
        window.location.href = "./accedi.html";
    }
};

let ricercaCorrente = null;
const cerca = document.getElementById('cerca');
const div = document.getElementById('noteContainer');
const loader = document.getElementById('loader');

document.getElementById('homeButton').onclick = () => {
    window.location.href = './home.html';
};
document.getElementById("newNote").onclick = () => {
    sessionStorage.setItem("editorType", "new");
    window.location.href = "./editor.html"
}

cerca.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        if (ricercaCorrente) {
            ricercaCorrente.cancel = true;
        }
        ricercaCorrente = {cancel: false};
        const array = await search(event.target.value, ricercaCorrente);
        if (ricercaCorrente.cancel) return;
        console.log(array);
        const finalArray = await createArray(array);
        loader.classList.add('d-none');
        div.classList.remove('d-none');
        console.log(div.classList);
        await render(div, finalArray);
    }
});

const search = async (testo, cancelToken) => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`/searchNotes/${testo}`, {
        headers: {
            Authorization: token
        }
    });
    if (cancelToken.cancel) return [];
    return await response.json();
}


const template = `        
    <div class="col-auto mt-3">
    <div class="card" id="%ID">
      <div class="tools justify-content-end"></div>
      <div class="card__content">
        <div class="container">
          <div class="row justify-content-between">
          <div class="col-auto">
            <h2 class="text-white">%TITOLO</h2>
            </div>
            <div class="col-auto">
            <p class="text-white">%DATA</p>
            </div>
            </div>
              <div class="row justify-content-between">
                  <div class="col-auto text-start">
                  <p class="text-white text-decoration-underline">%AUTORE</p>
                  </div>
                  <div class="col-auto text-end">
                   <p class="text-white">%COUNT</p>
                  </div>
                  </div>
              <p class="text-white %TRONCA">%CONTENUTO</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
const pickComponent = async (url) => {
    let rsp = await fetch(url, {
        method: "GET", headers: {
            "Content-Type": "application/json", Authorization: sessionStorage.getItem("token"),
        },
    });
    rsp = await rsp.json();
    rsp = JSON.parse(rsp.Result);
    //console.log(rsp);
    return rsp;
};

const createArray = async (array) => {
    const result = [];
    for (let index = 0; index < array.length; index++) {
        console.log(array[index]);
        let obj = {
            titolo: array[index].nome,
            count: array[index].count,
            id: array[index].id,
        };
        let res = await pickComponent("/getNote/" + array[index].nome);
        obj["data"] = res.dateCreation;
        obj["autore"] = res.author;
        let sum = "";
        res.data.blocks.forEach((element) => {
            if (element.type === "paragraph") {
                sum += element.data.text;
            }
        });
        obj["contenuto"] = sum;
        result.push(obj);
    }
    return result;
};

const render = async (div, array) => {
    div.innerHTML = "";
    let output = "";
    let controllino = 1;
    array.forEach((appunto) => {
        console.log(appunto);
        let troncatura = "";
        if (controllino === 1) {
            troncatura = "truncate-md";
        } else if (controllino === 2) {
            troncatura = "truncate-xl";
        } else if (controllino === 3) {
            troncatura = "truncate-sm";
        }
        let html;
        html = template.replace("%TITOLO", appunto.titolo);
        html = html.replace("%AUTORE", appunto.autore);
        html = html.replace("%DATA", dataIta(appunto.data.substring(0, 10)));
        html = html.replace("%CONTENUTO", appunto.contenuto);
        html = html.replace("%TRONCA", troncatura);
        html = html.replace("%COUNT", "Ripetizioni: " + appunto.count);
        html = html.replace("%ID", appunto.id);
        output += html;
        if (controllino === 1) {
            controllino = 2;
        } else if (controllino === 2) {
            controllino = 3;
        } else if (controllino === 3) {
            controllino = 1;
        }
    });
    div.innerHTML = output;
    array.forEach((appunto) => {
        document.getElementById(appunto.id).addEventListener('click', function () {
            sessionStorage.setItem("noteName", appunto.titolo);
            sessionStorage.setItem("noteAuthor", appunto.autore);
            sessionStorage.setItem("editorType", "view");
            window.location.href = "./editor.html";
        });
    });
};

const dataIta = (dataEstera) => {
    let data = new Date(dataEstera);
    let giorno = data.getDate();
    let mese = data.getMonth() + 1;
    let anno = data.getFullYear();
    return giorno + "/" + mese + "/" + anno;
};