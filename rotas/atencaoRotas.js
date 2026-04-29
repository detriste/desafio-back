const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/atencaoController');

router.post('/ferramentas/:id/atencao', ctrl.registrarAtencao);
router.get('/ferramentas/:id/atencoes', ctrl.listarAtencoes);

module.exports = router;