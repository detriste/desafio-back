const db = require('../banco');

exports.listarFerramentas = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ferramentas ORDER BY nome ASC');
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
};

exports.buscarPorCodigo = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM ferramentas WHERE codigo = ?', [req.params.codigo]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Ferramenta não encontrada' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
};