const db = require('../banco');

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: registra uma linha na tabela movimentacoes
// ─────────────────────────────────────────────────────────────────────────────
async function registrarMovimentacao(conn, {
  ferramenta_id,
  ferramenta_nome,
  status_anterior,
  status_novo,
  usuario_id   = null,
  usuario_cpf  = null,
  usuario_nome = null,
  usuario_area = null,
  observacao   = null,
}) {
  await conn.query(
    `INSERT INTO movimentacoes
       (ferramenta_id, ferramenta_nome,
        status_anterior, status_novo,
        usuario_id, usuario_cpf, usuario_nome, usuario_area,
        observacao, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      ferramenta_id, ferramenta_nome,
      status_anterior, status_novo,
      usuario_id, usuario_cpf, usuario_nome, usuario_area,
      observacao,
    ]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: busca ferramenta por ID e lança erro 404 se não encontrar
// ─────────────────────────────────────────────────────────────────────────────
async function buscarFerramenta(conn, id) {
  const [rows] = await conn.query(
    'SELECT * FROM ferramentas WHERE id = ?', [id]
  );
  if (!rows.length) {
    const err = new Error('Ferramenta não encontrada.');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /ferramentas/:id/retirar
// disponivel → em_uso
// Body: { usuario_nome, usuario_area, ordem_servico, usuario_id?, usuario_cpf? }
// ─────────────────────────────────────────────────────────────────────────────
exports.retirar = async (req, res) => {
  const { id } = req.params;
  const { usuario_nome, usuario_area, ordem_servico, usuario_id, usuario_cpf } = req.body;

  // ── Validações de entrada ──────────────────────────────────────────────────
  if (!usuario_nome?.trim()) {
    return res.status(400).json({ erro: 'O campo "usuario_nome" é obrigatório.' });
  }
  if (!usuario_area?.trim()) {
    return res.status(400).json({ erro: 'O campo "usuario_area" (local de uso) é obrigatório.' });
  }
  if (!ordem_servico?.trim()) {
    return res.status(400).json({ erro: 'O campo "ordem_servico" (OS) é obrigatório.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const ferramenta = await buscarFerramenta(conn, id);

    // ── Regra de negócio: só pode retirar se estiver disponível ───────────────
    if (ferramenta.status !== 'disponivel') {
      const mensagens = {
        em_uso:     'Ferramenta já está em uso.',
        manutencao: 'Ferramenta está em manutenção e não pode ser retirada.',
      };
      await conn.rollback();
      return res.status(409).json({ erro: mensagens[ferramenta.status] ?? 'Ferramenta indisponível.' });
    }

    const observacao = `OS: ${ordem_servico.trim()}`;

    // ── Atualiza a ferramenta ─────────────────────────────────────────────────
    await conn.query(
      `UPDATE ferramentas
          SET status        = 'em_uso',
              usuario_id    = ?,
              usuario_cpf   = ?,
              usuario_nome  = ?,
              usuario_area  = ?,
              observacao    = ?,
              data_retirada = NOW()
        WHERE id = ?`,
      [
        usuario_id  ?? null,
        usuario_cpf ?? null,
        usuario_nome.trim(),
        usuario_area.trim(),
        observacao,
        id,
      ]
    );

    // ── Registra movimentação ─────────────────────────────────────────────────
    await registrarMovimentacao(conn, {
      ferramenta_id:   ferramenta.id,
      ferramenta_nome: ferramenta.nome,
      status_anterior: 'disponivel',
      status_novo:     'em_uso',
      usuario_id:      usuario_id  ?? null,
      usuario_cpf:     usuario_cpf ?? null,
      usuario_nome:    usuario_nome.trim(),
      usuario_area:    usuario_area.trim(),
      observacao,
    });

    await conn.commit();
    return res.json({
      mensagem: `Ferramenta "${ferramenta.nome}" registrada como em uso.`,
      ferramenta_id: ferramenta.id,
      status: 'em_uso',
    });

  } catch (err) {
    await conn.rollback();
    console.error('[retirar]', err);
    return res.status(err.status ?? 500).json({ erro: err.message ?? 'Erro interno no servidor.' });
  } finally {
    conn.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /ferramentas/:id/devolver
// em_uso → disponivel
// Body: {} (nenhum campo obrigatório)
// ─────────────────────────────────────────────────────────────────────────────
exports.devolver = async (req, res) => {
  const { id } = req.params;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const ferramenta = await buscarFerramenta(conn, id);

    // ── Regra de negócio: só pode devolver se estiver em uso ──────────────────
    if (ferramenta.status !== 'em_uso') {
      await conn.rollback();
      return res.status(409).json({
        erro: `Ferramenta não está em uso (status atual: "${ferramenta.status}").`,
      });
    }

    // ── Salva dados do usuário para o histórico antes de limpar ───────────────
    const { usuario_id, usuario_cpf, usuario_nome, usuario_area, observacao } = ferramenta;

    // ── Limpa campos de uso e atualiza status ─────────────────────────────────
    await conn.query(
      `UPDATE ferramentas
          SET status        = 'disponivel',
              usuario_id    = NULL,
              usuario_cpf   = NULL,
              usuario_nome  = NULL,
              usuario_area  = NULL,
              observacao    = NULL,
              data_retirada = NULL
        WHERE id = ?`,
      [id]
    );

    // ── Registra movimentação ─────────────────────────────────────────────────
    await registrarMovimentacao(conn, {
      ferramenta_id:   ferramenta.id,
      ferramenta_nome: ferramenta.nome,
      status_anterior: 'em_uso',
      status_novo:     'disponivel',
      usuario_id,
      usuario_cpf,
      usuario_nome,
      usuario_area,
      observacao: observacao ? `Devolução. Retirada com: ${observacao}` : 'Devolução.',
    });

    await conn.commit();
    return res.json({
      mensagem: `Ferramenta "${ferramenta.nome}" devolvida e disponível.`,
      ferramenta_id: ferramenta.id,
      status: 'disponivel',
    });

  } catch (err) {
    await conn.rollback();
    console.error('[devolver]', err);
    return res.status(err.status ?? 500).json({ erro: err.message ?? 'Erro interno no servidor.' });
  } finally {
    conn.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /ferramentas/:id/manutencao
// disponivel | em_uso → manutencao
// Body: { observacao }
// ─────────────────────────────────────────────────────────────────────────────
exports.enviarManutencao = async (req, res) => {
  const { id } = req.params;
  const { observacao } = req.body;

  // ── Validação: descrição do problema é obrigatória ────────────────────────
  if (!observacao?.trim()) {
    return res.status(400).json({ erro: 'O campo "observacao" (descrição do problema) é obrigatório.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const ferramenta = await buscarFerramenta(conn, id);

    // ── Regra de negócio: só aceita disponivel ou em_uso ─────────────────────
    if (ferramenta.status === 'manutencao') {
      await conn.rollback();
      return res.status(409).json({ erro: 'Ferramenta já está em manutenção.' });
    }

    const status_anterior = ferramenta.status;

    // ── Atualiza status; mantém dados do usuário caso venha de em_uso ─────────
    await conn.query(
      `UPDATE ferramentas
          SET status     = 'manutencao',
              observacao = ?
        WHERE id = ?`,
      [observacao.trim(), id]
    );

    // ── Registra movimentação ─────────────────────────────────────────────────
    await registrarMovimentacao(conn, {
      ferramenta_id:   ferramenta.id,
      ferramenta_nome: ferramenta.nome,
      status_anterior,
      status_novo:     'manutencao',
      usuario_id:      ferramenta.usuario_id,
      usuario_cpf:     ferramenta.usuario_cpf,
      usuario_nome:    ferramenta.usuario_nome,
      usuario_area:    ferramenta.usuario_area,
      observacao:      observacao.trim(),
    });

    await conn.commit();
    return res.json({
      mensagem: `Ferramenta "${ferramenta.nome}" enviada para manutenção.`,
      ferramenta_id: ferramenta.id,
      status: 'manutencao',
      status_anterior,
    });

  } catch (err) {
    await conn.rollback();
    console.error('[enviarManutencao]', err);
    return res.status(err.status ?? 500).json({ erro: err.message ?? 'Erro interno no servidor.' });
  } finally {
    conn.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /ferramentas/:id/disponibilizar
// manutencao → disponivel
// Body: {} (nenhum campo obrigatório)
// ─────────────────────────────────────────────────────────────────────────────
exports.disponibilizar = async (req, res) => {
  const { id } = req.params;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const ferramenta = await buscarFerramenta(conn, id);

    // ── Regra de negócio: só libera se estiver em manutenção ─────────────────
    if (ferramenta.status !== 'manutencao') {
      await conn.rollback();
      return res.status(409).json({
        erro: `Ferramenta não está em manutenção (status atual: "${ferramenta.status}").`,
      });
    }

    // ── Limpa observacao e atualiza status ────────────────────────────────────
    await conn.query(
      `UPDATE ferramentas
          SET status        = 'disponivel',
              observacao    = NULL,
              usuario_id    = NULL,
              usuario_cpf   = NULL,
              usuario_nome  = NULL,
              usuario_area  = NULL,
              data_retirada = NULL
        WHERE id = ?`,
      [id]
    );

    // ── Registra movimentação ─────────────────────────────────────────────────
    await registrarMovimentacao(conn, {
      ferramenta_id:   ferramenta.id,
      ferramenta_nome: ferramenta.nome,
      status_anterior: 'manutencao',
      status_novo:     'disponivel',
      observacao:      `Manutenção concluída. Problema anterior: ${ferramenta.observacao ?? '—'}`,
    });

    await conn.commit();
    return res.json({
      mensagem: `Ferramenta "${ferramenta.nome}" liberada após manutenção.`,
      ferramenta_id: ferramenta.id,
      status: 'disponivel',
    });

  } catch (err) {
    await conn.rollback();
    console.error('[disponibilizar]', err);
    return res.status(err.status ?? 500).json({ erro: err.message ?? 'Erro interno no servidor.' });
  } finally {
    conn.release();
  }
};