const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const excelFilePath = path.join(__dirname, 'data', 'Schedule', 'agendamento_202606121322_formatado.xlsx');
const jsonOutputPath = path.join(__dirname, 'data', 'atendimentos.json');

/**
 * Converte um valor de data do Excel (serial ou string formatada M/D/YY) para YYYY-MM-DD
 */
function parseExcelDate(excelValue) {
  if (typeof excelValue === 'number') {
    // Converte data serial do Excel para data JS
    const date = new Date(Math.round((excelValue - 25569) * 86400 * 1000));
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (typeof excelValue === 'string') {
    // Se for string formato M/D/YY (ex: "4/9/21")
    const parts = excelValue.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) {
        year = '20' + year; // assume século 21
      }
      return `${year}-${month}-${day}`;
    }
    return excelValue.trim();
  }
  return '';
}

/**
 * Formata um nome em Title Case seguindo as regras de preposições em português
 */
function formatToTitleCase(nameStr) {
  if (!nameStr) return '';
  return nameStr
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      const prepositions = ['de', 'da', 'do', 'das', 'dos', 'e', 'em'];
      if (prepositions.includes(word) && index > 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Limpa a organização extraindo apenas a sigla curta (acrônimo) antes do hífen
 */
function cleanOrganization(orgStr) {
  if (!orgStr || orgStr === 'undefined') return 'Geral';
  const parts = orgStr.split(' - ');
  return parts[0].trim();
}

/**
 * Converte um valor de hora (objeto Date, string ou fração de dia) em minutos desde a meia-noite
 */
function parseTimeToMinutes(timeVal) {
  if (timeVal instanceof Date) {
    return timeVal.getHours() * 60 + timeVal.getMinutes();
  }
  if (typeof timeVal === 'string') {
    const parts = timeVal.trim().split(':');
    if (parts.length >= 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
  }
  if (typeof timeVal === 'number') {
    return Math.round(timeVal * 24 * 60);
  }
  return null;
}

/**
 * Normaliza o nome do advogado para busca case-insensitive e sem acentos
 */
function normalizeName(nameStr) {
  if (!nameStr) return '';
  return nameStr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Tabela de valores cobrados por hora (60 minutos) por cada advogado
const AdvogadoRates = {
  'fernanda nascimento silveira vargas': 800,
  'marina menezes vinhaes': 750,
  'gabriel athaydes bodan': 700,
  'livia de oliveira queiroz': 680,
  'hanna gabriella martins de albuquerque': 650,
  'ana carolina araujo carolino': 620,
  'raphaela silva freitas': 600,
  'soraia cristina sombra de oliveira': 580,
  'larissa cristina amaral': 550
};

/**
 * Executa o fluxo de conversão e limpeza dos dados
 */
function runConversion() {
  try {
    console.log(`Lendo planilha em: ${excelFilePath}`);

    // CORREÇÃO: cellDates: true faz o xlsx transformar as datas/horas do Excel em objetos Date do JS
    const workbook = xlsx.readFile(excelFilePath, { cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Lê os dados como objetos brutos
    const rows = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Planilha lida com sucesso. Total de linhas: ${rows.length}`);

    // Mapeamento e Limpeza dos registros
    const atendimentosLimpos = rows.map((row) => {
      const id = parseInt(row['Código do agendamento'], 10) || Math.floor(Math.random() * 100000);

      // Mapeia o status baseado no campo "Agendamento realizado"
      let status = 'Em Andamento';
      if (row['Agendamento realizado'] === 'Sim') {
        status = 'Concluído';
      } else if (row['Agendamento realizado'] === 'Não') {
        status = 'Cancelado';
      }

      // --- TRATAMENTO CORRETO DA DATA ---
      let dataFormatada = '';
      const dataRaw = row['Data do agendamento'];
      if (dataRaw instanceof Date) {
        // Se a biblioteca converteu para Date, isolamos o YYYY-MM-DD ignorando o fuso horário
        const yyyy = dataRaw.getFullYear();
        const mm = String(dataRaw.getMonth() + 1).padStart(2, '0');
        const dd = String(dataRaw.getDate()).padStart(2, '0');
        dataFormatada = `${yyyy}-${mm}-${dd}`;
      } else {
        // Fallback caso venha como String pura
        dataFormatada = parseExcelDate(dataRaw);
      }

      // --- TRATAMENTO CORRETO DA HORA ---
      let horaFormatada = '09:00';
      const horaRaw = row['Hora início'];
      if (horaRaw instanceof Date) {
        // Se veio como objeto Date, extraímos as horas e minutos corretamente
        const horas = String(horaRaw.getHours()).padStart(2, '0');
        const minutos = String(horaRaw.getMinutes()).padStart(2, '0');
        horaFormatada = `${horas}:${minutos}`;
      } else if (typeof horaRaw === 'string') {
        horaFormatada = horaRaw.trim();
      } else if (typeof horaRaw === 'number') {
        // Fallback matemático caso o Excel envie a fração do dia (ex: 0.375 para 09:00)
        const totalMinutos = Math.round(horaRaw * 24 * 60);
        const horas = String(Math.floor(totalMinutos / 60)).padStart(2, '0');
        const minutos = String(totalMinutos % 60).padStart(2, '0');
        horaFormatada = `${horas}:${minutos}`;
      }

      // --- CÁLCULO FINANCEIRO DINÂMICO ---
      // Obter a duração do atendimento em minutos
      const startMin = parseTimeToMinutes(row['Hora início']);
      const endMin = parseTimeToMinutes(row['Hora fim']);
      let durationMinutes = 40; // Fallback se a leitura falhar
      if (startMin !== null && endMin !== null) {
        durationMinutes = endMin - startMin;
      }
      if (durationMinutes <= 0) {
        durationMinutes = 40; // Fallback para atendimentos sem duração válida
      }

      // Determinar o valor da hora cobrada pelo advogado responsável
      const normAdvogado = normalizeName(row['Responsável pelo agendamento']);
      const hourlyRate = AdvogadoRates[normAdvogado] || 600; // default R$ 600/h se não cadastrado
      
      // O valor é proporcional ao tempo de atendimento em minutos
      const valor = parseFloat(((durationMinutes / 60) * hourlyRate).toFixed(2));

      return {
        id,
        cliente: formatToTitleCase(row['Nome do assistido']),
        advogado: formatToTitleCase(row['Responsável pelo agendamento']),
        areaJuridica: cleanOrganization(row['Organização']),
        data: dataFormatada,
        hora: horaFormatada,
        status,
        valor
      };
    });

    console.log(`Mapeamento concluído. Salvando dados limpos em: ${jsonOutputPath}`);
    fs.writeFileSync(jsonOutputPath, JSON.stringify(atendimentosLimpos, null, 2), 'utf-8');

    console.log('Conversão realizada com sucesso!');
    console.log(`Dados gravados: ${atendimentosLimpos.length} atendimentos.`);
  } catch (error) {
    console.error('Erro durante a conversão do arquivo:', error);
    process.exit(1);
  }
}

runConversion();
