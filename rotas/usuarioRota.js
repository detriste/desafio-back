const express = require('express');
const router = express.Router();

const {
  loginManutentor,
  loginAlmoxarife
} = require('../controllers/usuarioControllers');

// rotas
router.post('/login/manutentor', loginManutentor);
router.post('/login/almoxarife', loginAlmoxarife);

module.exports = router;