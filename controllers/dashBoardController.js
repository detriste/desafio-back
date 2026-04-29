const db = require('../banco');

// GET /api/dashboard?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
exports.getDashboard = async (req, res) => {
  const { inicio, fim } = req.query;

  if (!inicio || !fim) {
    return res.status(400).json({ erro: 'Informe os parâmetros "inicio" e "fim".' });
  }

  // Adiciona 1 dia no fim para incluir o dia inteiro
  const fimDia = `${fim} 23:59:59`;

  try {
    // ── Totais do período ────────────────────────────────────────────────────
    const [[totais]] = await db.query(
      `SELECT
         COUNT(CASE WHEN status_novo = 'em_uso'      THEN 1 END) AS total_retiradas,
         COUNT(CASE WHEN status_novo = 'disponivel'
                    AND status_anterior = 'em_uso'   THEN 1 END) AS total_devolucoes,
         COUNT(CASE WHEN status_novo = 'manutencao'  THEN 1 END) AS total_manutencoes,
         COUNT(CASE WHEN status_novo = 'disponivel'
                    AND status_anterior = 'manutencao' THEN 1 END) AS total_liberacoes
       FROM movimentacoes
       WHERE criado_em BETWEEN ? AND ?`,
      [inicio, fimDia]
    );

    // ── Ferramentas mais retiradas ────────────────────────────────────────────
    const [maisUsadas] = await db.query(
      `SELECT ferramenta_nome AS nome, COUNT(*) AS total
       FROM movimentacoes
       WHERE status_novo = 'em_uso'
         AND criado_em BETWEEN ? AND ?
       GROUP BY ferramenta_nome
       ORDER BY total DESC
       LIMIT 10`,
      [inicio, fimDia]
    );

    // ── Ferramentas com mais manutenções ──────────────────────────────────────
    const [maisManutencao] = await db.query(
      `SELECT ferramenta_nome AS nome, COUNT(*) AS total
       FROM movimentacoes
       WHERE status_novo = 'manutencao'
         AND criado_em BETWEEN ? AND ?
       GROUP BY ferramenta_nome
       ORDER BY total DESC
       LIMIT 10`,
      [inicio, fimDia]
    );

    // ── Manutentores que mais retiraram ───────────────────────────────────────
    const [maisManutentores] = await db.query(
      `SELECT usuario_nome AS nome, usuario_area AS area, COUNT(*) AS total
       FROM movimentacoes
       WHERE status_novo = 'em_uso'
         AND usuario_nome IS NOT NULL
         AND criado_em BETWEEN ? AND ?
       GROUP BY usuario_nome, usuario_area
       ORDER BY total DESC
       LIMIT 10`,
      [inicio, fimDia]
    );

    return res.json({
      periodo: { inicio, fim },
      totais: {
        total_retiradas:   totais.total_retiradas   ?? 0,
        total_devolucoes:  totais.total_devolucoes  ?? 0,
        total_manutencoes: totais.total_manutencoes ?? 0,
        total_liberacoes:  totais.total_liberacoes  ?? 0,
      },
      maisUsadas,
      maisManutencao,
      maisManutentores,
    });

  } catch (err) {
    console.error('[dashboard]', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};