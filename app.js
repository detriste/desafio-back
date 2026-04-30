const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// ── Rotas API ─────────────────────────────────────────
app.use('/api', require('./rotas/usuarioRota'));
app.use('/api', require('./rotas/ferramentaRotas'));
app.use('/api', require('./rotas/Trocasrotas'));
app.use('/api', require('./rotas/atencaoRotas'));
app.use('/api', require('./rotas/dashBoardRotas'));
app.use('/api', require('./rotas/solicitacaoRotas'));
app.use('/api', require('./rotas/statusRotas'));

// ── FRONT (Angular build) ─────────────────────────────
app.use(express.static(path.join(__dirname, 'www')));

app.use(express.static(path.join(__dirname, 'www')));

// fallback Angular
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'www/index.html'));
});

// ── START ─────────────────────────────────────────────
app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor rodando em 3000');
});