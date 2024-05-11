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
  let tronc1 = true;
  let tronc2 = false;
  let tronc3 = false;
  console.log(listino);

  listino.forEach((appunto) => {
    let troncatura = "";
    if (tronc1 && !tronc2 && !tronc3) {
      troncatura = "truncate-md";
    } else if (!tronc1 && tronc2 && !tronc3) {
      troncatura = "truncate-xl";
    } else if (!tronc1 && !tronc2 && tronc3) {
      troncatura = "truncate-sm";
    }
    let corpo =
      `        
    <div class="col-auto mt-3">
    <div class="card">
      <div class="tools justify-content-end"></div>
      <div class="card__content">
        <div class="container">
          <div class="row">
            <div class="col-auto">
              <div class="row justify-content-between">
                <div class="col-auto">
                  <h2 class="text-white"> ` +
      appunto.titolo +
      ` </h2>
                  <p class="text-white">` +
      appunto.autore +
      `</p>
                </div>
                <div class="col-auto">
                  <p class="text-white">` +
      appunto.data +
      `</p>
                </div>
              </div>
              <p class="text-white ` +
      troncatura +
      `">
              ` +
      appunto.contenuto +
      `
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
    output += corpo;
    if (tronc1 && !tronc2 && !tronc3) {
      tronc1 = false;
      tronc2 = true;
      tronc3 = false;
    } else if (!tronc1 && tronc2 && !tronc3) {
      tronc1 = false;
      tronc2 = false;
      tronc3 = true;
    } else if (!tronc1 && !tronc2 && tronc3) {
      tronc1 = true;
      tronc2 = false;
      tronc3 = false;
    }
  });
  div.innerHTML = output;
};
