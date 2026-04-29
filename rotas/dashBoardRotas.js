const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/dashboardController');

// GET /api/dashboard?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
router.get('/dashboard', ctrl.getDashboard);

module.exports = router;