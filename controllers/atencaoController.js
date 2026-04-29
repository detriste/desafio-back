const db = require('../banco');

exports.registrarAtencao = async (req, res) => {
  const { id } = req.params;
  const { observacao, reporter_nome } = req.body;

  if (!observacao?.trim()) return res.status(400).json({ erro: 'Descrição obrigatória.' });

  try {
    const [rows] = await db.query('SELECT * FROM ferramentas WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ erro: 'Ferramenta não encontrada.' });
    const f = rows[0];

    await db.query(
      `INSERT INTO movimentacoes 
        (ferramenta_id, ferramenta_nome, status_anterior, status_novo, usuario_nome, observacao, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [f.id, f.nome, f.status, f.status, reporter_nome ?? null, `[ATENÇÃO] ${observacao.trim()}`]
    );

    return res.json({ mensagem: 'Ponto de atenção registrado.' });
  } catch (err) {
    console.error('[atencao]', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
};

exports.listarAtencoes = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT usuario_nome, observacao, criado_em 
       FROM movimentacoes 
       WHERE ferramenta_id = ? AND observacao LIKE '%ATENÇÃO%'
       ORDER BY criado_em DESC`,
      [id]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listarAtencoes]', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
};