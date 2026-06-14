import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend
} from 'recharts';

/**
 * DashboardCharts
 * Renderiza gráficos modernos para Status e Evolução Mensal.
 */
export default function DashboardCharts({ porStatus, evolucaoMensal }) {
  
  // 1. Processar dados para o Gráfico de Barras por Status
  const statusData = Object.keys(porStatus || {}).map((status) => ({
    name: status,
    quantidade: porStatus[status]
  }));

  // Cores dinâmicas com base no status do atendimento
  const getStatusColor = (name) => {
    switch (name) {
      case 'Concluído':
        return '#10b981'; // Emerald Green
      case 'Cancelado':
        return '#ef4444'; // Coral Red
      case 'Em Andamento':
        return '#f59e0b'; // Amber Yellow
      default:
        return '#4f46e5'; // Indigo default
    }
  };

  // 2. Processar e formatar meses para a Evolução Mensal
  const formatMonthLabel = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthIndex = parseInt(month, 10) - 1;
    return `${months[monthIndex]}/${year.substring(2)}`;
  };

  const monthlyData = (evolucaoMensal || []).map((item) => ({
    ...item,
    label: formatMonthLabel(item.mes),
    // Valor monetário formatado para exibição amigável no Tooltip
    receitaFormatada: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(item.receita)
  }));

  // Estilo de Tooltip customizado para encaixar no tema escuro
  const customTooltipStyle = {
    backgroundColor: '#161d31',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: '#f3f4f6',
    fontFamily: "'Outfit', sans-serif"
  };

  return (
    <div className="charts-grid">
      {/* Gráfico 1: Distribuição por Status (Pizza/Donut) */}
      <div className="chart-card">
        <div className="chart-header">
          <span className="chart-title">Distribuição por Status</span>
        </div>
        <div className="chart-container">
          {statusData.length === 0 ? (
            <div className="state-container">
              <span className="state-desc">Sem dados de status disponíveis.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  iconType="circle"
                />
                <Pie
                  data={statusData}
                  dataKey="quantidade"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getStatusColor(entry.name)} 
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Gráfico 2: Evolução Mensal (Linha) */}
      <div className="chart-card">
        <div className="chart-header">
          <span className="chart-title">Evolução Mensal</span>
        </div>
        <div className="chart-container">
          {monthlyData.length === 0 ? (
            <div className="state-container">
              <span className="state-desc">Sem dados de evolução mensal.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                <XAxis 
                  dataKey="label" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  allowDecimals={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={customTooltipStyle}
                  formatter={(value, name) => {
                    if (name === 'receita') {
                      return [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Receita'];
                    }
                    return [value, 'Atendimentos'];
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  iconType="circle"
                />
                {/* Linha 1: Quantidade de Atendimentos */}
                <Line
                  type="monotone"
                  dataKey="atendimentos"
                  name="Quantidade"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  dot={{ strokeWidth: 2, r: 4 }}
                />
                {/* Linha 2: Receita */}
                <Line
                  type="monotone"
                  dataKey="receita"
                  name="receita"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ strokeWidth: 1, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
