const db = require('../banco');

async function loginManutentor(req, res) {
  const { cracha, senha, oficina } = req.body;
  if (!cracha || !senha || !oficina)
    return res.status(400).json({ erro: 'Preencha todos os campos.' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE cracha = ? AND tipo = "manutentor" AND oficina = ?',
      [cracha, oficina]
    );
    if (!rows.length) return res.status(401).json({ erro: 'Crachá, senha ou oficina incorretos.' });
    const usuario = rows[0];
    if (senha !== usuario.senha) return res.status(401).json({ erro: 'Crachá, senha ou oficina incorretos.' });

    res.json({ usuario: { id: usuario.id, nome: usuario.nome, cracha: usuario.cracha, tipo: usuario.tipo, oficina: usuario.oficina } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
}

async function loginAlmoxarife(req, res) {
  const { cracha, senha } = req.body;
  if (!cracha || !senha)
    return res.status(400).json({ erro: 'Preencha todos os campos.' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE cracha = ? AND tipo = "almoxarife"',
      [cracha]
    );
    if (!rows.length) return res.status(401).json({ erro: 'Crachá ou senha incorretos.' });
    const usuario = rows[0];
    if (senha !== usuario.senha) return res.status(401).json({ erro: 'Crachá ou senha incorretos.' });

    res.json({ usuario: { id: usuario.id, nome: usuario.nome, cracha: usuario.cracha, tipo: usuario.tipo, oficina: usuario.oficina } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
}

async function buscarPorCracha(req, res) {
  const cracha = req.params.cracha?.trim();
  if (!cracha || cracha.length > 4)
    return res.status(400).json({ erro: 'Crachá inválido.' });

  try {
    const [rows] = await db.query(
      'SELECT nome, oficina AS area FROM usuarios WHERE cracha = ?',
      [cracha]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
}

module.exports = { loginManutentor, loginAlmoxarife, buscarPorCracha };