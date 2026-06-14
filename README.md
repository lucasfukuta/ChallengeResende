# Challenge Resende - API de Atendimentos Jurídicos

Este projeto consiste em uma API REST desenvolvida em Node.js com Express para gerenciamento de atendimentos jurídicos e exibição de KPIs e métricas consolidadas em gráficos. Esta API foi construída como o backend de um teste técnico para Desenvolvedor Full Stack Júnior.

---

## Tecnologias e Dependências do Backend

Abaixo estão listadas as dependências utilizadas no backend e a justificativa técnica para a escolha de cada uma:

* **[Express](https://expressjs.com/) (v4.19.2):**
  * *Justificativa:* Framework minimalista, rápido e extremamente flexível para Node.js. Facilita a definição de rotas, manipulação de requisições e respostas HTTP de forma robusta e com pouca sobrecarga (overhead).
* **[CORS](https://www.npmjs.com/package/cors) (v2.8.5):**
  * *Justificativa:* Middleware necessário para habilitar o Compartilhamento de Recursos de Origem Cruzada (Cross-Origin Resource Sharing). Garante que a API possa receber requisições assíncronas (como Fetch ou Axios) vindas de diferentes domínios e portas (ex: o servidor de desenvolvimento do frontend).
* **[Nodemon](https://nodemon.io/) (v3.1.0) *[DevDependency]*:**
  * *Justificativa:* Ferramenta de produtividade que monitora alterações nos arquivos de código-fonte e reinicia o servidor automaticamente. Evita a necessidade de parar e reiniciar o processo do Node manualmente a cada edição de código.

---

## Decisões de Arquitetura

O backend foi estruturado seguindo o padrão MVC (focado em *Model-View-Controller*, simplificado aqui para *Routes e Controllers* devido ao escopo da API):

1. **Rotas Isoladas (`backend/src/routes/`):**
   * Desacopla a definição dos endpoints da lógica de negócio. O mapeamento das rotas HTTP é concentrado no arquivo `atendimentoRoutes.js` e plugado na aplicação sob o prefixo `/api`.
2. **Controladores (`backend/src/controllers/`):**
   * Toda a lógica de filtragem, paginação, agregação de dados e formatação das respostas está contida no arquivo `atendimentoController.js`. Isso garante código modular e de fácil manutenção e testes.
3. **Persistência Simulada via JSON (`backend/data/`):**
   * Para evitar a complexidade desnecessária de um banco de dados real em um escopo de teste júnior, foi adotado um banco mock baseado no arquivo `atendimentos.json`. A API lê de forma síncrona o arquivo JSON na memória, filtra/agrega conforme a requisição e devolve os dados.

---

## Instalação e Execução Local

### Pré-requisitos
* Ter o **Node.js** (versão 16.x ou superior) instalado.
* Ter o **npm** ou **yarn** instalado.

### Passo a Passo

1. **Acessar a pasta do backend:**
   ```bash
   cd backend
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```
   *(Caso esteja no Windows PowerShell e enfrente restrições de script com npm, execute `npm.cmd install`)*.

3. **Executar em modo de desenvolvimento (com Nodemon):**
   ```bash
   npm run dev
   ```
   O servidor iniciará por padrão em `http://localhost:5000`.

---

## Documentação da API (Swagger)

A API conta com uma interface interativa do Swagger (OpenAPI 3.0) para visualização, exploração e testes diretos de todas as rotas a partir do navegador.

### Como acessar:
1. Certifique-se de que o servidor backend está ativo (`npm run dev` na pasta `backend/`).
2. Acesse no seu navegador: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

Na interface do Swagger, você poderá utilizar o botão **"Try it out"** em cada rota para preencher parâmetros e testar as requisições em tempo real no banco de dados mock.

---

## Endpoints da API

### 1. Listagem de Atendimentos
* **Rota:** `GET /api/atendimentos`
* **Parâmetros da Query (Opcionais):**
  * `page` (Padrão: `1`): Número da página desejada.
  * `limit` (Padrão: `10`): Quantidade de registros por página.
  * `search` (Padrão: `""`): Filtro de busca textual aplicável aos campos `cliente`, `advogado` ou `areaJuridica` (busca case-insensitive parcial).
* **Exemplo de Retorno:**
  ```json
  {
    "totalItems": 20,
    "totalPages": 2,
    "currentPage": 1,
    "limit": 10,
    "data": [
      {
        "id": 1,
        "cliente": "Ana Silva",
        "advogado": "Dr. Roberto Santos",
        "areaJuridica": "Trabalhista",
        "data": "2026-01-10",
        "status": "Concluído",
        "valor": 1200.00
      }
    ]
  }
  ```

### 2. Métricas e KPIs
* **Rota:** `GET /api/atendimentos/metrics`
* **Exemplo de Retorno:**
  ```json
  {
    "kpis": {
      "totalAtendimentos": 20,
      "totalConcluidos": 14,
      "totalCancelados": 3,
      "receitaTotal": 48300.00
    },
    "porStatus": {
      "Concluído": 14,
      "Cancelado": 3,
      "Em Andamento": 3
    },
    "evolucaoMensal": [
      {
        "mes": "2026-01",
        "atendimentos": 2,
        "receita": 3700.00
      }
    ]
  }
  ```

---

## Limitações do Modelo Mock e Melhorias Futuras

Como o backend opera sem persistência relacional real:
1. **Concorrência e Performance:** A leitura síncrona do arquivo JSON (`readFileSync`) bloqueia a event loop do Node.js. Para produção, o ideal é migrar para um banco de dados real (ex: PostgreSQL, MongoDB) para manipulação assíncrona escalável e eficiente.
2. **Escrita/Persistência de Novos Registros:** Atualmente, a base de dados é apenas de leitura. Caso novas rotas fossem criadas para cadastrar/editar atendimentos, seria necessária a escrita de volta no arquivo JSON (`writeFileSync`), que pode corromper dados sob requisições simultâneas.
3. **Indexação:** Não há índices de busca. Consultas de pesquisa textual iteram por toda a lista de atendimentos, o que se torna inviável para bases grandes de dados.

---

## Frontend (Instruções)

O frontend foi desenvolvido utilizando **React (Vite)** e estruturado de forma modular para consumir os dados da API REST criada na etapa anterior.

---

### Tecnologias e Dependências do Frontend

* **[React](https://react.dev/) & [React DOM](https://reactjs.org/) (v18.3.1):**
  * *Justificativa:* Biblioteca líder para criação de interfaces declarativas baseadas em componentes reativos, possibilitando re-renderizações eficientes sob mudanças de estados locais.
* **[Axios](https://axios-http.com/) (v1.7.2):**
  * *Justificativa:* Cliente HTTP baseado em Promises de uso simplificado para chamadas assíncronas. Oferece melhor tratamento de erros do que o `fetch` nativo e simplifica a configuração de cabeçalhos e parâmetros de URL.
* **[Recharts](https://recharts.org/) (v2.12.7):**
  * *Justificativa:* Biblioteca de gráficos desenvolvida especificamente para React. Baseada em SVG, ela se adapta dinamicamente a layouts responsivos e é altamente customizável via CSS e declarações de componentes.
* **[jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) (v2.5.1 / v3.8.2):**
  * *Justificativa:* Permite a geração de arquivos PDF diretamente no lado do cliente (browser) sem onerar o processamento do servidor. O plugin `AutoTable` simplifica a tabulação dos dados de forma limpa e com quebras automáticas de página.

---

### Decisões de Arquitetura do Cliente Frontend

1. **Proxy Integrado via Vite (`frontend/vite.config.js`):**
   * Configuração de proxy de desenvolvimento redirecionando todas as requisições enviadas a `/api` para `http://localhost:5000/api`. Isso elimina problemas de CORS em desenvolvimento e simplifica URLs relativas no código do React.
2. **Debounce no Input de Pesquisa:**
   * O campo de busca em `AppointmentTable.jsx` utiliza um delay (debounce) de 350ms antes de atualizar o estado global em `App.jsx`. Isso otimiza o tráfego de rede, evitando requisições consecutivas a cada tecla pressionada.
3. **Exportações Customizadas no Cliente:**
   * **CSV:** Geração manual baseada em arrays Javascript. A adição explícita do Byte Order Mark (BOM) UTF-8 (`\uFEFF` ou `[0xef, 0xbb, 0xbf]`) garante que acentuações como "Concluído" e "Cível" sejam abertas perfeitamente em programas como Microsoft Excel.
   * **PDF:** Formatação com cores da identidade visual (Indigo), alinhamento numérico das colunas financeiras e rodapés com datas dinâmicas.
4. **Design System com Vanilla CSS e Glassmorphism:**
   * A estilização em `src/index.css` evita frameworks utilitários para priorizar flexibilidade e controle máximo do CSS. Utiliza efeitos translúcidos (`backdrop-filter`), gradientes lineares, micro-animações no hover e redimensionamento automático de grids baseando-se em media queries para telas móveis, tablets e computadores.

---

### Instalação e Execução Local do Frontend

#### Pré-requisitos
* Ter o **backend** ativo e rodando na porta `5000` (conforme instruções da seção anterior).

#### Passo a Passo

1. **Acessar a pasta do frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```
   *(Caso esteja no Windows PowerShell e enfrente restrições de script com npm, execute `npm.cmd install`)*.

3. **Executar em modo de desenvolvimento (servidor Vite):**
   ```bash
   npm run dev
   ```
   O frontend iniciará por padrão em `http://localhost:3000` e já estará conectado à API REST.

