const db = require('../banco');

exports.getDashboard = async (req, res) => {
  // Período: se não informado, usa últimos 30 dias
  const fim    = req.query.fim    ? req.query.fim    + ' 23:59:59' : new Date().toISOString().slice(0, 10) + ' 23:59:59';
  const inicio = req.query.inicio ? req.query.inicio + ' 00:00:00' : (() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10) + ' 00:00:00';
  })();

  try {
    // ── Top ferramentas mais retiradas (em_uso) ───────────────────────────────
    const [maisUsadas] = await db.query(
      `SELECT ferramenta_nome AS nome, COUNT(*) AS total
       FROM movimentacoes
       WHERE status_novo = 'em_uso'
         AND criado_em BETWEEN ? AND ?
       GROUP BY ferramenta_nome
       ORDER BY total DESC
       LIMIT 10`,
      [inicio, fim]
    );

    // ── Top ferramentas que mais foram para manutenção ────────────────────────
    const [maisManutencao] = await db.query(
      `SELECT ferramenta_nome AS nome, COUNT(*) AS total
       FROM movimentacoes
       WHERE status_novo = 'manutencao'
         AND criado_em BETWEEN ? AND ?
       GROUP BY ferramenta_nome
       ORDER BY total DESC
       LIMIT 10`,
      [inicio, fim]
    );

    // ── Top manutentores que mais pegaram ferramentas ─────────────────────────
    const [maisManutentores] = await db.query(
      `SELECT usuario_nome AS nome, usuario_area AS area, COUNT(*) AS total
       FROM movimentacoes
       WHERE status_novo = 'em_uso'
         AND usuario_nome IS NOT NULL
         AND criado_em BETWEEN ? AND ?
       GROUP BY usuario_nome, usuario_area
       ORDER BY total DESC
       LIMIT 10`,
      [inicio, fim]
    );

    // ── Totais gerais do período ──────────────────────────────────────────────
    const [[totais]] = await db.query(
      `SELECT
         COUNT(CASE WHEN status_novo = 'em_uso'     THEN 1 END) AS total_retiradas,
         COUNT(CASE WHEN status_novo = 'disponivel' AND status_anterior = 'em_uso' THEN 1 END) AS total_devolucoes,
         COUNT(CASE WHEN status_novo = 'manutencao' THEN 1 END) AS total_manutencoes,
         COUNT(CASE WHEN status_novo = 'disponivel' AND status_anterior = 'manutencao' THEN 1 END) AS total_liberacoes
       FROM movimentacoes
       WHERE criado_em BETWEEN ? AND ?`,
      [inicio, fim]
    );

    return res.json({
      periodo: { inicio, fim },
      totais,
      maisUsadas,
      maisManutencao,
      maisManutentores,
    });

  } catch (err) {
    console.error('[dashboard]', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
};