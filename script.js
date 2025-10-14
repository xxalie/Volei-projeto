document.getElementById("form-inscricao").addEventListener("submit", async function(event) {
  event.preventDefault();
  const form = event.target;

  const dados = {
    nome: form.nome.value.trim(),
    whatsapp: form.whatsapp.value.trim(),
    torneio: form.torneio.value
    // Removi 'number' pois não existe no seu HTML
  };

  try {
    const resposta = await fetch("/inscrever", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
      throw new Error("Erro ao enviar inscrição. Tente novamente.");
    }

    const resultado = await resposta.json();
    alert(resultado.mensagem || "Inscrição enviada com sucesso!");
    form.reset();

  } catch (error) {
    alert(error.message);
  }
});