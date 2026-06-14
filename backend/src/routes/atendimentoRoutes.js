const express = require('express');
const router = express.Router();
const { listAtendimentos, getMetrics } = require('../controllers/atendimentoController');

// Define as rotas associadas aos respectivos controladores
router.get('/atendimentos', listAtendimentos);
router.get('/atendimentos/metrics', getMetrics);

module.exports = router;
