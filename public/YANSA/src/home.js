window.onload = async function () {
  await prova();
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
  console.log(tutto);
};

const render = (listaCard) => {
  let corpo = `        <div class="col-auto mt-3">
  <div class="card">
    <div class="tools justify-content-end"></div>
    <div class="card__content">
      <div class="container">
        <div class="row">
          <div class="col-auto">
            <div class="row justify-content-between">
              <div class="col-auto">
                <h2 class="text-white">Titolo</h2>
                <p class="text-white">Autore</p>
              </div>
              <div class="col-auto">
                <p class="text-white">Tempo</p>
              </div>
            </div>
            <p class="text-white truncate-md">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis nostrud exercitation
              ullamco laboris nisi ut aliquip ex ea commodo consequat.
              Duis aute irure dolor in reprehenderit in voluptate velit
              esse cillum dolore eu fugiat nulla pariatur. Excepteur
              sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="col-auto mt-3">
  <div class="card">
    <div class="tools justify-content-end"></div>
    <div class="card__content">
      <div class="container">
        <div class="row">
          <div class="col-auto">
            <div class="row justify-content-between">
              <div class="col-auto">
                <h2 class="text-white">Titolo</h2>
                <p class="text-white">Autore</p>
              </div>
              <div class="col-auto">
                <p class="text-white">Tempo</p>
              </div>
            </div>
            <p class="text-white truncate-xl">
              Sed ut perspiciatis unde omnis iste natus error sit
              voluptatem accusantium doloremque laudantium, totam rem
              aperiam, eaque ipsa quae ab illo inventore veritatis et
              quasi architecto beatae vitae dicta sunt explicabo. Nemo
              enim ipsam voluptatem quia voluptas sit aspernatur aut
              odit aut fugit, sed quia consequuntur magni dolores eos
              qui ratione voluptatem sequi nesciunt. Neque porro
              quisquam est, qui dolorem ipsum quia dolor sit amet,
              consectetur, adipisci velit, sed quia non numquam eius
              modi tempora incidunt ut labore et dolore magnam aliquam
              quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
              exercitationem ullam corporis suscipit laboriosam, nisi ut
              aliquid ex ea commodi consequatur? Quis autem vel eum iure
              reprehenderit qui in ea voluptate velit esse quam nihil
              molestiae consequatur, vel illum qui dolorem eum fugiat
              quo voluptas nulla pariatur?
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="col-auto mt-3">
  <div class="card">
    <div class="tools justify-content-end"></div>
    <div class="card__content">
      <div class="container">
        <div class="row">
          <div class="col-auto">
            <div class="row justify-content-between">
              <div class="col-auto">
                <h2 class="text-white">Titolo</h2>
                <p class="text-white">Autore</p>
              </div>
              <div class="col-auto">
                <p class="text-white">Tempo</p>
              </div>
            </div>
            <p class="text-white truncate-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis nostrud exercitation
              ullamco laboris nisi ut aliquip ex ea commodo consequat.
              Duis aute irure dolor in reprehenderit in voluptate velit
              esse cillum dolore eu fugiat nulla pariatur. Excepteur
              sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
  document.getElementById("noteContainer").innerHTML += corpo;
};

render();
