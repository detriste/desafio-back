const bcrypt = require('bcrypt');
const db = require('../banco');

exports.cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha)
      return res.status(400).json({ erro: 'Preencha todos os campos' });

    const senhaHash = await bcrypt.hash(senha, 10);
    await db.query('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senhaHash]);
    return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ erro: 'Este email já está cadastrado' });
    console.error(error);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
};

exports.loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ erro: 'Preencha todos os campos' });

    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ erro: 'Email ou senha inválidos' });

    const usuario = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta)
      return res.status(401).json({ erro: 'Email ou senha inválidos' });

    // Retorna o nome para o frontend salvar no localStorage
    return res.status(200).json({ mensagem: `Bem-vindo, ${usuario.nome}!`, nome: usuario.nome });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
};