const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');
const atendimentoRoutes = require('./routes/atendimentoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares essenciais
app.use(cors({
  origin: '*', // Permite requisições de qualquer origem para facilitar o desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Documentação Swagger na rota /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Vincula as rotas da API com o prefixo /api
app.use('/api', atendimentoRoutes);

// Rota de status/healthcheck para validação
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API do Challenge Resende está online e operante.',
    timestamp: new Date()
  });
});

// Inicializa o escutador do servidor
app.listen(PORT, () => {
  console.log(`[Server] Rodando em http://localhost:${PORT}`);
  console.log(`[Swagger] Documentação disponível em http://localhost:${PORT}/api-docs`);
});

module.exports = app; // Exportado para facilitar testes de integração se necessário
