window.onload = async function () {
  await render(document.getElementById("noteContainer"));
};

const pickData = async () => {
  let rsp = await fetch("/userFeed", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: sessionStorage.getItem("token"),
    },
  });
  rsp = await rsp.json();
  //console.log(rsp);
  return rsp;
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

const prova = async () => {
  let value = await pickData();
  const tutto = [];
  for (let index = 0; index < value.length; index++) {
    let obj = {
      titolo: value[index].nome,
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

const render = async (div) => {
  div.innerHTML = "";
  const listino = await prova();
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
    let template = `        
    <div class="col-auto mt-3">
    <div class="card">
      <div class="tools justify-content-end"></div>
      <div class="card__content">
        <div class="container">
          <div class="row">
            <div class="col-auto">
              <div class="row justify-content-between">
                <div class="col-auto">
                  <h2 class="text-white">%TITOLO</h2>
                  <p class="text-white">%AUTORE</p>
                </div>
                <div class="col-auto">
                  <p class="text-white">%DATA</p>
                </div>
              </div>
              <p class="text-white %TRONCA">%CONTENUTO</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
    template = template.replace("%TITOLO", appunto.titolo);
    template = template.replace("%AUTORE", appunto.autore);
    template = template.replace(
      "%DATA",
      dataIta(appunto.data.substring(0, 10))
    );
    template = template.replace("%CONTENUTO", appunto.contenuto);
    template = template.replace("%TRONCA", troncatura);
    output += template;
    if (controllino === 1) {
      controllino = 2;
    } else if (controllino === 2) {
      controllino = 3;
    } else if (controllino === 3) {
      controllino = 1;
    }
  });
  div.innerHTML = output;
};

const dataIta = (dataEstera) => {
  let data = new Date(dataEstera);
  let giorno = data.getDate();
  let mese = data.getMonth() + 1;
  let anno = data.getFullYear();
  let dataItaliana = giorno + "/" + mese + "/" + anno;
  return dataItaliana;
};
