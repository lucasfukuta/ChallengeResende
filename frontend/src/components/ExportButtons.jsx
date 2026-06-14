import React, { useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * ExportButtons
 * Renderiza dois botões para exportação dos dados filtrados que batem com a busca
 * nos formatos CSV e PDF.
 */
export default function ExportButtons({ search = '', totalItems = 0 }) {
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Busca todos os registros correspondentes ao filtro atual sem limite de paginação
  const fetchAllMatching = async () => {
    try {
      const response = await axios.get('/api/atendimentos', {
        params: {
          page: 1,
          limit: 999999,
          search,
        },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar dados para exportação:', error);
      alert('Não foi possível obter todos os dados filtrados para a exportação.');
      return [];
    }
  };

  // 1. Exportar para CSV programaticamente
  const handleExportCSV = async () => {
    if (totalItems === 0) return;
    setIsExportingCSV(true);
    const dataToExport = await fetchAllMatching();
    setIsExportingCSV(false);

    if (dataToExport.length === 0) return;

    const headers = ['Cliente', 'Data', 'Advogado', 'Área Jurídica', 'Status', 'Valor (R$)'];
    
    const rows = dataToExport.map((item) => [
      item.cliente,
      // Converte YYYY-MM-DD para DD/MM/YYYY
      item.data ? item.data.split('-').reverse().join('/') : '',
      item.advogado,
      item.areaJuridica,
      item.status,
      item.valor,
    ]);

    // Concatena as linhas formatando valores com aspas para evitar quebras por vírgulas internas
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // Blob UTF-8 com BOM para garantir compatibilidade de caracteres acentuados no Excel
    const blob = new Blob(
      [new Uint8Array([0xef, 0xbb, 0xbf]), csvContent],
      { type: 'text/csv;charset=utf-8;' }
    );
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const dateStr = new Date().toISOString().substring(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `atendimentos_filtrados_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Exportar para PDF usando jsPDF e jsPDF-autotable
  const handleExportPDF = async () => {
    if (totalItems === 0) return;
    setIsExportingPDF(true);
    const dataToExport = await fetchAllMatching();
    setIsExportingPDF(false);

    if (dataToExport.length === 0) return;

    const doc = new jsPDF();
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('pt-BR');
    const formattedTime = currentDate.toLocaleTimeString('pt-BR');

    // Configurações do Cabeçalho do PDF
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // Cor primária (Indigo)
    doc.text('Relatório de Atendimentos Jurídicos', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate Gray
    doc.text(`Gerado em: ${formattedDate} às ${formattedTime}`, 14, 27);
    doc.text(`Filtros ativos - Exibindo todos os ${dataToExport.length} registro(s) encontrados.`, 14, 33);

    // Definição das colunas e mapeamento dos dados
    const tableColumn = ['Cliente', 'Data', 'Advogado', 'Área Jurídica', 'Status', 'Valor'];
    const tableRows = dataToExport.map((item) => [
      item.cliente,
      item.data ? item.data.split('-').reverse().join('/') : '',
      item.advogado,
      item.areaJuridica,
      item.status,
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor),
    ]);

    // Renderiza a tabela usando o plugin autotable
    doc.autoTable({
      startY: 38,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229], // Background Indigo
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left',
      },
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        5: { halign: 'right', fontStyle: 'bold' }, // Coluna do valor alinhada à direita
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Fundo sutil nas linhas alternadas
      },
    });

    const dateStr = currentDate.toISOString().substring(0, 10);
    doc.save(`relatorio_atendimentos_${dateStr}.pdf`);
  };

  return (
    <div className="actions-block">
      <button
        className="btn btn-secondary"
        onClick={handleExportCSV}
        disabled={totalItems === 0 || isExportingCSV || isExportingPDF}
        title="Exportar todos os resultados do filtro para CSV"
      >
        {isExportingCSV ? (
          <span className="loader-spinner mini" style={{ marginRight: '6px' }} />
        ) : (
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            ></path>
          </svg>
        )}
        {isExportingCSV ? 'Exportando...' : 'Exportar CSV'}
      </button>
      <button
        className="btn btn-primary"
        onClick={handleExportPDF}
        disabled={totalItems === 0 || isExportingCSV || isExportingPDF}
        title="Exportar todos os resultados do filtro para PDF"
      >
        {isExportingPDF ? (
          <span className="loader-spinner mini" style={{ marginRight: '6px' }} />
        ) : (
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
        )}
        {isExportingPDF ? 'Exportando...' : 'Exportar PDF'}
      </button>
    </div>
  );
}
