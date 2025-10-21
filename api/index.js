// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 8800;

app.use(cors());
app.use(express.json()); // parse application/json

// rota de saúde
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API Vôlei funcionando" });
});

// rota de login (simples)
app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha)
    return res
      .status(400)
      .json({ sucesso: false, mensagem: "Dados incompletos" });

  // validação fixa (fallback local). Em seguida iremos adicionar validação real no DB se quiser
  if (usuario === "AdmArena" && senha === "2020") {
    return res.json({ sucesso: true });
  } else {
    return res
      .status(401)
      .json({ sucesso: false, mensagem: "Credenciais inválidas" });
  }
});

// teste de listagem de torneios (estrutura vazia por enquanto)
app.get("/torneios", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, local_evento AS local, data_evento AS data, descricao FROM torneios ORDER BY data_evento ASC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err.message);
    res.json({ success: true, data: [] });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
