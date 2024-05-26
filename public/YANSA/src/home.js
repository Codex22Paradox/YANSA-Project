window.onload = async () => {
  if (sessionStorage.getItem("token") !== null) {
    await render(
      document.getElementById("noteContainer"),
      document.getElementById("pencil"),
      await prendiAppunti(await pickData("/userFeed"))
    );
  } else {
    window.location.href = "./accedi.html";
  }
};

document.getElementById("searchButton").onclick = () => {
  window.location.href = "./ricerca.html";
};

document.getElementById("categorieBarra").onclick = async () => {
  document.getElementById("esploraBarra").classList.remove("active");
  document.getElementById("categorieBarra").classList.add("active");
  await renderCheckbox(document.getElementById("listaCategorie"));
};

document.getElementById("esploraBarra").onclick = async () => {
  document.getElementById("esploraBarra").classList.add("active");
  document.getElementById("categorieBarra").classList.remove("active");
  sessionStorage.removeItem("checkboxValori");
  await render(
    document.getElementById("noteContainer"),
    document.getElementById("pencil"),
    await prendiAppunti(await pickData("/userFeed"))
  );
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
    document.getElementById("pencil"),
    await prendiAppunti(await categoryFeed(catSelezionate))
  );
};

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
  //console.log(rsp);
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

let template2 = `
<div class="col-auto">
<input type="checkbox" class="btn-check mt-3 rounded-5 radio-input" id="%CAT" autocomplete="off" name="%CAT">
<label class="btn btn-outline-success border-success text-white mt-3 rounded-5" for="%CAT" >%CAT</label></div>`;

const render = async (div, div2, listino) => {
  if (listino.length !== 0) {
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
      document
        .getElementById(appunto.id)
        .addEventListener("click", function () {
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
  } else {
    div.innerHTML = `<div class="row mt-4"><div class="col"><h1 class="text-center text-white">Nessun appunto da mostrare</h1></div></div>`;
    div.classList.remove("d-none");
    div2.classList.add("d-none");
  }
};

const dataIta = (dataEstera) => {
  let data = new Date(dataEstera);
  let giorno = data.getDate();
  let mese = data.getMonth() + 1;
  let anno = data.getFullYear();
  return giorno + "/" + mese + "/" + anno;
};

document.getElementById("newNote").onclick = () => {
  sessionStorage.setItem("editorType", "new");
  window.location.href = "./editor.html";
};

document.getElementById("accountButton").onclick = () => {
  window.location.href = "./account.html";
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

const renderCheckbox = async (div) => {
  const listaCat = await pickData("/followedCategories/");
  let output = "";
  const checkboxValori =
    JSON.parse(sessionStorage.getItem("checkboxValori")) || {};

  if (listaCat.length !== 0) {
    listaCat.forEach((categoria) => {
      let html;
      html = template2.replaceAll("%CAT", categoria);
      output += html;
    });
    div.innerHTML = output;

    // Ripristina lo stato delle checkbox
    listaCat.forEach((categoria) => {
      const checkbox = document.querySelector(`input[name="${categoria}"]`);
      if (checkbox && checkboxValori[categoria]) {
        checkbox.checked = true;
      }
    });
  } else {
    div.innerHTML = `<div class="row mt-4"><div class="col"><h5 class="text-center text-white">Nessuna categoria seguita</h5></div></div>`;
  }
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

document.getElementById("setting").onclick = () => {
  window.location.href = "./setting.html";
};

let darkModeCheckbox = document.getElementById("darkMode");
let darkModeState = sessionStorage.getItem("darkMode");
let body = document.body;
let html = document.documentElement;
let offcanvasElements = document.querySelectorAll(".offcanvas");
if (darkModeState === "true") {
  darkModeCheckbox.checked = true;
  let tabs = document.querySelectorAll(".tab");
  let navCards = document.querySelectorAll(".navigation-card");
  let bgDarkLightElements = document.querySelectorAll(".bg-dark-light");

  tabs.forEach((tab) => {
    tab.classList.remove("tab");
    tab.classList.add("tab-dark");
  });

  navCards.forEach((navCard) => {
    navCard.classList.remove("navigation-card");
    navCard.classList.add("navigation-card-dark");
  });
  offcanvasElements.forEach((offcanvasElement) => {
    offcanvasElement.classList.replace("offcanvas-light", "offcanvas-dark");
  });

  bgDarkLightElements.forEach((element) => {
    element.classList.replace("bg-dark-light", "bg-dark");
  });
  body.classList.remove("body");
  body.classList.add("body-dark");

  html.setAttribute("data-bs-theme", "dark");
} else if (darkModeState === "false") {
  darkModeCheckbox.checked = false;
  let darkTabs = document.querySelectorAll(".tab-dark");
  let darkNavCards = document.querySelectorAll(".navigation-card-dark");
  let bgDarkElements = document.querySelectorAll(".bg-dark");

  darkTabs.forEach((tab) => {
    tab.classList.remove("tab-dark");
    tab.classList.add("tab");
  });

  darkNavCards.forEach((navCard) => {
    navCard.classList.remove("navigation-card-dark");
    navCard.classList.add("navigation-card");
  });

  bgDarkElements.forEach((element) => {
    element.classList.replace("bg-dark", "bg-dark-light");
  });

  body.classList.remove("body-dark");
  body.classList.add("body");
  offcanvasElements.forEach((offcanvasElement) => {
    offcanvasElement.classList.replace("offcanvas-dark", "offcanvas-light");
  });

  html.setAttribute("data-bs-theme", "light");
}

document.getElementById("darkMode").addEventListener("change", function () {
  let body = document.body;
  let html = document.documentElement;
  let offcanvasElements = document.querySelectorAll(".offcanvas");

  if (this.checked) {
    sessionStorage.setItem("darkMode", "true");
    let tabs = document.querySelectorAll(".tab");
    let navCards = document.querySelectorAll(".navigation-card");
    let bgDarkLightElements = document.querySelectorAll(".bg-dark-light");

    tabs.forEach((tab) => {
      tab.classList.remove("tab");
      tab.classList.add("tab-dark");
    });

    navCards.forEach((navCard) => {
      navCard.classList.remove("navigation-card");
      navCard.classList.add("navigation-card-dark");
    });
    offcanvasElements.forEach((offcanvasElement) => {
      offcanvasElement.classList.replace("offcanvas-light", "offcanvas-dark");
    });

    bgDarkLightElements.forEach((element) => {
      element.classList.replace("bg-dark-light", "bg-dark");
    });
    body.classList.remove("body");
    body.classList.add("body-dark");

    html.setAttribute("data-bs-theme", "dark");
  } else {
    sessionStorage.setItem("darkMode", "false");
    let darkTabs = document.querySelectorAll(".tab-dark");
    let darkNavCards = document.querySelectorAll(".navigation-card-dark");
    let bgDarkElements = document.querySelectorAll(".bg-dark");

    darkTabs.forEach((tab) => {
      tab.classList.remove("tab-dark");
      tab.classList.add("tab");
    });

    darkNavCards.forEach((navCard) => {
      navCard.classList.remove("navigation-card-dark");
      navCard.classList.add("navigation-card");
    });

    bgDarkElements.forEach((element) => {
      element.classList.replace("bg-dark", "bg-dark-light");
    });

    body.classList.remove("body-dark");
    body.classList.add("body");
    offcanvasElements.forEach((offcanvasElement) => {
      offcanvasElement.classList.replace("offcanvas-dark", "offcanvas-light");
    });

    html.setAttribute("data-bs-theme", "light");
  }
});

document.addEventListener("change", (event) => {
  if (event.target.classList.contains("radio-input")) {
    updateCheckboxVal(event.target.name, event.target.checked);
  }
});

const updateCheckboxVal = (name, isChecked) => {
  let checkboxValori =
    JSON.parse(sessionStorage.getItem("checkboxValori")) || {};
  checkboxValori[name] = isChecked;
  sessionStorage.setItem("checkboxValori", JSON.stringify(checkboxValori));
};
