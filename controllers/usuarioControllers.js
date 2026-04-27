const db = require('../banco');

// 🔧 Manutentor
const loginManutentor = (req, res) => {
  const { cpf, senha, oficina } = req.body;

  const sql = `
    SELECT * FROM usuarios
    WHERE cpf = ? AND senha = ? AND tipo = 'manutentor' AND oficina = ?
  `;

  db.query(sql, [cpf, senha, oficina], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      res.json({ sucesso: true, usuario: result[0] });
    } else {
      res.status(401).json({ erro: 'Credenciais inválidas' });
    }
  });
};

// 📦 Almoxarife
const loginAlmoxarife = (req, res) => {
  const { cpf, senha } = req.body;

  const sql = `
    SELECT * FROM usuarios
    WHERE cpf = ? AND senha = ? AND tipo = 'almoxarife'
  `;

  db.query(sql, [cpf, senha], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      res.json({ sucesso: true, usuario: result[0] });
    } else {
      res.status(401).json({ erro: 'Credenciais inválidas' });
    }
  });
};

module.exports = {
  loginManutentor,
  loginAlmoxarife
};