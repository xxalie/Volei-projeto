(function guardAdmin() {
  const isAdmin = sessionStorage.getItem("isAdmin");
  if (!isAdmin || isAdmin !== "true") {
    // não autorizado: redireciona para o login
    window.location.href = "login.html";
  }
})();
