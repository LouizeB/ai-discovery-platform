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
  disciplines: string[];
  outputs: string[];
  papel_coe: string;
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
        disciplines: rule.disciplines || [],
        outputs: rule.outputs || [],
        papel_coe: rule.papel_coe || "",
      };
    }
  }

  return {
    flow: ["UX Design", "Visual", "Content"],
    stage: "TATICO",
    disciplines: ["UX Design", "UI", "Content", "DesignOps"],
    outputs: ["Fluxos", "Wireframes", "Prototipos"],
    papel_coe: "Execucao orientada e suporte",
  };
}
