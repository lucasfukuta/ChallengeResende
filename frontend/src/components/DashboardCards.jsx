import React from 'react';

/**
 * DashboardCards
 * Exibe quatro cards elegantes de KPIs a partir dos dados consolidados da API.
 */
export default function DashboardCards({ kpis }) {
  // Garantia de valores padrão para evitar quebras se a API demorar a responder
  const {
    totalAtendimentos = 0,
    totalConcluidos = 0,
    totalCancelados = 0,
    receitaTotal = 0,
  } = kpis || {};

  // Formatador de Moeda para Real Brasileiro
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="kpi-grid">
      {/* Card 1: Total de Atendimentos */}
      <div className="kpi-card total">
        <span className="kpi-title">Total de Atendimentos</span>
        <span className="kpi-value">{totalAtendimentos}</span>
        <div className="kpi-footer">
          <span>Base histórica consolidada</span>
        </div>
      </div>

      {/* Card 2: Total Concluídos */}
      <div className="kpi-card concluidos">
        <span className="kpi-title">Concluídos</span>
        <span className="kpi-value">{totalConcluidos}</span>
        <div className="kpi-footer">
          <span>Atendimentos finalizados com sucesso</span>
        </div>
      </div>

      {/* Card 3: Total Cancelados */}
      <div className="kpi-card cancelados">
        <span className="kpi-title">Cancelados</span>
        <span className="kpi-value">{totalCancelados}</span>
        <div className="kpi-footer">
          <span>Atendimentos descontinuados</span>
        </div>
      </div>

      {/* Card 4: Receita Total */}
      <div className="kpi-card receita">
        <span className="kpi-title">Receita Total Realizada</span>
        <span className="kpi-value">{formatCurrency(receitaTotal)}</span>
        <div className="kpi-footer">
          <span>Soma de atendimentos concluídos</span>
        </div>
      </div>
    </div>
  );
}
