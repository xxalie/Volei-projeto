// =================== PROTEGE O PAINEL ===================
(function guardAdmin() {
  const isAdmin = sessionStorage.getItem("isAdmin");
  if (!isAdmin || isAdmin !== "true") {
    window.location.href = "login.html";
  }
})();

// === GERAR RELATÓRIO ===
const btnRelatorio = document.getElementById("btnRelatorio");
const secaoRelatorio = document.getElementById("relatorio");
const dadosRelatorio = document.getElementById("dadosRelatorio");

btnRelatorio.addEventListener("click", async () => {
  try {
    const resp = await fetch("http://localhost:8800/relatorio");
    const data = await resp.json();

    if (!data.success) {
      alert("Erro ao gerar relatório!");
      return;
    }

    const r = data.relatorio;

    // Mostra informações textuais
    dadosRelatorio.innerHTML = `
      <p><strong>Torneio mais popular:</strong> ${
        r.torneio_popular?.torneio_mais_popular || "—"
      } (${r.torneio_popular?.total || 0} inscrições)</p>
      <p><strong>Dia com mais inscrições:</strong> ${
        r.dia_com_mais_inscricoes?.data || "—"
      } (${r.dia_com_mais_inscricoes?.total_no_dia || 0})</p>
      <p><strong>Média de inscrições por torneio:</strong> ${
        r.media_inscricoes?.media_inscricoes || 0
      }</p>
      <p><strong>Último torneio criado:</strong> ${
        r.ultimo_torneio?.ultimo_torneio || "—"
      } (${r.ultimo_torneio?.local_evento || ""})</p>
    `;

    // === GRÁFICO ===
    const ctx = document.getElementById("graficoTorneios").getContext("2d");
    const nomes = r.total_por_torneio.map((t) => t.torneio);
    const valores = r.total_por_torneio.map((t) => t.total_inscritos);

    if (window.grafico) window.grafico.destroy(); // evita sobreposição
    window.grafico = new Chart(ctx, {
      type: "bar",
      data: {
        labels: nomes,
        datasets: [
          {
            label: "Inscrições por Torneio",
            data: valores,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: { y: { beginAtZero: true } },
      },
    });

    secaoRelatorio.style.display = "block";
    window.scrollTo({ top: secaoRelatorio.offsetTop, behavior: "smooth" });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    alert("Erro de conexão com o servidor.");
  }
});

// === HISTÓRICO DE INSCRIÇÕES ===
const btnHistorico = document.getElementById("btnHistorico");
const historicoSection = document.getElementById("historicoSection");
const tabelaHistorico = document.querySelector("#tabelaHistorico tbody");

btnHistorico.addEventListener("click", async () => {
  try {
    historicoSection.style.display = "block";
    tabelaHistorico.innerHTML =
      "<tr><td colspan='5'>Carregando histórico...</td></tr>";

    const resp = await fetch("http://localhost:8800/historico");
    const data = await resp.json();

    if (!data.success) {
      tabelaHistorico.innerHTML =
        "<tr><td colspan='5'>Erro ao carregar histórico.</td></tr>";
      return;
    }

    if (data.data.length === 0) {
      tabelaHistorico.innerHTML =
        "<tr><td colspan='5'>Nenhum registro encontrado.</td></tr>";
      return;
    }

    tabelaHistorico.innerHTML = "";
    data.data.forEach((h) => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${h.id}</td>
        <td>${h.nome_jogador}</td>
        <td>${h.torneio_nome}</td>
        <td>${h.acao}</td>
        <td>${h.data_hora}</td>
      `;
      tabelaHistorico.appendChild(linha);
    });

    window.scrollTo({ top: historicoSection.offsetTop, behavior: "smooth" });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    tabelaHistorico.innerHTML =
      "<tr><td colspan='5'>Erro de conexão.</td></tr>";
  }
});

// =================== LOGOUT ===================
document.getElementById("logout").addEventListener("click", () => {
  sessionStorage.removeItem("isAdmin");
  window.location.href = "login.html";
});

// =================== VARIÁVEIS ===================
const tabelaTorneios = document.querySelector("#tabela-torneios tbody");
const msgTorneio = document.getElementById("msgTorneio");
const painelInscritos = document.getElementById("painel-inscritos");

// =================== FUNÇÕES DE TORNEIOS ===================

// Carrega todos os torneios
async function carregarTorneios() {
  tabelaTorneios.innerHTML =
    "<tr><td colspan='7'>Carregando torneios...</td></tr>";

  try {
    const resp = await fetch("http://localhost:8800/torneios");
    const dados = await resp.json();

    tabelaTorneios.innerHTML = "";

    if (!dados.data || dados.data.length === 0) {
      tabelaTorneios.innerHTML =
        "<tr><td colspan='7'>Nenhum torneio encontrado.</td></tr>";
      return;
    }

    dados.data.forEach((t) => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${t.id}</td>
        <td>${t.nome}</td>
        <td>${t.local}</td>
        <td>${new Date(t.data).toLocaleDateString("pt-BR")}</td>
        <td>${t.descricao || "-"}</td>
        <td>${
          t.link ? `<a href="${t.link}" target="_blank">Acessar</a>` : "-"
        }</td>
        <td>
          <button onclick="editarTorneio(${t.id})">✏️</button>
          <button onclick="deletarTorneio(${t.id})">🗑️</button>
        </td>
      `;
      tabelaTorneios.appendChild(linha);
    });
  } catch (error) {
    console.error("Erro ao carregar torneios:", error);
    tabelaTorneios.innerHTML =
      "<tr><td colspan='7'>Erro ao carregar torneios.</td></tr>";
  }
}

// Cria um novo torneio
document.getElementById("formTorneio").addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    nome: document.getElementById("nome").value,
    local_evento: document.getElementById("local").value,
    data_evento: document.getElementById("data").value,
    descricao: document.getElementById("descricao").value,
    link: document.getElementById("link").value,
  };

  try {
    const resp = await fetch("http://localhost:8800/torneios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const resultado = await resp.json();
    msgTorneio.textContent = resultado.message;
    msgTorneio.style.color = resp.ok ? "green" : "red";
    e.target.reset();
    carregarTorneios();
  } catch (error) {
    msgTorneio.textContent = "Erro ao cadastrar torneio.";
    msgTorneio.style.color = "red";
  }
});

// Exclui torneio
async function deletarTorneio(id) {
  if (!confirm("Deseja realmente excluir este torneio?")) return;

  try {
    const resp = await fetch(`http://localhost:8800/torneios/${id}`, {
      method: "DELETE",
    });
    const result = await resp.json();
    alert(result.message);
    carregarTorneios();
    carregarInscricoes();
  } catch (error) {
    alert("Erro ao deletar torneio.");
  }
}

// Edita torneio (alerta simples)
async function editarTorneio(id) {
  const nome = prompt("Novo nome do torneio:");
  const local = prompt("Novo local do evento:");
  const data = prompt("Nova data (AAAA-MM-DD):");
  const descricao = prompt("Nova descrição:");
  const link = prompt("Novo link (opcional):");

  if (!nome || !local || !data || !descricao) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const resp = await fetch(`http://localhost:8800/torneios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        local_evento: local,
        data_evento: data,
        descricao,
        link,
      }),
    });

    const result = await resp.json();
    alert(result.message);
    carregarTorneios();
  } catch (error) {
    alert("Erro ao editar torneio.");
  }
}

// =================== FUNÇÕES DE INSCRIÇÕES ===================

// Carrega as inscrições agrupadas por torneio
async function carregarInscricoes() {
  painelInscritos.innerHTML = "<p>Carregando inscrições...</p>";

  try {
    const resp = await fetch("http://localhost:8800/inscricoes");
    const dados = await resp.json();

    if (!dados.data || dados.data.length === 0) {
      painelInscritos.innerHTML = "<p>Nenhuma inscrição encontrada.</p>";
      return;
    }

    // Agrupar por torneio
    const grupos = {};
    dados.data.forEach((i) => {
      if (!grupos[i.torneio]) grupos[i.torneio] = [];
      grupos[i.torneio].push(i);
    });

    painelInscritos.innerHTML = "";

    Object.keys(grupos).forEach((torneio) => {
      const bloco = document.createElement("div");
      bloco.classList.add("container");
      bloco.style.marginBottom = "20px";

      bloco.innerHTML = `<h3>${torneio}</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Dupla</th>
            <th>Inscrito em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${grupos[torneio]
            .map(
              (i) => `
              <tr>
                <td>${i.id}</td>
                <td>${i.nome_jogador}</td>
                <td>${i.telefone || "-"}</td>
                <td>${i.dupla || "-"}</td>
                <td>${new Date(i.inscrito_em).toLocaleDateString("pt-BR")}</td>
                <td><button onclick="excluirInscricao(${i.id})">🗑️</button></td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>`;

      painelInscritos.appendChild(bloco);
    });
  } catch (error) {
    painelInscritos.innerHTML = "<p>Erro ao carregar inscrições.</p>";
    console.error("Erro ao carregar inscrições:", error);
  }
}

// Excluir inscrição
async function excluirInscricao(id) {
  if (!confirm("Deseja realmente excluir esta inscrição?")) return;
  try {
    const resp = await fetch(`http://localhost:8800/inscricoes/${id}`, {
      method: "DELETE",
    });
    const result = await resp.json();
    alert(result.message);
    carregarInscricoes();
  } catch (error) {
    alert("Erro ao excluir inscrição.");
  }
}

// =================== INICIALIZAÇÃO ===================
carregarTorneios();
carregarInscricoes();
