const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/trocasController'); // ✅ corrigido (era '/../controllers/...')

router.get('/trocas/pendentes',    ctrl.listarPendentes);
router.post('/trocas/solicitar',   ctrl.solicitar);
router.post('/trocas/:id/aceitar', ctrl.aceitar);
router.post('/trocas/:id/recusar', ctrl.recusar);

module.exports = router;