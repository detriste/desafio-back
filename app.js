const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// importar rota
const usuarioRotas = require('./rotas/usuarioRota');

// usar rota
app.use('/api', usuarioRotas);

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});