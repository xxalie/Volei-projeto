let numberInput = document.getElementById("numberInput");
document.getElementById("form-inscricao").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const form = e.target;
    const dados = {
        nome: form.nome.value,
        whatsapp: form.whatsapp.value,
        torneio: form.torneio.value,
        number: numberInput.value
    };
    
    const resposta = await fetch("/inscrever", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });
    
    const resultado = await resposta.json();
    document.getElementById("resposta").innerText = resultado.mensagem;
    }
);
