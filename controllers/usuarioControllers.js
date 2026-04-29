const db = require('../banco');
const bcrypt = require('bcrypt');

// ── Login Manutentor ──────────────────────────────────────────────────────────
async function loginManutentor(req, res) {
  const { cpf, senha, oficina } = req.body;

  if (!cpf || !senha || !oficina) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE cpf = ? AND tipo = "manutentor" AND oficina = ?',
      [cpf, oficina]
    );

    if (!rows.length) {
      return res.status(401).json({ erro: 'CPF, senha ou oficina incorretos.' });
    }

    const usuario = rows[0];
   const senhaOk = senha === usuario.senha;

    if (!senhaOk) {
      return res.status(401).json({ erro: 'CPF, senha ou oficina incorretos.' });
    }

    res.json({
      usuario: {
        id:      usuario.id,
        nome:    usuario.nome,
        cpf:     usuario.cpf,
        tipo:    usuario.tipo,
        oficina: usuario.oficina,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ── Login Almoxarife ──────────────────────────────────────────────────────────
async function loginAlmoxarife(req, res) {
  const { cpf, senha } = req.body;

  if (!cpf || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE cpf = ? AND tipo = "almoxarife"',
      [cpf]
    );

    if (!rows.length) {
      return res.status(401).json({ erro: 'CPF ou senha incorretos.' });
    }

    const usuario = rows[0];
   const senhaOk = senha === usuario.senha;

    if (!senhaOk) {
      return res.status(401).json({ erro: 'CPF ou senha incorretos.' });
    }

    res.json({
      usuario: {
        id:      usuario.id,
        nome:    usuario.nome,
        cpf:     usuario.cpf,
        tipo:    usuario.tipo,
        oficina: usuario.oficina,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ── Buscar usuário por CPF ────────────────────────────────────────────────────
// Aceita CPF com ou sem máscara: normaliza para XXX.XXX.XXX-XX antes de buscar
async function buscarPorCpf(req, res) {
  let cpf = req.params.cpf;

  // Remove tudo que não for dígito
  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) {
    return res.status(400).json({ erro: 'CPF inválido.' });
  }

  // Formata igual ao padrão salvo no banco: XXX.XXX.XXX-XX
  const cpfFormatado = digits.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );

  try {
    // Tenta com formatado e sem formatação para cobrir os dois casos
    const [rows] = await db.query(
      'SELECT nome, oficina AS area FROM usuarios WHERE cpf = ? OR cpf = ?',
      [cpfFormatado, digits]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
}

module.exports = { loginManutentor, loginAlmoxarife, buscarPorCpf };