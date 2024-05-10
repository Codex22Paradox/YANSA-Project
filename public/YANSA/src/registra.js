document.getElementById("submit").onclick = () => {
  if (
    document.getElementById("password").value ==
    document.getElementById("confPass").value
  ) {
    register(
      document.getElementById("username").value,
      document.getElementById("password").value,
      document.getElementById("email").value
    ).then((value) => {
      if (value.registration) {
        window.location.href = "./accedi.html";
      } else {
        alert("utente già esistente");
      }
    });
    document.getElementById("username").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("confPass").value = "";
  } else {
    alert("password diverse!");
  }
};

const register = async (user, pass, mail) => {
  let rsp = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: user, password: pass, email: mail }),
  });
  rsp = await rsp.json();
  console.log(rsp);
  return rsp;
};

document
  .getElementById("visibilityToggle1")
  .addEventListener("click", function () {
    let passwordField = document.getElementById("password");
    if (passwordField.type === "password") {
      passwordField.type = "text";
      document.getElementById("visibilityToggle1").innerHTML = "visibility_off";
    } else {
      passwordField.type = "password";
      document.getElementById("visibilityToggle1").innerHTML = "visibility";
    }
  });

document
  .getElementById("visibilityToggle2")
  .addEventListener("click", function () {
    let passwordField = document.getElementById("confPass");
    if (passwordField.type === "password") {
      passwordField.type = "text";
      document.getElementById("visibilityToggle2").innerHTML = "visibility_off";
    } else {
      passwordField.type = "password";
      document.getElementById("visibilityToggle2").innerHTML = "visibility";
    }
  });
