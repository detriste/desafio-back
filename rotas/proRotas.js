const express = require('express');
const router = express.Router();
const proController = require('../controllers/proControllers');

router.get('/produtos', proController.listarProdutos);
router.post('/produtos', proController.cadastrarProduto);
router.put('/produtos/:id', proController.editarProduto);
router.delete('/produtos/:id', proController.excluirProduto);

module.exports = router;