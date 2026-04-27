const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:8100', // porta padrão do Ionic
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const usuarioRotas = require('./rotas/usuarioRota');
const proRotas = require('./rotas/proRotas');

app.use('/api', usuarioRotas);
app.use('/api', proRotas);

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});