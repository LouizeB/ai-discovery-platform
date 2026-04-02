import matrix from "../../config/decision-matrix.json" with { type: "json" };
import rules from "../../config/rules.json" with { type: "json" };

interface ClassificationInput {
  tipo: string;
  impacto_negocio: number;
  impacto_usuario: number;
  complexidade: number;
  urgencia: number;
  alinhamento_estrategico: number;
  resumo?: string;
}

interface DecisionResult {
  flow: string[];
  stage: string;
}

export function calculateScore(input: ClassificationInput): number {
  let score = 0;

  for (const key in matrix.criteria) {
    const criteriaKey = key as keyof typeof matrix.criteria;
    const inputValue = input[criteriaKey as keyof ClassificationInput];
    if (typeof inputValue === "number") {
      score += inputValue * matrix.criteria[criteriaKey];
    }
  }

  return Number(score.toFixed(2));
}

export function applyRules(
  input: ClassificationInput,
  score: number
): DecisionResult {
  for (const rule of rules) {
    const condition = new Function(
      "input",
      "score",
      `with(input) { return ${rule.condition} }`
    );

    if (condition(input, score)) {
      return {
        flow: rule.flow,
        stage: rule.stage,
      };
    }
  }

  return {
    flow: ["Backlog"],
    stage: "BACKLOG",
  };
}
