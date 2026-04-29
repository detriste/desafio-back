const express = require('express');
const cors    = require('cors');

const app = express();

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.use('/api', require('./rotas/usuarioRota'));
app.use('/api', require('./rotas/ferramentaRotas'));
app.use('/api', require('./rotas/trocasrotas'));      // ✅ nome em minúsculo (era 'Trocasrotas')
app.use('/api', require('./rotas/statusRotas'));
app.use('/api', require('./rotas/dashboardRotas'));   // ✅ nova rota do dashboard

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});