import { useState } from "react";
import {
  Send,
  Loader2,
  Brain,
  ArrowRight,
  Code2,
  Users,
  Package,
  Shield,
} from "lucide-react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface AnalysisResult {
  input: {
    tipo: string;
    impacto_negocio: number;
    impacto_usuario: number;
    complexidade: number;
    urgencia: number;
    alinhamento_estrategico: number;
    resumo?: string;
  };
  score: number;
  flow: string[];
  stage: string;
  disciplines: string[];
  outputs: string[];
  papel_coe: string;
}

const stageDescriptions: Record<string, string> = {
  ESTRATEGICO: "Descoberta & Contexto — Alta incerteza, impacto transversal",
  EXPLORATORIO: "Direcionamento — Decisoes estruturantes de produto",
  TATICO: "Evolucao de Produto — Execucao recorrente e incremental",
};

const funnelOrder = ["ESTRATEGICO", "EXPLORATORIO", "TATICO"];

function FunnelIndicator({ stage }: { stage: string }) {
  const activeIndex = funnelOrder.indexOf(stage);

  const colors = [
    { active: "bg-purple-500", inactive: "bg-purple-100" },
    { active: "bg-blue-500", inactive: "bg-blue-100" },
    { active: "bg-emerald-500", inactive: "bg-emerald-100" },
  ];

  const labels = ["Estrategico", "Exploratorio", "Tatico"];

  return (
    <div className="flex items-center gap-1 w-full">
      {funnelOrder.map((s, i) => (
        <div key={s} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`h-2 w-full rounded-full transition-all ${
              i === activeIndex ? colors[i].active : colors[i].inactive
            }`}
          />
          <span
            className={`text-xs ${
              i === activeIndex ? "font-semibold text-gray-700" : "text-gray-400"
            }`}
          >
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    ESTRATEGICO: "bg-purple-100 text-purple-800 border-purple-300",
    EXPLORATORIO: "bg-blue-100 text-blue-800 border-blue-300",
    TATICO: "bg-emerald-100 text-emerald-800 border-emerald-300",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${colors[stage] || colors.BACKLOG}`}
    >
      {stage}
    </span>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const percentage = (score / 5) * 100;
  const color =
    score >= 4
      ? "text-green-500"
      : score >= 3
        ? "text-yellow-500"
        : score >= 2
          ? "text-orange-500"
          : "text-red-500";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={`${percentage * 3.14} 314`}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 font-medium">Score</p>
    </div>
  );
}

function CriteriaBar({
  label,
  value,
  weight,
}: {
  label: string;
  value: number;
  weight: number;
}) {
  const percentage = (value / 5) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="w-44 text-sm text-gray-600 truncate" title={label}>
        {label}
      </div>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="w-8 text-sm text-gray-700 font-medium text-right">
        {value}
      </div>
      <div className="w-12 text-xs text-gray-400 text-right">x{weight}</div>
    </div>
  );
}

const criteriaLabels: Record<string, string> = {
  impacto_negocio: "Impacto no Negocio",
  impacto_usuario: "Impacto no Usuario",
  complexidade: "Complexidade",
  urgencia: "Urgencia",
  alinhamento_estrategico: "Alinhamento Estrategico",
};

const criteriaWeights: Record<string, number> = {
  impacto_negocio: 0.3,
  impacto_usuario: 0.25,
  complexidade: 0.15,
  urgencia: 0.15,
  alinhamento_estrategico: 0.15,
};

function App() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  const handleAnalyze = async () => {
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze project");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              AI Discovery Platform
            </h1>
            <p className="text-xs text-gray-500">
              Funil de Projetos do Design CoE
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Input Section */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Descreva seu projeto
            </label>
            <textarea
              id="description"
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-shadow"
              placeholder="Ex: Precisamos criar um novo portal de autoatendimento para clientes, com funcionalidades de acompanhamento de pedidos, suporte via chat e integracao com o sistema de CRM existente..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={loading || !description.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Analisar Projeto
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <p className="font-semibold">Erro na analise</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <section className="space-y-6 animate-in fade-in duration-500">
            {/* Summary Card */}
            {result.input.resumo && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Resumo
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {result.input.resumo}
                </p>
              </div>
            )}

            {/* Score + Stage + Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
                <ScoreGauge score={result.score} />
              </div>

              {/* Stage */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Nivel do Funil
                  </h3>
                  <StageBadge stage={result.stage} />
                  <p className="text-xs text-gray-400 text-center mt-1">
                    {stageDescriptions[result.stage] || result.stage}
                  </p>
              </div>

              {/* Flow */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Fluxo Recomendado
                </h3>
                {result.flow.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {result.flow.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {i > 0 && (
                          <ArrowRight className="w-3 h-3 text-gray-300 -mt-0.5" />
                        )}
                        <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Nenhum fluxo definido
                  </p>
                )}
              </div>
            </div>

            {/* Funnel Position */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Posicao no Funil do Design CoE
              </h3>
              <FunnelIndicator stage={result.stage} />
              <p className="text-xs text-gray-500 mt-3 text-center">
                Quanto mais alto no funil: maior impacto, maior incerteza, maior envolvimento estrategico
              </p>
            </div>

            {/* Disciplines + Outputs + CoE Role */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Disciplines */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Disciplinas Envolvidas
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.disciplines.map((d, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Outputs */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Outputs Esperados
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.outputs.map((o, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium"
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>

              {/* CoE Role */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Papel do Design CoE
                  </h3>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {result.papel_coe}
                </p>
              </div>
            </div>

            {/* Criteria Breakdown */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Criterios de Avaliacao
              </h3>
              <div className="space-y-3">
                {Object.entries(criteriaLabels).map(([key, label]) => (
                  <CriteriaBar
                    key={key}
                    label={label}
                    value={
                      result.input[key as keyof typeof result.input] as number
                    }
                    weight={criteriaWeights[key]}
                  />
                ))}
              </div>
            </div>

            {/* Classification Type */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Tipo de Projeto
                  </h3>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {result.input.tipo?.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Score Ponderado
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.score} / 5.00
                  </p>
                </div>
              </div>
            </div>

            {/* JSON Toggle */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowJson(!showJson)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    JSON da Decisao
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {showJson ? "Ocultar" : "Mostrar"}
                </span>
              </button>
              {showJson && (
                <div className="px-6 pb-6">
                  <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-sm overflow-x-auto leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
          AI Discovery Platform &middot; Funil de Design CoE v2
        </div>
      </footer>
    </div>
  );
}

export default App;
