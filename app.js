const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', require('./rotas/usuarioRota'));
app.use('/api', require('./rotas/statusRotas'));
app.use('/api', require('./rotas/atencaoRotas'));    // ← antes de ferramentaRotas
app.use('/api', require('./rotas/Trocasrotas'));
app.use('/api', require('./rotas/ferramentaRotas')); // ← por último

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});