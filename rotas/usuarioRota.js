const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioControllers');

router.post('/usuarios', usuarioController.cadastrarUsuario);
router.post('/login', usuarioController.loginUsuario);

module.exports = router;