const db = require('../banco');

exports.getDashboard = async (req, res) => {
  const { inicio, fim } = req.query;

  if (!inicio || !fim) {
    return res.status(400).json({ erro: 'Informe os parâmetros "inicio" e "fim".' });
  }

  // Garante que o fim do dia seja incluído
  const inicioStr = `${inicio} 00:00:00`;
  const fimStr    = `${fim} 23:59:59`;

  try {
    const [[totais]] = await db.query(
      `SELECT
         COUNT(CASE WHEN status_novo = 'em_uso'                                    THEN 1 END) AS total_retiradas,
         COUNT(CASE WHEN status_novo = 'disponivel' AND status_anterior = 'em_uso' THEN 1 END) AS total_devolucoes,
         COUNT(CASE WHEN status_novo = 'manutencao'                                THEN 1 END) AS total_manutencoes,
         COUNT(CASE WHEN status_novo = 'disponivel' AND status_anterior = 'manutencao' THEN 1 END) AS total_liberacoes
       FROM movimentacoes
       WHERE criado_em BETWEEN ? AND ?`,
      [inicioStr, fimStr]
    );

    const [maisUsadas] = await db.query(
      `SELECT ferramenta_nome AS nome, COUNT(*) AS total
       FROM movimentacoes
       WHERE status_novo = 'em_uso'
         AND criado_em BETWEEN ? AND ?
       GROUP BY ferramenta_nome
       ORDER BY total DESC
       LIMIT 10`,
      [inicioStr, fimStr]
    );

    const [maisManutencao] = await db.query(
      `SELECT ferramenta_nome AS nome, COUNT(*) AS total
       FROM movimentacoes
       WHERE status_novo = 'manutencao'
         AND criado_em BETWEEN ? AND ?
       GROUP BY ferramenta_nome
       ORDER BY total DESC
       LIMIT 10`,
      [inicioStr, fimStr]
    );

    const [maisManutentores] = await db.query(
      `SELECT usuario_nome AS nome, MAX(usuario_area) AS area, COUNT(*) AS total
       FROM movimentacoes
       WHERE status_novo = 'em_uso'
         AND usuario_nome IS NOT NULL
         AND usuario_nome != ''
         AND criado_em BETWEEN ? AND ?
       GROUP BY usuario_nome
       ORDER BY total DESC
       LIMIT 10`,
      [inicioStr, fimStr]
    );

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

    // Log completo para debug
    console.log('======= DASHBOARD DEBUG =======');
    console.log('Período:', inicioStr, 'até', fimStr);
    console.log('Totais:', totais);
    console.log('Mais usadas:', maisUsadas);
    console.log('Mais manutenção:', maisManutencao);
    console.log('Mais manutentores:', maisManutentores);
    console.log('Em uso agora:', emUsoRaw.length, 'ferramenta(s)');
    console.log('===============================');

    return res.json({
      periodo: { inicio, fim },
      totais: {
        total_retiradas:   totais.total_retiradas   ?? 0,
        total_devolucoes:  totais.total_devolucoes  ?? 0,
        total_manutencoes: totais.total_manutencoes ?? 0,
        total_liberacoes:  totais.total_liberacoes  ?? 0,
      },
      maisUsadas:       maisUsadas       ?? [],
      maisManutencao:   maisManutencao   ?? [],
      maisManutentores: maisManutentores ?? [],
      emUso:            emUsoRaw         ?? [],
    });

  } catch (err) {
    console.error('[dashboard] ERRO:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};