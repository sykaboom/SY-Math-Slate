export const applyMathDisplayRules = (tex: string) => {
  if (!tex) return tex;
  const needsDisplay =
    !/^\s*\\(?:displaystyle|textstyle|scriptstyle|scriptscriptstyle)\b/.test(tex);
  const nextTex = needsDisplay ? `\\displaystyle ${tex}` : tex;
  const argCounts: Record<string, number> = {
    frac: 2,
    dfrac: 2,
    tfrac: 2,
    cfrac: 2,
    binom: 2,
    dbinom: 2,
    tbinom: 2,
    overset: 2,
    underset: 2,
    stackrel: 2,
    sqrt: 1,
    overline: 1,
    underline: 1,
    bar: 1,
    vec: 1,
    hat: 1,
    tilde: 1,
    dot: 1,
    ddot: 1,
    text: 1,
    textbf: 1,
    textit: 1,
    mathrm: 1,
    mathbf: 1,
    mathit: 1,
    mathcal: 1,
    mathbb: 1,
    mathfrak: 1,
    mathsf: 1,
    operatorname: 1,
  };
  const optionalArgCommands = new Set(["sqrt"]);
  const readControlSequence = (input: string, start: number) => {
    let i = start + 1;
    if (i >= input.length) return { name: "", end: i };
    if (/[a-zA-Z]/.test(input[i])) {
      while (i < input.length && /[a-zA-Z]/.test(input[i])) i += 1;
    } else {
      i += 1;
    }
    return { name: input.slice(start + 1, i), end: i };
  };
  const isEscaped = (input: string, index: number) => {
    let count = 0;
    for (let i = index - 1; i >= 0 && input[i] === "\\"; i -= 1) count += 1;
    return count % 2 === 1;
  };
  const consumeGroup = (
    input: string,
    start: number,
    openChar: string,
    closeChar: string
  ) => {
    let depth = 0;
    let i = start;
    while (i < input.length) {
      const ch = input[i];
      if (ch === openChar && !isEscaped(input, i)) depth += 1;
      else if (ch === closeChar && !isEscaped(input, i)) {
        depth -= 1;
        if (depth === 0) {
          i += 1;
          break;
        }
      }
      i += 1;
    }
    return i;
  };
  const skipSpaces = (input: string, start: number) => {
    let i = start;
    while (i < input.length && /\s/.test(input[i])) i += 1;
    return i;
  };
  const consumeArgument = (input: string, start: number) => {
    let i = start;
    if (i >= input.length) return i;
    const ch = input[i];
    if (ch === "{") return consumeGroup(input, i, "{", "}");
    if (ch === "[") return consumeGroup(input, i, "[", "]");
    if (ch === "\\") {
      const { name, end } = readControlSequence(input, i);
      let j = end;
      if (optionalArgCommands.has(name) && input[j] === "[") {
        j = consumeGroup(input, j, "[", "]");
      }
      const argCount =
        Object.prototype.hasOwnProperty.call(argCounts, name) ? argCounts[name] : 0;
      for (let k = 0; k < argCount; k += 1) {
        j = skipSpaces(input, j);
        const next = consumeArgument(input, j);
        if (next <= j) break;
        j = next;
      }
      return j;
    }
    return i + 1;
  };
  const replaceOutsideScripts = (input: string) => {
    let out = "";
    let i = 0;
    let pendingScript = false;
    while (i < input.length) {
      if (pendingScript) {
        if (/\s/.test(input[i])) {
          out += input[i];
          i += 1;
          continue;
        }
        const end = consumeArgument(input, i);
        if (end <= i) {
          out += input[i];
          i += 1;
        } else {
          out += input.slice(i, end);
          i = end;
        }
        pendingScript = false;
        continue;
      }
      const ch = input[i];
      if ((ch === "_" || ch === "^") && i + 1 < input.length) {
        out += ch;
        i += 1;
        pendingScript = true;
        continue;
      }
      if (input.startsWith("\\frac", i)) {
        out += "\\dfrac";
        i += 5;
        continue;
      }
      out += ch;
      i += 1;
    }
    return out;
  };
  return replaceOutsideScripts(nextTex);
};

export const normalizeMathTex = (
  tex: string,
  options: { applyDisplayRules?: boolean } = {}
) => {
  if (!tex) return tex;
  const { applyDisplayRules = true } = options;
  const normalized = String(tex);
  return applyDisplayRules ? applyMathDisplayRules(normalized) : normalized;
};

export const normalizeMathInText = (value: string) => {
  const text = String(value || "").replace(
    /\\(?:displaystyle|textstyle|scriptstyle|scriptscriptstyle)\b\s*/g,
    ""
  );
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  return text.replace(mathRegex, (match) => {
    const isDisplay = match.startsWith("$$");
    const body = isDisplay ? match.slice(2, -2) : match.slice(1, -1);
    const normalized = normalizeMathTex(body, { applyDisplayRules: false });
    return isDisplay ? `$$${normalized}$$` : `$${normalized}$`;
  });
};
