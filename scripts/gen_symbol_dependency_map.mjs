#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(repoRoot, "v10", "src");
const outputDir = path.join(repoRoot, "v10", "docs", "architecture", "generated");
const outputMd = path.join(repoRoot, "v10", "docs", "architecture", "04_Symbol_Dependency_Map.md");

const require = createRequire(import.meta.url);
let ts;
try {
  ts = require("typescript");
} catch {
  ts = require(path.join(repoRoot, "v10", "node_modules", "typescript"));
}

const TS_EXTS = [".ts", ".tsx", ".mts", ".cts"];

const toPosix = (value) => value.split(path.sep).join("/");

const classifyTopLevel = (relativePath) => {
  const first = toPosix(relativePath).split("/")[0] ?? "unknown";
  if (["app", "core", "features", "mod", "ui"].includes(first)) return first;
  return "other";
};

const collectSourceFiles = (rootDir) => {
  const files = [];
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!/\.(ts|tsx|mts|cts)$/.test(entry.name)) continue;
      if (entry.name.endsWith(".d.ts")) continue;
      files.push(fullPath);
    }
  };
  walk(rootDir);
  return files.sort((a, b) => a.localeCompare(b));
};

const resolveAsFile = (basePath) => {
  const candidates = [];
  const ext = path.extname(basePath);
  if (ext) {
    candidates.push(basePath);
  } else {
    for (const tsExt of TS_EXTS) candidates.push(basePath + tsExt);
    for (const tsExt of TS_EXTS) candidates.push(path.join(basePath, "index" + tsExt));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
};

const resolveAliasToPath = (specifier) => {
  if (specifier.startsWith("@/")) {
    return path.join(srcRoot, specifier.slice(2));
  }
  if (specifier.startsWith("@core/")) {
    return path.join(srcRoot, "core", specifier.slice("@core/".length));
  }
  if (specifier === "@core") {
    return path.join(srcRoot, "core");
  }
  if (specifier.startsWith("@features/")) {
    return path.join(srcRoot, "features", specifier.slice("@features/".length));
  }
  if (specifier === "@features") {
    return path.join(srcRoot, "features");
  }
  if (specifier.startsWith("@ui/")) {
    return path.join(srcRoot, "ui", specifier.slice("@ui/".length));
  }
  if (specifier === "@ui") {
    return path.join(srcRoot, "ui");
  }
  if (specifier.startsWith("@core/runtime/modding")) {
    return path.join(srcRoot, "core", "runtime", "modding", specifier.slice("@core/runtime/modding".length));
  }
  return null;
};

const resolveImport = (specifier, fromFile) => {
  if (!specifier || typeof specifier !== "string") {
    return {
      type: "unknown",
      targetPath: null,
      targetCategory: "unknown",
    };
  }

  let resolved = null;
  if (specifier.startsWith(".") || specifier.startsWith("..")) {
    resolved = resolveAsFile(path.resolve(path.dirname(fromFile), specifier));
  } else {
    const aliasBase = resolveAliasToPath(specifier);
    if (aliasBase) {
      resolved = resolveAsFile(aliasBase);
    }
  }

  if (!resolved) {
    return {
      type: "external",
      targetPath: null,
      targetCategory: "external",
    };
  }

  const rel = path.relative(srcRoot, resolved);
  if (rel.startsWith("..")) {
    return {
      type: "external",
      targetPath: null,
      targetCategory: "external",
    };
  }

  const targetPath = toPosix(rel);
  return {
    type: "local",
    targetPath,
    targetCategory: classifyTopLevel(targetPath),
  };
};

const hasModifier = (node, kind) =>
  Array.isArray(node.modifiers) && node.modifiers.some((m) => m.kind === kind);

const isVariableStatementExported = (node) => {
  let current = node;
  while (current) {
    if (ts.isVariableStatement(current)) {
      return hasModifier(current, ts.SyntaxKind.ExportKeyword);
    }
    current = current.parent;
  }
  return false;
};

const resolveVariableKind = (node) => {
  const declarationList = node.parent;
  if (!declarationList || !ts.isVariableDeclarationList(declarationList)) return "unknown";
  if (declarationList.flags & ts.NodeFlags.Const) return "const";
  if (declarationList.flags & ts.NodeFlags.Let) return "let";
  return "var";
};

const lineOf = (sourceFile, node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;

const symbolInventory = [];
const fileEdgesMap = new Map();
const folderEdgesMap = new Map();

const sourceFiles = collectSourceFiles(srcRoot);

let functionDecl = 0;
let classMethod = 0;
let varDecl = 0;
let varFn = 0;

for (const filePath of sourceFiles) {
  const raw = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    raw,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const relPath = toPosix(path.relative(srcRoot, filePath));
  const sourceCategory = classifyTopLevel(relPath);

  const imports = [];
  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    const specifier = stmt.moduleSpecifier?.text ?? "";
    const resolved = resolveImport(specifier, filePath);
    imports.push({
      source: specifier,
      type: resolved.type,
      targetPath: resolved.targetPath,
      targetCategory: resolved.targetCategory,
    });

    if (resolved.type === "local" && resolved.targetPath) {
      const fileKey = `${relPath}=>${resolved.targetPath}`;
      fileEdgesMap.set(fileKey, (fileEdgesMap.get(fileKey) ?? 0) + 1);

      const folderKey = `${sourceCategory}=>${resolved.targetCategory}`;
      folderEdgesMap.set(folderKey, (folderEdgesMap.get(folderKey) ?? 0) + 1);
    }
  }

  const functions = [];
  const methods = [];
  const variables = [];

  const walk = (node) => {
    if (ts.isFunctionDeclaration(node)) {
      functionDecl += 1;
      functions.push({
        name: node.name ? node.name.getText(sourceFile) : "<anonymous>",
        line: lineOf(sourceFile, node),
        exported: hasModifier(node, ts.SyntaxKind.ExportKeyword),
        async: hasModifier(node, ts.SyntaxKind.AsyncKeyword),
      });
    }

    if (ts.isMethodDeclaration(node)) {
      classMethod += 1;
      const classNode = node.parent && ts.isClassLike(node.parent) ? node.parent : null;
      methods.push({
        className: classNode?.name ? classNode.name.getText(sourceFile) : "<anonymous-class>",
        name: node.name.getText(sourceFile),
        line: lineOf(sourceFile, node),
        static: hasModifier(node, ts.SyntaxKind.StaticKeyword),
        async: hasModifier(node, ts.SyntaxKind.AsyncKeyword),
      });
    }

    if (ts.isVariableDeclaration(node)) {
      varDecl += 1;
      const initializer = node.initializer;
      const isFunctionLike = Boolean(
        initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
      );
      if (isFunctionLike) varFn += 1;

      variables.push({
        name: ts.isIdentifier(node.name) ? node.name.text : node.name.getText(sourceFile),
        line: lineOf(sourceFile, node),
        kind: resolveVariableKind(node),
        exported: isVariableStatementExported(node),
        functionLikeInitializer: isFunctionLike,
      });
    }

    ts.forEachChild(node, walk);
  };

  walk(sourceFile);

  symbolInventory.push({
    path: relPath,
    category: sourceCategory,
    imports,
    symbols: {
      functions,
      methods,
      variables,
    },
    stats: {
      functionDecl: functions.length,
      classMethod: methods.length,
      variableDecl: variables.length,
      variableAssignedFunction: variables.filter((v) => v.functionLikeInitializer).length,
    },
  });
}

const folderEdges = [...folderEdgesMap.entries()]
  .map(([key, count]) => {
    const [from, to] = key.split("=>");
    return { from, to, count };
  })
  .sort((a, b) => b.count - a.count || a.from.localeCompare(b.from) || a.to.localeCompare(b.to));

const fileEdges = [...fileEdgesMap.entries()]
  .map(([key, count]) => {
    const [from, to] = key.split("=>");
    return { from, to, count };
  })
  .sort((a, b) => b.count - a.count || a.from.localeCompare(b.from) || a.to.localeCompare(b.to));

const totals = {
  files: sourceFiles.length,
  functionDecl,
  classMethod,
  varDecl,
  varFn,
};

const symbolInventoryPayload = {
  generatedAt: new Date().toISOString(),
  sourceRoot: "v10/src",
  totals,
  files: symbolInventory,
};

const folderEdgesPayload = {
  generatedAt: new Date().toISOString(),
  sourceRoot: "v10/src",
  edges: folderEdges,
};

const fileEdgesPayload = {
  generatedAt: new Date().toISOString(),
  sourceRoot: "v10/src",
  edges: fileEdges,
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "symbol_inventory.json"), JSON.stringify(symbolInventoryPayload, null, 2) + "\n");
fs.writeFileSync(path.join(outputDir, "folder_dependency_edges.json"), JSON.stringify(folderEdgesPayload, null, 2) + "\n");
fs.writeFileSync(path.join(outputDir, "file_dependency_edges.json"), JSON.stringify(fileEdgesPayload, null, 2) + "\n");

const topFolderEdges = folderEdges.slice(0, 20);
const topHeavyFiles = [...symbolInventory]
  .map((entry) => ({
    path: entry.path,
    load:
      entry.stats.functionDecl +
      entry.stats.classMethod +
      entry.stats.variableAssignedFunction,
    functionDecl: entry.stats.functionDecl,
    classMethod: entry.stats.classMethod,
    variableAssignedFunction: entry.stats.variableAssignedFunction,
  }))
  .sort((a, b) => b.load - a.load || a.path.localeCompare(b.path))
  .slice(0, 30);

const categories = [...new Set(folderEdges.flatMap((edge) => [edge.from, edge.to]))].sort();
const nodeLabel = (cat) => `${cat}_${cat.replace(/[^a-zA-Z0-9_]/g, "_")}`;
const mermaidNodes = categories.map((cat) => `  ${nodeLabel(cat)}[${cat}]`).join("\n");
const mermaidEdges = topFolderEdges
  .map((edge) => `  ${nodeLabel(edge.from)} -->|${edge.count}| ${nodeLabel(edge.to)}`)
  .join("\n");

const folderEdgeRows = topFolderEdges
  .map((edge) => `| ${edge.from} | ${edge.to} | ${edge.count} |`)
  .join("\n");

const heavyFileRows = topHeavyFiles
  .map(
    (entry) =>
      `| \`${entry.path}\` | ${entry.load} | ${entry.functionDecl} | ${entry.classMethod} | ${entry.variableAssignedFunction} |`
  )
  .join("\n");

const markdown = `# 04. Symbol Dependency Map\n\nStatus: ACTIVE GENERATED MAP (Task 489)\nDate: ${new Date().toISOString().slice(0, 10)}\nGenerator: \`scripts/gen_symbol_dependency_map.mjs\`\n\n---\n\n## 1) 목적\n\n이 문서는 \`v10/src\` 기준으로:\n1. 폴더 의존성 경로\n2. 파일 의존성 경로\n3. 함수/변수/메서드 정의 인덱스\n를 자동 생성해, 리팩토링 난이도를 낮추기 위한 기반 맵을 제공한다.\n\n---\n\n## 2) Totals (current snapshot)\n\n- Files: **${totals.files}**\n- Function declarations: **${totals.functionDecl}**\n- Class methods: **${totals.classMethod}**\n- Variable declarations: **${totals.varDecl}**\n- Variable-assigned function-like: **${totals.varFn}**\n\n---\n\n## 3) Folder Dependency Flow (Top edges)\n\n\`\`\`mermaid\nflowchart LR\n${mermaidNodes}\n${mermaidEdges}\n\`\`\`\n\n| From | To | Count |\n|---|---|---:|\n${folderEdgeRows || "| - | - | 0 |"}\n\n---\n\n## 4) Symbol Hotspots (Top 30 by load)\n\nLoad = functionDecl + classMethod + variableAssignedFunction\n\n| File | Load | functionDecl | classMethod | variableAssignedFunction |\n|---|---:|---:|---:|---:|\n${heavyFileRows || "| - | 0 | 0 | 0 | 0 |"}\n\n---\n\n## 5) Symbol Type Definitions\n\n- **functionDecl**: \`function foo() {}\` 형태의 선언 함수\n- **classMethod**: 클래스 내부 메서드\n- **variableDecl**: \`const/let/var\` 선언\n- **variableAssignedFunction**: 변수 초기값이 화살표 함수/함수표현식인 경우\n\n---\n\n## 6) Full Dataset Paths\n\n- \`v10/docs/architecture/generated/symbol_inventory.json\`\n- \`v10/docs/architecture/generated/folder_dependency_edges.json\`\n- \`v10/docs/architecture/generated/file_dependency_edges.json\`\n\n---\n\n## 7) Re-generate\n\n\`\`\`bash\nnode scripts/gen_symbol_dependency_map.mjs\n\`\`\`\n\n---\n\n## 8) Practical Reading Order\n\n1. \`00_AsIs_SystemFlowMap.md\` (현재 실행 흐름)\n2. \`01_ToBe_EngineModFlowMap.md\` (목표 구조)\n3. \`02_Gap_Register_And_RiskMap.md\` (어긋남)\n4. **\`04_Symbol_Dependency_Map.md\` (전수 인덱스 진입점)**\n5. \`03_Refactor_DAG_ExecutionPlan.md\` (실행 순서)\n`;

fs.writeFileSync(outputMd, markdown);

console.log("[gen_symbol_dependency_map] generated:");
console.log(`- ${path.relative(repoRoot, outputMd)}`);
console.log(`- ${path.relative(repoRoot, path.join(outputDir, "symbol_inventory.json"))}`);
console.log(`- ${path.relative(repoRoot, path.join(outputDir, "folder_dependency_edges.json"))}`);
console.log(`- ${path.relative(repoRoot, path.join(outputDir, "file_dependency_edges.json"))}`);
console.log("[gen_symbol_dependency_map] totals", totals);
