document.getElementById("accedi").onclick = () => {
  login(
    document.getElementById("username").value,
    document.getElementById("password").value
  ).then((value) => {
    if (value.auth) {
      sessionStorage.setItem("token", value.token);
      window.location.href = "./home.html";
    } else {
      alert("Credenziali errate");
    }
  });
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
};

const login = async (user, pass) => {
  let rsp = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: user, password: pass }),
  });
  rsp = await rsp.json();
  console.log(rsp);
  return rsp;
};

document
  .getElementById("visibilityToggle")
  .addEventListener("click", function () {
    let passwordField = document.getElementById("password");
    if (passwordField.type === "password") {
      passwordField.type = "text";
      document.getElementById("visibilityToggle").innerHTML = "visibility_off";
    } else {
      passwordField.type = "password";
      document.getElementById("visibilityToggle").innerHTML = "visibility";
    }
  });
