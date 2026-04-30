const db = require('../banco');

// GET /solicitacoes/pendentes — almoxarife lista todas pendentes
exports.listarPendentes = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM solicitacoes_retirada WHERE status = 'pendente' ORDER BY criado_em DESC`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro no servidor.' });
  }
};

// POST /solicitacoes/solicitar — manutentor solicita retirada
exports.solicitar = async (req, res) => {
  const { ferramenta_id, ferramenta_nome, manutentor_cracha, manutentor_nome, manutentor_area, ordem_servico } = req.body;

  if (!ferramenta_id || !manutentor_cracha || !manutentor_nome || !manutentor_area || !ordem_servico)
    return res.status(400).json({ erro: 'Preencha todos os campos.' });

  try {
    // Verifica se já existe solicitação pendente para essa ferramenta
    const [existente] = await db.query(
      `SELECT id FROM solicitacoes_retirada WHERE ferramenta_id = ? AND status = 'pendente'`,
      [ferramenta_id]
    );
    if (existente.length) return res.status(409).json({ erro: 'Já existe uma solicitação pendente para essa ferramenta.' });

    await db.query(
      `INSERT INTO solicitacoes_retirada (ferramenta_id, ferramenta_nome, manutentor_cracha, manutentor_nome, manutentor_area, ordem_servico)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ferramenta_id, ferramenta_nome, manutentor_cracha, manutentor_nome, manutentor_area, ordem_servico]
    );
    return res.json({ mensagem: 'Solicitação enviada. Aguardando aprovação do almoxarife.' });
  } catch (err) {
    console.error('[solicitar retirada]', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
};

// POST /solicitacoes/:id/aprovar — almoxarife aprova e ferramenta vai para em_uso
exports.aprovar = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM solicitacoes_retirada WHERE id = ?', [id]);
    if (!rows.length) { await conn.rollback(); return res.status(404).json({ erro: 'Solicitação não encontrada.' }); }
    const sol = rows[0];
    if (sol.status !== 'pendente') { await conn.rollback(); return res.status(409).json({ erro: 'Solicitação já foi processada.' }); }

    // Verifica se ferramenta ainda está disponível
    const [ferRows] = await conn.query('SELECT * FROM ferramentas WHERE id = ?', [sol.ferramenta_id]);
    if (!ferRows.length) { await conn.rollback(); return res.status(404).json({ erro: 'Ferramenta não encontrada.' }); }
    const ferramenta = ferRows[0];
    if (ferramenta.status !== 'disponivel') {
      await conn.rollback();
      return res.status(409).json({ erro: 'Ferramenta não está mais disponível.' });
    }

    // Atualiza ferramenta para em_uso
    await conn.query(
      `UPDATE ferramentas SET status='em_uso', usuario_cracha=?, usuario_nome=?, usuario_area=?, observacao=?, data_retirada=NOW() WHERE id=?`,
      [sol.manutentor_cracha, sol.manutentor_nome, sol.manutentor_area, `OS: ${sol.ordem_servico}`, sol.ferramenta_id]
    );

    // Registra movimentação
    await conn.query(
      `INSERT INTO movimentacoes (ferramenta_id, ferramenta_nome, status_anterior, status_novo, usuario_cracha, usuario_nome, usuario_area, observacao, criado_em)
       VALUES (?, ?, 'disponivel', 'em_uso', ?, ?, ?, ?, NOW())`,
      [sol.ferramenta_id, sol.ferramenta_nome, sol.manutentor_cracha, sol.manutentor_nome, sol.manutentor_area, `OS: ${sol.ordem_servico}`]
    );

    // Marca solicitação como aprovada
    await conn.query(`UPDATE solicitacoes_retirada SET status='aprovada' WHERE id=?`, [id]);

    await conn.commit();
    return res.json({ mensagem: `Retirada de "${sol.ferramenta_nome}" aprovada.` });
  } catch (err) {
    await conn.rollback();
    console.error('[aprovar retirada]', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  } finally {
    conn.release();
  }
};

// POST /solicitacoes/:id/recusar — almoxarife recusa
exports.recusar = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM solicitacoes_retirada WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ erro: 'Solicitação não encontrada.' });
    if (rows[0].status !== 'pendente') return res.status(409).json({ erro: 'Solicitação já foi processada.' });

    await db.query(`UPDATE solicitacoes_retirada SET status='recusada' WHERE id=?`, [req.params.id]);
    return res.json({ mensagem: 'Solicitação recusada.' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao recusar.' });
  }
};