const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/dashboardController');

// GET /api/dashboard?inicio=2024-01-01&fim=2024-12-31
router.get('/dashboard', ctrl.getDashboard);

module.exports = router;