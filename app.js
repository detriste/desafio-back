const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares PRIMEIRO
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', require('./rotas/usuarioRota'));
app.use('/api', require('./rotas/ferramentaRotas'));

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});