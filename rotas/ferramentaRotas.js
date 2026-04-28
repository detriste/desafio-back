const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ferramentaController');

router.get('/ferramentas', ctrl.listarFerramentas);
router.get('/ferramentas/:codigo', ctrl.buscarPorCodigo);

module.exports = router;