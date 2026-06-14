import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardCards from './components/DashboardCards';
import DashboardCharts from './components/DashboardCharts';
import AppointmentTable from './components/AppointmentTable';
import ExportButtons from './components/ExportButtons';

/**
 * App
 * Componente principal (casca estrutural) que gerencia os estados globais,
 * requisições para a API REST e orquestra a exibição dos dados.
 */
export default function App() {
  // Estados para a Listagem de Atendimentos (Tabela)
  const [atendimentos, setAtendimentos] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para as Métricas (KPIs e Gráficos)
  const [metrics, setMetrics] = useState({
    kpis: {},
    porStatus: {},
    evolucaoMensal: [],
  });

  // Estados Visuais (Carregamento e Erros)
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [errorList, setErrorList] = useState(null);
  const [errorMetrics, setErrorMetrics] = useState(null);

  // 1. Efeito para buscar as Métricas Globais (executado uma vez no carregamento inicial)
  useEffect(() => {
    const fetchMetricsData = async () => {
      setLoadingMetrics(true);
      setErrorMetrics(null);
      try {
        const response = await axios.get('/api/atendimentos/metrics');
        setMetrics(response.data);
      } catch (err) {
        console.error('Erro ao buscar métricas:', err);
        setErrorMetrics(
          err.response?.data?.message ||
          'Não foi possível carregar as métricas do painel.'
        );
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetricsData();
  }, []);

  // 2. Efeito para buscar a lista de Atendimentos (executado sempre que a página ou termo de busca mudar)
  useEffect(() => {
    const fetchList = async () => {
      setLoadingList(true);
      setErrorList(null);
      try {
        const response = await axios.get('/api/atendimentos', {
          params: {
            page,
            limit,
            search,
          },
        });
        setAtendimentos(response.data.data || []);
        setTotalItems(response.data.totalItems || 0);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error('Erro ao buscar lista de atendimentos:', err);
        setErrorList(
          err.response?.data?.message ||
          'Não foi possível carregar a lista de atendimentos.'
        );
      } finally {
        setLoadingList(false);
      }
    };

    fetchList();
  }, [page, search, limit]);

  // Função utilitária para tentar recarregar os dados após uma falha
  const handleRetry = () => {
    // Força nova busca das métricas e lista
    window.location.reload();
  };

  return (
    <div className="app-container">
      {/* Cabeçalho Principal */}
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-title-container">
            <div className="app-logo-icon" />
            <h1 className="app-title">Portal Challenge Resende</h1>
          </div>
          <p className="app-subtitle">
            Sistema Integrado de Acompanhamento de Atendimentos e Analytics Jurídico
          </p>
        </div>

        {/* Renderiza botões de exportação baseados em todos os dados que batem com o filtro */}
        {!loadingList && !errorList && totalItems > 0 && (
          <ExportButtons search={search} totalItems={totalItems} />
        )}
      </header>

      {/* Seção 1: KPIs e Indicadores de Negócio */}
      {loadingMetrics ? (
        <div className="state-container">
          <div className="loader-spinner" />
          <span className="state-desc">Carregando métricas e indicadores...</span>
        </div>
      ) : errorMetrics ? (
        <div className="state-container">
          <div className="error-badge">{errorMetrics}</div>
          <button className="btn btn-secondary" onClick={handleRetry}>
            Tentar Novamente
          </button>
        </div>
      ) : (
        <DashboardCards kpis={metrics.kpis} />
      )}

      {/* Seção 2: Gráficos de Análise e Tendências */}
      {!loadingMetrics && !errorMetrics && (
        <DashboardCharts
          porStatus={metrics.porStatus}
          evolucaoMensal={metrics.evolucaoMensal}
        />
      )}

      {/* Seção 3: Tabela de Dados e Interações */}
      {loadingList && page === 1 && atendimentos.length === 0 ? (
        <div className="table-panel">
          <div className="state-container">
            <div className="loader-spinner" />
            <span className="state-desc">Carregando listagem de atendimentos...</span>
          </div>
        </div>
      ) : errorList ? (
        <div className="table-panel">
          <div className="state-container">
            <div className="error-badge">{errorList}</div>
            <button className="btn btn-secondary" onClick={handleRetry}>
              Tentar Novamente
            </button>
          </div>
        </div>
      ) : (
        <AppointmentTable
          atendimentos={atendimentos}
          search={search}
          setSearch={setSearch}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
        />
      )}
    </div>
  );
}
