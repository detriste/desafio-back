const db = require('../banco');

// GET /api/dashboard?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
exports.getDashboard = async (req, res) => {
  const { inicio, fim } = req.query;

  if (!inicio || !fim) {
    return res.status(400).json({ erro: 'Informe os parâmetros "inicio" e "fim".' });
  }

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
  `SELECT usuario_nome AS nome, MAX(usuario_area) AS area, COUNT(*) AS total
   FROM movimentacoes
   WHERE status_novo = 'em_uso'
     AND usuario_nome IS NOT NULL
     AND criado_em BETWEEN ? AND ?
   GROUP BY usuario_nome
   ORDER BY total DESC
   LIMIT 10`,
  [inicio, fimDia]
);

    // ── Ferramentas atualmente em uso (não devolvidas) ────────────────────────
    // Busca direto na tabela ferramentas — sem filtro de período,
    // pois mostra o estado ATUAL independente de quando foi retirada
    const [emUsoRaw] = await db.query(
      `SELECT
         nome          AS ferramenta_nome,
         codigo        AS ferramenta_codigo,
         usuario_nome  AS manutentor_nome,
         usuario_area  AS manutentor_area,
         observacao    AS ordem_servico,
         data_retirada AS data_retirada
       FROM ferramentas
       WHERE status = 'em_uso'
       ORDER BY data_retirada ASC`
    );

    // Log para debug — aparece no terminal do Node
    console.log('[dashboard] emUso encontrados:', emUsoRaw.length);
    if (emUsoRaw.length > 0) {
      console.log('[dashboard] primeiro item:', emUsoRaw[0]);
    }

    // Garante que emUso sempre é um array, nunca undefined
    const emUso = Array.isArray(emUsoRaw) ? emUsoRaw : [];

    return res.json({
      periodo: { inicio, fim },
      totais: {
        total_retiradas:   totais.total_retiradas   ?? 0,
        total_devolucoes:  totais.total_devolucoes  ?? 0,
        total_manutencoes: totais.total_manutencoes ?? 0,
        total_liberacoes:  totais.total_liberacoes  ?? 0,
      },
      maisUsadas:       Array.isArray(maisUsadas)       ? maisUsadas       : [],
      maisManutencao:   Array.isArray(maisManutencao)   ? maisManutencao   : [],
      maisManutentores: Array.isArray(maisManutentores) ? maisManutentores : [],
      emUso,
    });

  } catch (err) {
    console.error('[dashboard] ERRO:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};