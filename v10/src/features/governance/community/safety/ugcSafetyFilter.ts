export type UgcSafetyVerdict = "allow" | "review" | "block";

export type UgcSafetyCategory =
  | "abuse"
  | "sexual"
  | "self-harm"
  | "violence"
  | "spam";

export type UgcSafetyDecision = {
  verdict: UgcSafetyVerdict;
  category: UgcSafetyCategory | null;
  matchedTerm: string | null;
  code: string;
  message: string;
};

type UgcSafetyRule = {
  category: UgcSafetyCategory;
  verdict: UgcSafetyVerdict;
  terms: string[];
};

const BLOCK_RULES: UgcSafetyRule[] = [
  {
    category: "self-harm",
    verdict: "block",
    terms: ["kill myself", "suicide plan", "자살", "죽고 싶다"],
  },
  {
    category: "sexual",
    verdict: "block",
    terms: ["rape", "sexual assault", "강간"],
  },
];

const REVIEW_RULES: UgcSafetyRule[] = [
  {
    category: "abuse",
    verdict: "review",
    terms: ["stupid idiot", "go die", "병신", "좆같"],
  },
  {
    category: "violence",
    verdict: "review",
    terms: ["beat him", "폭행", "죽여버리"],
  },
  {
    category: "spam",
    verdict: "review",
    terms: ["free money", "click this", "earn cash fast", "광고 문의"],
  },
];

const normalizeText = (value: string): string =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

const findMatch = (
  normalized: string,
  rules: UgcSafetyRule[]
): UgcSafetyDecision | null => {
  for (const rule of rules) {
    for (const rawTerm of rule.terms) {
      const term = normalizeText(rawTerm);
      if (!term) continue;
      if (!normalized.includes(term)) continue;
      if (rule.verdict === "block") {
        return {
          verdict: "block",
          category: rule.category,
          matchedTerm: rawTerm,
          code: "community-ugc-safety-blocked",
          message: `content blocked by safety policy (${rule.category}).`,
        };
      }
      return {
        verdict: "review",
        category: rule.category,
        matchedTerm: rawTerm,
        code: "community-ugc-safety-review",
        message: `content flagged for moderator review (${rule.category}).`,
      };
    }
  }
  return null;
};

export const evaluateUgcSafetyText = (rawText: string): UgcSafetyDecision => {
  const normalized = normalizeText(rawText);
  if (normalized.length === 0) {
    return {
      verdict: "allow",
      category: null,
      matchedTerm: null,
      code: "community-ugc-safety-allow",
      message: "content passed safety policy.",
    };
  }

  const blocked = findMatch(normalized, BLOCK_RULES);
  if (blocked) return blocked;

  const review = findMatch(normalized, REVIEW_RULES);
  if (review) return review;

  return {
    verdict: "allow",
    category: null,
    matchedTerm: null,
    code: "community-ugc-safety-allow",
    message: "content passed safety policy.",
  };
};
