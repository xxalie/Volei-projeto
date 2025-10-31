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
      "SELECT id, nome, local_evento AS local, data_evento AS data, descricao, link FROM torneios ORDER BY data_evento ASC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err.message);
    res.json({ success: true, data: [] });
  }
});

// rota para cadastrar torneios
app.post("/torneios", async (req, res) => {
  try {
    const { nome, local_evento, data_evento, descricao, link } = req.body;

    if (!nome || !local_evento || !data_evento || !descricao) {
      return res.status(400).json({
        success: false,
        message: "Preencha todos os campos obrigatórios.",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO torneios (nome, local_evento, data_evento, descricao, link) VALUES (?, ?, ?, ?, ?)",
      [nome, local_evento, data_evento, descricao, link || null]
    );

    res.json({
      success: true,
      message: "Torneio cadastrado com sucesso!",
      id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erro ao cadastrar torneio" });
  }
});

// rota para atualizar torneio
app.put("/torneios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, local_evento, data_evento, descricao } = req.body;

    if (!nome || !local_evento || !data_evento || !descricao) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios.",
      });
    }

    const [result] = await pool.query(
      "UPDATE torneios SET nome=?, local_evento=?, data_evento=?, descricao=?, link=? WHERE id=?",
      [nome, local_evento, data_evento, descricao, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Torneio não encontrado.",
      });
    }

    res.json({ success: true, message: "Torneio atualizado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao atualizar" });
  }
});

// rota para deletar torneio
app.delete("/torneios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM torneios WHERE id=?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Torneio não encontrado.",
      });
    }

    res.json({ success: true, message: "Torneio removido com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao deletar" });
  }
});

// ================= ROTAS DE INSCRIÇÕES =================

// Listar inscrições com nome do torneio
app.get("/inscricoes", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.id, i.nome_jogador, i.email_jogador, i.telefone,
              i.dupla, i.inscrito_em,
              t.nome AS torneio
       FROM inscricoes i
       JOIN torneios t ON i.torneio_id = t.id
       ORDER BY i.inscrito_em DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar inscrições" });
  }
});

// Criar nova inscrição
app.post("/inscricoes", async (req, res) => {
  const { nome_jogador, email_jogador, telefone, dupla, torneio_id } = req.body;

  if (!nome_jogador || !torneio_id)
    return res
      .status(400)
      .json({ success: false, message: "Dados obrigatórios faltando" });

  try {
    const [result] = await pool.query(
      "INSERT INTO inscricoes (nome_jogador, email_jogador, telefone, dupla, torneio_id) VALUES (?, ?, ?, ?, ?)",
      [nome_jogador, email_jogador, telefone, dupla, torneio_id]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ success: false, message: "Erro ao criar inscrição" });
  }
});

// Deletar inscrição
app.delete("/inscricoes/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM inscricoes WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Inscrição não encontrada" });
    }

    res.json({ success: true, message: "Inscrição removida" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Erro ao deletar" });
  }
});

// Rota de relatório (chama a procedure no MySQL)
app.get("/relatorio", async (req, res) => {
  try {
    const [resultSets] = await pool.query("CALL relatorio_inscricoes()");

    // MySQL retorna múltiplos conjuntos, então normalizamos:
    const relatorio = {
      total_por_torneio: resultSets[0],
      lista_inscritos: resultSets[1],
      torneio_popular: resultSets[2][0],
      dia_com_mais_inscricoes: resultSets[3][0],
      media_inscricoes: resultSets[4][0],
      ultimo_torneio: resultSets[5][0],
    };

    res.json({ success: true, relatorio });
  } catch (err) {
    console.error("Erro ao gerar relatório:", err);
    res
      .status(500)
      .json({ success: false, message: "Erro ao gerar relatório" });
  }
});

// Rota para buscar o histórico de inscrições (trigger)
app.get("/historico", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nome_jogador, torneio_nome, acao, DATE_FORMAT(data_hora, '%d/%m/%Y %H:%i') AS data_hora FROM historico_inscricoes ORDER BY data_hora DESC"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar histórico" });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
