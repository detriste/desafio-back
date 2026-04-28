const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/statusController');

// disponivel → em_uso
router.post('/ferramentas/:id/retirar',       ctrl.retirar);

// em_uso → disponivel
router.post('/ferramentas/:id/devolver',      ctrl.devolver);

// disponivel | em_uso → manutencao
router.post('/ferramentas/:id/manutencao',    ctrl.enviarManutencao);

// manutencao → disponivel
router.post('/ferramentas/:id/disponibilizar', ctrl.disponibilizar);

module.exports = router;