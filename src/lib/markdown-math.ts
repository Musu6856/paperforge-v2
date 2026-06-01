const MARKDOWN_PROTECTED_PATTERN =
  /(```[\s\S]*?```|`[^`\n]*`|\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\])/g;
const BARE_SYMBOLIC_TOKEN_PATTERN =
  /(?<![A-Za-z0-9\\$`])(?:[A-Za-z]+(?:_[A-Za-z0-9]+)+(?:\^(?:\*|[A-Za-z0-9]+))?|[A-Za-z]+(?:\^(?:\*|[A-Za-z0-9]+)))(?![A-Za-z0-9`])/g;
const CJK_PATTERN = /[\u3400-\u9fff]/;

function stabilizeMath(content: string) {
  return content
    .replace(/\\underbrace\{([^{}]+)\}_\{([^{}]+)\}/g, "$1")
    .replace(/\\overbrace\{([^{}]+)\}\^\{([^{}]+)\}/g, "$1")
    .replace(/\\underbrace\{([^{}]+)\}_\{\\text\{([^{}]+)\}\}/g, "$1")
    .replace(/\\\(([\s\S]+?)\\\)/g, (_match, expression: string) => `$${expression}$`)
    .replace(/\\\[([\s\S]+?)\\\]/g, (_match, expression: string) => `$$${expression}$$`);
}

function wrapStandaloneLatexLines(content: string) {
  let insideCodeFence = false;
  let insideDisplayMath = false;

  return content
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();

      if (trimmed === "$$") {
        insideDisplayMath = !insideDisplayMath;
        return line;
      }

      if (line.trimStart().startsWith("```")) {
        insideCodeFence = !insideCodeFence;
        return line;
      }

      if (insideCodeFence || insideDisplayMath) return line;

      if (!shouldWrapStandaloneLatexLine(trimmed)) return line;

      const indentation = line.match(/^\s*/)?.[0] ?? "";
      return `${indentation}$$${trimmed}$$`;
    })
    .join("\n");
}

function shouldWrapStandaloneLatexLine(line: string) {
  if (!line || line.includes("$") || CJK_PATTERN.test(line)) return false;
  if (!/\\[A-Za-z]+/.test(line)) return false;

  return (
    /(?:=|<|>|\\le|\\ge|\\frac|\\partial|\\cdot|\\quad)/.test(line) &&
    /(?:[A-Za-z]+_[A-Za-z0-9]+|\\[A-Za-z]+|\^\{?[*A-Za-z0-9])/.test(line)
  );
}

function wrapBareSymbolicTokensOutsideMath(content: string) {
  let normalized = "";
  let lastIndex = 0;

  for (const match of content.matchAll(MARKDOWN_PROTECTED_PATTERN)) {
    const index = match.index ?? 0;
    normalized += content
      .slice(lastIndex, index)
      .replace(BARE_SYMBOLIC_TOKEN_PATTERN, "$$$&$");
    normalized += match[0];
    lastIndex = index + match[0].length;
  }

  normalized += content
    .slice(lastIndex)
    .replace(BARE_SYMBOLIC_TOKEN_PATTERN, "$$$&$");
  return normalized;
}

export function normalizeMarkdownMath(content: string) {
  return wrapBareSymbolicTokensOutsideMath(
    wrapStandaloneLatexLines(stabilizeMath(content))
  );
}
