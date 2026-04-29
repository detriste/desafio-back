const express = require('express');
const router = express.Router();

const { loginManutentor, loginAlmoxarife, buscarPorCracha } = require('../controllers/usuarioControllers');

router.post('/login/manutentor', loginManutentor);
router.post('/login/almoxarife', loginAlmoxarife);
router.get('/usuarios/cracha/:cracha', buscarPorCracha);

module.exports = router;