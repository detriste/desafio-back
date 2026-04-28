const db = require('../banco');

// GET /trocas/pendentes?destinatario=Nome
exports.listarPendentes = async (req, res) => {
  const { destinatario } = req.query;
  if (!destinatario) return res.json([]);
  try {
    const [rows] = await db.query(
      `SELECT * FROM trocas WHERE destinatario_nome = ? AND status = 'pendente' ORDER BY criado_em DESC`,
      [destinatario]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
};

// POST /trocas/solicitar
exports.solicitar = async (req, res) => {
  const { ferramenta_id, ferramenta_nome, solicitante_nome, solicitante_area, destinatario_nome, destinatario_area } = req.body;
  if (!ferramenta_id || !destinatario_nome) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
  }
  try {
    await db.query(
      `INSERT INTO trocas (ferramenta_id, ferramenta_nome, solicitante_nome, solicitante_area, destinatario_nome, destinatario_area)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ferramenta_id, ferramenta_nome, solicitante_nome, solicitante_area, destinatario_nome, destinatario_area]
    );
    return res.json({ mensagem: 'Solicitação enviada.' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao solicitar troca.' });
  }
};

// POST /trocas/:id/aceitar
// Atualiza as credenciais da ferramenta sem passar pelo almoxarife
exports.aceitar = async (req, res) => {
  const { id } = req.params;
  const { novo_usuario_nome, novo_usuario_area, ordem_servico } = req.body;

  if (!novo_usuario_nome || !novo_usuario_area || !ordem_servico) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [trocas] = await conn.query('SELECT * FROM trocas WHERE id = ?', [id]);
    if (!trocas.length) { await conn.rollback(); return res.status(404).json({ erro: 'Troca não encontrada.' }); }
    const troca = trocas[0];
    if (troca.status !== 'pendente') { await conn.rollback(); return res.status(409).json({ erro: 'Troca já foi processada.' }); }

    // Atualiza ferramenta com novo usuário
    await conn.query(
      `UPDATE ferramentas SET usuario_nome = ?, usuario_area = ?, observacao = ?, data_retirada = NOW() WHERE id = ?`,
      [novo_usuario_nome, novo_usuario_area, `OS: ${ordem_servico}`, troca.ferramenta_id]
    );

    // Registra na movimentacoes
    await conn.query(
      `INSERT INTO movimentacoes (ferramenta_id, ferramenta_nome, status_anterior, status_novo, usuario_nome, usuario_area, observacao, criado_em)
       VALUES (?, ?, 'em_uso', 'em_uso', ?, ?, ?, NOW())`,
      [troca.ferramenta_id, troca.ferramenta_nome, novo_usuario_nome, novo_usuario_area, `Troca de ${troca.solicitante_nome} para ${novo_usuario_nome}. OS: ${ordem_servico}`]
    );

    // Marca troca como aceita
    await conn.query(`UPDATE trocas SET status = 'aceita' WHERE id = ?`, [id]);

    await conn.commit();
    return res.json({ mensagem: 'Troca realizada com sucesso.' });
  } catch (err) {
    await conn.rollback();
    console.error('[aceitar troca]', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  } finally {
    conn.release();
  }
};

// POST /trocas/:id/recusar
exports.recusar = async (req, res) => {
  try {
    await db.query(`UPDATE trocas SET status = 'recusada' WHERE id = ?`, [req.params.id]);
    return res.json({ mensagem: 'Troca recusada.' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao recusar.' });
  }
};