const express = require('express');
const router = express.Router();

const {
  loginManutentor,
  loginAlmoxarife,
  buscarPorCpf
} = require('../controllers/usuarioControllers');

// rotas
router.post('/login/manutentor', loginManutentor);
router.post('/login/almoxarife', loginAlmoxarife);
router.get('/usuarios/cpf/:cpf', buscarPorCpf);

module.exports = router;