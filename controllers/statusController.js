const db = require('../banco');

async function registrarMovimentacao(conn, {
  ferramenta_id, ferramenta_nome, status_anterior, status_novo,
  usuario_id = null, usuario_cracha = null, usuario_nome = null, usuario_area = null, observacao = null,
}) {
  await conn.query(
    `INSERT INTO movimentacoes
       (ferramenta_id, ferramenta_nome, status_anterior, status_novo,
        usuario_id, usuario_cracha, usuario_nome, usuario_area, observacao, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [ferramenta_id, ferramenta_nome, status_anterior, status_novo,
     usuario_id, usuario_cracha, usuario_nome, usuario_area, observacao]
  );
}

async function buscarFerramenta(conn, id) {
  const [rows] = await conn.query('SELECT * FROM ferramentas WHERE id = ?', [id]);
  if (!rows.length) { const err = new Error('Ferramenta não encontrada.'); err.status = 404; throw err; }
  return rows[0];
}

exports.retirar = async (req, res) => {
  const { id } = req.params;
  const { usuario_nome, usuario_area, ordem_servico, usuario_id, usuario_cracha } = req.body;

  if (!usuario_nome?.trim()) return res.status(400).json({ erro: '"usuario_nome" é obrigatório.' });
  if (!usuario_area?.trim()) return res.status(400).json({ erro: '"usuario_area" é obrigatório.' });
  if (!ordem_servico?.trim()) return res.status(400).json({ erro: '"ordem_servico" é obrigatório.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const ferramenta = await buscarFerramenta(conn, id);

    if (ferramenta.status !== 'disponivel') {
      await conn.rollback();
      return res.status(409).json({ erro: { em_uso: 'Ferramenta já está em uso.', manutencao: 'Ferramenta está em manutenção.' }[ferramenta.status] ?? 'Indisponível.' });
    }

    const observacao = `OS: ${ordem_servico.trim()}`;

    await conn.query(
      `UPDATE ferramentas SET status='em_uso', usuario_id=?, usuario_cracha=?, usuario_nome=?, usuario_area=?, observacao=?, data_retirada=NOW() WHERE id=?`,
      [usuario_id ?? null, usuario_cracha ?? null, usuario_nome.trim(), usuario_area.trim(), observacao, id]
    );

    await registrarMovimentacao(conn, {
      ferramenta_id: ferramenta.id, ferramenta_nome: ferramenta.nome,
      status_anterior: 'disponivel', status_novo: 'em_uso',
      usuario_id: usuario_id ?? null, usuario_cracha: usuario_cracha ?? null,
      usuario_nome: usuario_nome.trim(), usuario_area: usuario_area.trim(), observacao,
    });

    await conn.commit();
    return res.json({ mensagem: `Ferramenta "${ferramenta.nome}" registrada como em uso.`, ferramenta_id: ferramenta.id, status: 'em_uso' });
  } catch (err) {
    await conn.rollback();
    return res.status(err.status ?? 500).json({ erro: err.message ?? 'Erro interno.' });
  } finally { conn.release(); }
};

exports.devolver = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const ferramenta = await buscarFerramenta(conn, id);

    if (ferramenta.status !== 'em_uso') {
      await conn.rollback();
      return res.status(409).json({ erro: `Ferramenta não está em uso (status: "${ferramenta.status}").` });
    }

    const { usuario_id, usuario_cracha, usuario_nome, usuario_area, observacao } = ferramenta;

    await conn.query(
      `UPDATE ferramentas SET status='disponivel', usuario_id=NULL, usuario_cracha=NULL, usuario_nome=NULL, usuario_area=NULL, observacao=NULL, data_retirada=NULL WHERE id=?`,
      [id]
    );

    await registrarMovimentacao(conn, {
      ferramenta_id: ferramenta.id, ferramenta_nome: ferramenta.nome,
      status_anterior: 'em_uso', status_novo: 'disponivel',
      usuario_id, usuario_cracha, usuario_nome, usuario_area,
      observacao: observacao ? `Devolução. Retirada com: ${observacao}` : 'Devolução.',
    });

    await conn.commit();
    return res.json({ mensagem: `Ferramenta "${ferramenta.nome}" devolvida.`, ferramenta_id: ferramenta.id, status: 'disponivel' });
  } catch (err) {
    await conn.rollback();
    return res.status(err.status ?? 500).json({ erro: err.message ?? 'Erro interno.' });
  } finally { conn.release(); }
};

exports.enviarManutencao = async (req, res) => {
  const { id } = req.params;
  const { observacao } = req.body;
  if (!observacao?.trim()) return res.status(400).json({ erro: '"observacao" é obrigatório.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const ferramenta = await buscarFerramenta(conn, id);

    if (ferramenta.status === 'manutencao') {
      await conn.rollback();
      return res.status(409).json({ erro: 'Ferramenta já está em manutenção.' });
    }

    const status_anterior = ferramenta.status;
    await conn.query(`UPDATE ferramentas SET status='manutencao', observacao=? WHERE id=?`, [observacao.trim(), id]);

    await registrarMovimentacao(conn, {
      ferramenta_id: ferramenta.id, ferramenta_nome: ferramenta.nome,
      status_anterior, status_novo: 'manutencao',
      usuario_id: ferramenta.usuario_id, usuario_cracha: ferramenta.usuario_cracha,
      usuario_nome: ferramenta.usuario_nome, usuario_area: ferramenta.usuario_area,
      observacao: observacao.trim(),
    });

    await conn.commit();
    return res.json({ mensagem: `Ferramenta "${ferramenta.nome}" enviada para manutenção.`, ferramenta_id: ferramenta.id, status: 'manutencao' });
  } catch (err) {
    await conn.rollback();
    return res.status(err.status ?? 500).json({ erro: err.message ?? 'Erro interno.' });
  } finally { conn.release(); }
};

exports.disponibilizar = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const ferramenta = await buscarFerramenta(conn, id);

    if (ferramenta.status !== 'manutencao') {
      await conn.rollback();
      return res.status(409).json({ erro: `Ferramenta não está em manutenção (status: "${ferramenta.status}").` });
    }

    await conn.query(
      `UPDATE ferramentas SET status='disponivel', observacao=NULL, usuario_id=NULL, usuario_cracha=NULL, usuario_nome=NULL, usuario_area=NULL, data_retirada=NULL WHERE id=?`,
      [id]
    );

    await registrarMovimentacao(conn, {
      ferramenta_id: ferramenta.id, ferramenta_nome: ferramenta.nome,
      status_anterior: 'manutencao', status_novo: 'disponivel',
      observacao: `Manutenção concluída. Problema anterior: ${ferramenta.observacao ?? '—'}`,
    });

    await conn.commit();
    return res.json({ mensagem: `Ferramenta "${ferramenta.nome}" liberada.`, ferramenta_id: ferramenta.id, status: 'disponivel' });
  } catch (err) {
    await conn.rollback();
    return res.status(err.status ?? 500).json({ erro: err.message ?? 'Erro interno.' });
  } finally { conn.release(); }
};