const express = require('express');
const cors = require('cors');
const app = express();

const usuarioRotas = require('./rotas/usuarioRota');
const proRotas = require('./rotas/proRotas');

app.use(cors());
app.use(express.json());

app.use(usuarioRotas);
app.use(proRotas);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});