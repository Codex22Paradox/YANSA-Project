window.onload = async () => {
  if (sessionStorage.getItem("token") === null) {
    window.location.href = "./accedi.html";
  }
  await renderCheckbox(document.getElementById("listaCategorie"));
};

let ricercaCorrente = null;
let timer = null;
const cerca = document.getElementById("cerca");
const div = document.getElementById("noteContainer");
const loader = document.getElementById("loader");

document.getElementById("homeButton").onclick = () => {
  window.location.href = "./home.html";
};

document.getElementById("accountButton").onclick = () => {
  window.location.href = "./account.html";
};

document.getElementById("newNote").onclick = () => {
  sessionStorage.setItem("editorType", "new");
  window.location.href = "./editor.html";
};

cerca.addEventListener("input", async (event) => {
  if (event.target.value.length <= 2) {
    div.classList.add("d-none");
    loader.classList.remove("d-none");
    clearTimeout(timer);
  } else {
    clearTimeout(timer);
    loader.classList.remove("d-none");
    div.classList.add("d-none");
    timer = setTimeout(async () => {
      if (ricercaCorrente) {
        ricercaCorrente.cancel = true;
      }
      ricercaCorrente = { cancel: false };
      const array = await search(event.target.value, ricercaCorrente);
      if (ricercaCorrente.cancel) return;
      const finalArray = await createArray(array);
      loader.classList.add("d-none");
      div.classList.remove("d-none");
      await render(div, finalArray);
      if (array.length === 0) {
        div.innerHTML =
          '<h1 class="text-center text-white">Nessun appunto trovato</h1>';
      }
    }, 500);
  }
});

const search = async (testo, cancelToken) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`/searchNotes/${testo}`, {
    headers: {
      Authorization: token,
    },
  });
  if (cancelToken.cancel) return [];
  return await response.json();
};

let template = `        
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
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: sessionStorage.getItem("token"),
    },
  });
  rsp = await rsp.json();
  rsp = JSON.parse(rsp.Result);
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

const render = async (div, div2, listino) => {
  div.innerHTML = "";
  let output = "";
  let controllino = 1;
  listino.forEach((appunto) => {
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
  if (listino.length === 0) {
    div.classList.add("d-none");
    div2.classList.remove("d-none");
  } else {
    div.classList.remove("d-none");
    div2.classList.add("d-none");
  }
  div.innerHTML = output;
  listino.forEach((appunto) => {
    document.getElementById(appunto.id).addEventListener("click", function () {
      sessionStorage.setItem("noteName", appunto.titolo);
      sessionStorage.setItem("noteAuthor", appunto.autore);
      if (appunto.autore == sessionStorage.getItem("username")) {
        sessionStorage.setItem("editorType", "modify");
      } else {
        sessionStorage.setItem("editorType", "view");
      }
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

let popoverTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="popover"]')
);
let popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl, {
    sanitize: false,
    customClass: "green-popover",
  });
});

popoverTriggerList.forEach(function (popoverTriggerEl) {
  popoverTriggerEl.addEventListener("shown.bs.popover", function () {
    const logout = document.getElementById("logout");

    logout.onclick = () => {
      console.log("logout");
      sessionStorage.clear();
      window.location.href = "./accedi.html";
    };

    // Aggiungi un listener per l'evento click del documento
    document.addEventListener("click", function (e) {
      // Se il click non è sul popover o sui suoi trigger, nascondi il popover
      if (!popoverTriggerEl.contains(e.target)) {
        let popover = bootstrap.Popover.getInstance(popoverTriggerEl);
        popover.hide();
      }
    });
  });
});
document.getElementById("setting").onclick = () => {
  window.location.href = "./setting.html";
};

let template2 = `
<div class="wrapper">
<label>
  <input class="radio-input" type="checkbox" name="%CAT" />
  <span class="radio-tile">
    <span class="radio-labelEditor">%CAT</span>
  </span>
</label>
</div>`;

const renderCheckbox = async (div) => {
  const listaCat = await pickData("/followedCategories/");
  let output = "";
  listaCat.forEach((categoria) => {
    let html;
    html = template2.replaceAll("%CAT", categoria);
    output += html;
  });
  div.innerHTML = output;
};

const pickData = async (url) => {
  let rsp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: sessionStorage.getItem("token"),
    },
  });
  rsp = await rsp.json();
  return rsp;
};

document.getElementById("pigliaCatFeed").onclick = async () => {
  const checkboxes = document.querySelectorAll(".radio-input");
  const catSelezionate = [];
  checkboxes.forEach(function (checkbox) {
    if (checkbox.checked) {
      catSelezionate.push(checkbox.name);
    }
  });
  await render(
    document.getElementById("noteContainer"),
    document.getElementById("loader"),
    await prendiAppunti(await categoryFeed(catSelezionate))
  );
};

const categoryFeed = async (cat) => {
  let rsp = await fetch("/categoryFeed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: sessionStorage.getItem("token"),
    },
    body: JSON.stringify({ category: cat }),
  });
  rsp = await rsp.json();
  return rsp;
};

const prendiAppunti = async (value) => {
  const tutto = [];
  for (let index = 0; index < value.length; index++) {
    let obj = {
      titolo: value[index].nome,
      id: value[index].id,
    };
    let res = await pickComponent("/getNote/" + value[index].nome);
    obj["data"] = res.dateCreation;
    obj["autore"] = res.author;
    let sum = "";
    res.data.blocks.forEach((element) => {
      if (element.type === "paragraph") {
        sum += element.data.text;
      }
    });
    obj["contenuto"] = sum;
    tutto.push(obj);
  }
  return tutto;
};
