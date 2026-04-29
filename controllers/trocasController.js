const db = require('../banco');

exports.listarPendentes = async (req, res) => {
  const { destinatario } = req.query;
  if (!destinatario) return res.json([]);
  try {
    const [rows] = await db.query(
      `SELECT * FROM trocas WHERE destinatario_nome = ? AND status = 'pendente' ORDER BY criado_em DESC`,
      [destinatario]
    );
    return res.json(rows);
  } catch (err) { return res.status(500).json({ erro: 'Erro no servidor' }); }
};

exports.listarAceitas = async (req, res) => {
  const { solicitante } = req.query;
  if (!solicitante) return res.json([]);
  try {
    const [rows] = await db.query(
      `SELECT * FROM trocas WHERE solicitante_nome = ? AND status = 'aceita' ORDER BY criado_em DESC`,
      [solicitante]
    );
    return res.json(rows);
  } catch (err) { return res.status(500).json({ erro: 'Erro no servidor' }); }
};

exports.aceitar = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [trocas] = await conn.query('SELECT * FROM trocas WHERE id = ?', [id]);
    if (!trocas.length) { await conn.rollback(); return res.status(404).json({ erro: 'Troca não encontrada.' }); }
    if (trocas[0].status !== 'pendente') { await conn.rollback(); return res.status(409).json({ erro: 'Troca já foi processada.' }); }
    await conn.query(`UPDATE trocas SET status = 'aceita' WHERE id = ?`, [id]);
    await conn.commit();
    return res.json({ mensagem: 'Troca aceita. Aguardando solicitante confirmar.' });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ erro: 'Erro interno.' });
  } finally { conn.release(); }
};

exports.concluir = async (req, res) => {
  const { id } = req.params;
  const { usuario_cracha, usuario_nome, usuario_area, ordem_servico } = req.body;

  if (!usuario_nome || !usuario_area || !ordem_servico)
    return res.status(400).json({ erro: 'Preencha todos os campos.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [trocas] = await conn.query('SELECT * FROM trocas WHERE id = ?', [id]);
    if (!trocas.length) { await conn.rollback(); return res.status(404).json({ erro: 'Troca não encontrada.' }); }
    const troca = trocas[0];
    if (troca.status !== 'aceita') { await conn.rollback(); return res.status(409).json({ erro: 'Troca não foi aceita ainda.' }); }

    await conn.query(
      `UPDATE ferramentas SET usuario_cracha=?, usuario_nome=?, usuario_area=?, observacao=?, data_retirada=NOW() WHERE id=?`,
      [usuario_cracha ?? null, usuario_nome, usuario_area, `OS: ${ordem_servico}`, troca.ferramenta_id]
    );

    await conn.query(
      `INSERT INTO movimentacoes (ferramenta_id, ferramenta_nome, status_anterior, status_novo, usuario_cracha, usuario_nome, usuario_area, observacao, criado_em)
       VALUES (?, ?, 'em_uso', 'em_uso', ?, ?, ?, ?, NOW())`,
      [troca.ferramenta_id, troca.ferramenta_nome, usuario_cracha ?? null, usuario_nome, usuario_area,
       `Troca concluída. Solicitante: ${usuario_nome}. OS: ${ordem_servico}`]
    );

    await conn.query(`UPDATE trocas SET status = 'concluida' WHERE id = ?`, [id]);
    await conn.commit();
    return res.json({ mensagem: 'Ferramenta registrada no seu nome.' });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ erro: 'Erro interno.' });
  } finally { conn.release(); }
};

exports.recusar = async (req, res) => {
  try {
    await db.query(`UPDATE trocas SET status = 'recusada' WHERE id = ?`, [req.params.id]);
    return res.json({ mensagem: 'Troca recusada.' });
  } catch (err) { return res.status(500).json({ erro: 'Erro ao recusar.' }); }
};

exports.solicitar = async (req, res) => {
  const { ferramenta_id, ferramenta_nome, solicitante_nome, solicitante_area, destinatario_nome, destinatario_area } = req.body;
  if (!ferramenta_id || !solicitante_nome || !destinatario_nome)
    return res.status(400).json({ erro: 'Dados incompletos.' });

  try {
    await db.query(
      `INSERT INTO trocas (ferramenta_id, ferramenta_nome, solicitante_nome, solicitante_area, destinatario_nome, destinatario_area, status, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, 'pendente', NOW())`,
      [ferramenta_id, ferramenta_nome, solicitante_nome, solicitante_area, destinatario_nome, destinatario_area]
    );
    return res.json({ mensagem: 'Solicitação enviada.' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno.' });
  }
};