document.getElementById("accedi").onclick = () => {
  login(
    document.getElementById("username").value,
    document.getElementById("password").value
  );
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
};

const login = (user, pass) => {
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: user, password: pass }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
