export type AdPolicyViolationCode =
  | "ad-policy-affiliate-link"
  | "ad-policy-direct-solicitation"
  | "ad-policy-suspicious-earnings-claim";

export type AdPolicyDecision =
  | {
      allow: true;
      code: null;
      message: null;
      matchedPattern: null;
    }
  | {
      allow: false;
      code: AdPolicyViolationCode;
      message: string;
      matchedPattern: string;
    };

const AD_POLICY_RULES: Array<{
  code: AdPolicyViolationCode;
  message: string;
  pattern: RegExp;
}> = [
  {
    code: "ad-policy-affiliate-link",
    message: "affiliate/referral promotion links are not allowed.",
    pattern: /https?:\/\/\S*(ref=|affiliate|promo=|coupon=)\S*/i,
  },
  {
    code: "ad-policy-direct-solicitation",
    message: "direct solicitation keywords are not allowed.",
    pattern: /\b(buy now|limited time offer|dm for price|sponsored)\b/i,
  },
  {
    code: "ad-policy-suspicious-earnings-claim",
    message: "suspicious guaranteed earnings claims are not allowed.",
    pattern: /\b(guaranteed (income|profit)|easy money|risk[- ]?free return)\b/i,
  },
];

const ALLOW_DECISION: AdPolicyDecision = {
  allow: true,
  code: null,
  message: null,
  matchedPattern: null,
};

const sanitizeInputText = (text: string): string => text.replace(/\s+/g, " ").trim();

export const evaluateAdPolicyText = (input: string): AdPolicyDecision => {
  const normalized = sanitizeInputText(input);
  if (normalized.length === 0) return ALLOW_DECISION;

  for (const rule of AD_POLICY_RULES) {
    const matched = normalized.match(rule.pattern);
    if (!matched) continue;
    return {
      allow: false,
      code: rule.code,
      message: rule.message,
      matchedPattern: matched[0],
    };
  }

  return ALLOW_DECISION;
};
