# AI Discovery Platform

Plataforma de classificacao inteligente de projetos usando IA. Analisa descricoes de projetos, classifica automaticamente usando OpenAI, aplica uma matriz de decisao com pesos e regras condicionais, e retorna score, fluxo recomendado e stage.

## Estrutura

```
ai-discovery-platform/
├── frontend/          # React + Tailwind
├── backend/           # Node.js (Express)
├── config/
│   ├── decision-matrix.json   # Matriz de pesos dos criterios
│   └── rules.json             # Regras condicionais
├── prompts/
│   ├── classify.txt           # Prompt de classificacao
│   └── generate-plan.txt      # Prompt de geracao de plano
```

## Requisitos

- Node.js >= 18
- Chave de API da OpenAI

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com sua OPENAI_API_KEY
npm run dev
```

O backend roda na porta 3001 por padrao.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend roda na porta 5173 por padrao.

## Endpoints

### POST /analyze

Recebe uma descricao de projeto e retorna a analise completa.

**Request:**
```json
{
  "description": "Descricao do projeto aqui..."
}
```

**Response:**
```json
{
  "input": {
    "tipo": "novo_produto",
    "impacto_negocio": 4,
    "impacto_usuario": 5,
    "complexidade": 3,
    "urgencia": 4,
    "alinhamento_estrategico": 4,
    "resumo": "..."
  },
  "score": 4.1,
  "flow": ["Research", "Product Design", "Analytics"],
  "stage": "DISCOVERY"
}
```

### GET /health

Health check endpoint.

## Decision Engine

### Matriz de Decisao (decision-matrix.json)

| Criterio | Peso |
|---|---|
| Impacto no Negocio | 0.30 |
| Impacto no Usuario | 0.25 |
| Complexidade | 0.15 |
| Urgencia | 0.15 |
| Alinhamento Estrategico | 0.15 |

### Regras Condicionais (rules.json)

1. Novo produto com alto impacto no usuario -> DISCOVERY (Research + Product Design + Analytics)
2. Melhoria com baixa complexidade -> DESIGN (Product Design)
3. Design System -> DESIGN (Design System)
4. Score < 2.5 -> BACKLOG

## Stack

- **Frontend:** React + Tailwind CSS + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **AI:** OpenAI API (gpt-4o-mini)
