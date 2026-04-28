const db = require('../banco');

const loginManutentor = async (req, res) => {
  const { cpf, senha, oficina } = req.body;
  try {
    const [result] = await db.query(
      `SELECT * FROM usuarios WHERE cpf = ? AND senha = ? AND tipo = 'manutentor' AND oficina = ?`,
      [cpf, senha, oficina]
    );
    if (result.length > 0) {
      res.json({ sucesso: true, usuario: result[0] });
    } else {
      res.status(401).json({ erro: 'Credenciais inválidas' });
    }
  } catch (err) {
    res.status(500).json({ erro: 'Erro no servidor' });
  }
};

const loginAlmoxarife = async (req, res) => {
  const { cpf, senha } = req.body;
  try {
    const [result] = await db.query(
      `SELECT * FROM usuarios WHERE cpf = ? AND senha = ? AND tipo = 'almoxarife'`,
      [cpf, senha]
    );
    if (result.length > 0) {
      res.json({ sucesso: true, usuario: result[0] });
    } else {
      res.status(401).json({ erro: 'Credenciais inválidas' });
    }
  } catch (err) {
    res.status(500).json({ erro: 'Erro no servidor' });
  }
};

module.exports = { loginManutentor, loginAlmoxarife };