window.onload = function () {
  const elem = document.querySelector(".masonry-container");
  const msnry = new Masonry(elem, {
    itemSelector: ".card",
    columnWidth: 200,
    gutter: 10,
    percentPosition: true,
  });
  pickData();
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
  console.log(rsp);
  return rsp;
};
