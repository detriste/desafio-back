const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/solicitacaoRetiradaController');

router.get('/solicitacoes/pendentes',    ctrl.listarPendentes);
router.post('/solicitacoes/solicitar',   ctrl.solicitar);
router.post('/solicitacoes/:id/aprovar', ctrl.aprovar);
router.post('/solicitacoes/:id/recusar', ctrl.recusar);

module.exports = router;