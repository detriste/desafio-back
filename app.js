const express = require('express');
const cors    = require('cors');

const app = express();

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rotas existentes ──────────────────────────────────────────────────────────
app.use('/api', require('./rotas/usuarioRota'));
app.use('/api', require('./rotas/ferramentaRotas'));      // GET /ferramentas, GET /ferramentas/:codigo
app.use('/api', require('./rotas/Trocasrotas'));

// ── Novas rotas de controle de status ────────────────────────────────────────
app.use('/api', require('./rotas/statusRotas'));
// POST /api/ferramentas/:id/retirar
// POST /api/ferramentas/:id/devolver
// POST /api/ferramentas/:id/manutencao
// POST /api/ferramentas/:id/disponibilizar


app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});