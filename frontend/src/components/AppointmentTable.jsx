import React, { useState, useEffect } from 'react';

/**
 * AppointmentTable
 * Exibe a lista de atendimentos em uma tabela responsiva com busca e paginação funcionais.
 */
export default function AppointmentTable({
  atendimentos = [],
  search,
  setSearch,
  page,
  setPage,
  totalPages,
  totalItems,
  limit,
}) {
  // Estado local para a barra de busca (permite aplicar o debounce)
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce: Atualiza o termo de busca no estado global após 350ms do último caractere digitado
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
      setPage(1); // Sempre reinicia para a página 1 ao fazer uma nova busca
    }, 350);

    return () => clearTimeout(handler);
  }, [localSearch, setSearch, setPage]);

  // Função para formatar a data de AAAA-MM-DD para DD/MM/AAAA
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };



  // Função para mapear o status para a classe CSS correta do badge
  const getBadgeClass = (status) => {
    switch (status) {
      case 'Concluído':
        return 'badge badge-concluido';
      case 'Cancelado':
        return 'badge badge-cancelado';
      case 'Em Andamento':
        return 'badge badge-andamento';
      default:
        return 'badge';
    }
  };

  // Formatador de Moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="table-panel">
      {/* Cabeçalho da Tabela e Barra de Busca */}
      <div className="table-header-actions">
        <div className="search-wrapper">
          {/* Ícone de busca manual em SVG */}
          <svg
            className="search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Pesquisar por cliente, advogado ou área jurídica..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        
        <div className="pagination-info">
          Encontrados: <span>{totalItems}</span> atendimentos
        </div>
      </div>

      {/* Tabela Responsiva */}
      <div className="table-responsive">
        {atendimentos.length === 0 ? (
          <div className="state-container">
            <span className="state-title">Nenhum registro encontrado</span>
            <span className="state-desc">
              Não encontramos nenhum atendimento que corresponda à sua pesquisa ou filtro atual.
            </span>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Advogado</th>
                <th>Área Jurídica</th>
                <th>Status</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {atendimentos.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-highlight)' }}>
                    {item.cliente}
                  </td>
                  <td>{formatDate(item.data)}</td>
                  <td>{item.hora || '-'}</td>
                  <td>{item.advogado}</td>
                  <td>{item.areaJuridica}</td>
                  <td>
                    <span className={getBadgeClass(item.status)}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {formatCurrency(item.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Página <span>{page}</span> de <span>{totalPages}</span>
          </div>
          <div className="pagination-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
