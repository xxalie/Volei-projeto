const form = document.getElementById("form-inscricao");
const resposta = document.getElementById("resposta");
const tabelaBody = document.querySelector("#tabela-inscritos tbody");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  resposta.style.color = "blue";
  resposta.innerText = "Enviando inscrição...";

  const dados = {
    nome: form.nome.value.trim(),
    whatsapp: form.whatsapp.value.trim(),
    torneio: form.torneio.value.trim()
  };

  try {
    const r = await fetch("http://localhost:3000/inscrever", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    const resultado = await r.json();

    if (r.ok) {
      resposta.style.color = "green";
      resposta.innerText = resultado.mensagem || "Inscrição enviada com sucesso!";
      form.reset();
      carregarInscritos();
    } else {
      resposta.style.color = "red";
      resposta.innerText = resultado.mensagem || "Erro ao enviar inscrição.";
    }
  } catch (err) {
    resposta.style.color = "red";
    resposta.innerText = "Erro ao enviar inscrição. Tente novamente.";
  }
});

async function carregarInscritos() {
  try {
    const r = await fetch("http://localhost:3000/inscricoes");
    const inscritos = await r.json();

    tabelaBody.innerHTML = "";

    inscritos.forEach(({ id, nome, whatsapp, torneio, criado_em }) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${id}</td>
        <td>${nome}</td>
        <td>${whatsapp}</td>
        <td>${torneio}</td>
        <td>${new Date(criado_em).toLocaleString("pt-BR")}</td>
      `;
      tabelaBody.appendChild(tr);
    });
  } catch (err) {
    tabelaBody.innerHTML = "<tr><td colspan='5'>Erro ao carregar inscritos.</td></tr>";
  }
}

// Carrega inscritos ao abrir a página
carregarInscritos();
