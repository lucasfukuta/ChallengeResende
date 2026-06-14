const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', '..', 'data', 'atendimentos.json');

/**
 * Lê e decodifica a base de dados mock (arquivo JSON).
 */
const getAtendimentosData = () => {
  try {
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Erro ao acessar o arquivo de atendimentos:', error);
    throw new Error('Falha na leitura do banco de dados mock.');
  }
};

/**
 * GET /atendimentos
 * Listagem paginada e com filtro de pesquisa textual (cliente, advogado, área jurídica).
 */
const listAtendimentos = (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    const allAtendimentos = getAtendimentosData();
    let filteredAtendimentos = allAtendimentos;

    // Filtro de busca textual em tempo real
    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filteredAtendimentos = allAtendimentos.filter((item) => {
        const clienteMatch = item.cliente && String(item.cliente).toLowerCase().includes(searchTerm);
        const advogadoMatch = item.advogado && String(item.advogado).toLowerCase().includes(searchTerm);
        const areaMatch = item.areaJuridica && String(item.areaJuridica).toLowerCase().includes(searchTerm);

        return clienteMatch || advogadoMatch || areaMatch;
      });
    }

    const totalItems = filteredAtendimentos.length;
    const totalPages = Math.ceil(totalItems / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = filteredAtendimentos.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      totalItems,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      data: paginatedItems
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

/**
 * GET /atendimentos/metrics
 * Métricas e KPIs da base completa de atendimentos para os gráficos.
 */
const getMetrics = (req, res) => {
  try {
    const allAtendimentos = getAtendimentosData();

    if (!allAtendimentos || allAtendimentos.length === 0) {
      return res.status(200).json({
        kpis: {
          totalAtendimentos: 0,
          totalConcluidos: 0,
          totalCancelados: 0,
          receitaTotal: 0
        },
        porStatus: {},
        evolucaoMensal: []
      });
    }

    // Cálculos de KPIs Básicos
    const totalAtendimentos = allAtendimentos.length;
    let totalConcluidos = 0;
    let totalCancelados = 0;
    let receitaTotal = 0;

    // Distribuição por Status
    const statusMap = {};

    // Agrupamento por Evolução Mensal
    const monthlyMap = {};

    allAtendimentos.forEach((item) => {
      // KPIs
      if (item.status === 'Concluído') {
        totalConcluidos++;
        receitaTotal += (item.valor || 0);
      } else if (item.status === 'Cancelado') {
        totalCancelados++;
      }

      // Distribuição por Status
      const status = item.status || 'Não Definido';
      statusMap[status] = (statusMap[status] || 0) + 1;

      // Evolução Mensal (usa o padrão YYYY-MM para ordenação e agrupamento)
      if (item.data) {
        const monthKey = item.data.substring(0, 7); // Ex: "2026-05"
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = {
            atendimentos: 0,
            receita: 0
          };
        }
        monthlyMap[monthKey].atendimentos++;
        if (item.status === 'Concluído') {
          monthlyMap[monthKey].receita += (item.valor || 0);
        }
      }
    });

    // Formatar e ordenar a Evolução Mensal cronologicamente
    const evolucaoMensal = Object.keys(monthlyMap)
      .sort()
      .map((mes) => ({
        mes, // Ex: "2026-01"
        atendimentos: monthlyMap[mes].atendimentos,
        receita: parseFloat(monthlyMap[mes].receita.toFixed(2))
      }));

    return res.status(200).json({
      kpis: {
        totalAtendimentos,
        totalConcluidos,
        totalCancelados,
        receitaTotal: parseFloat(receitaTotal.toFixed(2))
      },
      porStatus: statusMap,
      evolucaoMensal
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

module.exports = {
  listAtendimentos,
  getMetrics
};
