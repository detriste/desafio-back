const db = require('../banco');

// POST /ferramentas/:id/atencao
// Apenas registra uma observação de atenção — NÃO muda o status
exports.registrarAtencao = async (req, res) => {
  const { id } = req.params;
  const { observacao, reporter_nome } = req.body;

  if (!observacao?.trim()) return res.status(400).json({ erro: 'Descrição obrigatória.' });

  try {
    // Registra na movimentacoes como log de atenção (status anterior = status novo = em_uso)
    const [rows] = await db.query('SELECT * FROM ferramentas WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ erro: 'Ferramenta não encontrada.' });
    const f = rows[0];

    await db.query(
      `INSERT INTO movimentacoes (ferramenta_id, ferramenta_nome, status_anterior, status_novo, usuario_nome, observacao, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [f.id, f.nome, f.status, f.status, reporter_nome ?? null, `[ATENÇÃO] ${observacao.trim()}`]
    );

    return res.json({ mensagem: 'Ponto de atenção registrado.' });
  } catch (err) {
    console.error('[atencao]', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
};