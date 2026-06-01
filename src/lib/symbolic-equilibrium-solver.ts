import type { EquilibriumResult, HotellingModel } from "./types";
import { evaluateHotellingModelSolvability } from "./research-model-solvability.ts";

export function solveSymbolicHotellingEquilibrium(
  model: HotellingModel
): EquilibriumResult {
  const unsupportedReasons = getUnsupportedReasons(model);

  if (unsupportedReasons.length > 0) {
    return createUnsupportedEquilibriumResult(unsupportedReasons);
  }

  return createCanonicalHotellingEquilibriumResult();
}

function getUnsupportedReasons(model: HotellingModel) {
  const issues: string[] = [];
  const solvability = evaluateHotellingModelSolvability(model);

  issues.push(...solvability.issues);

  if (!hasTwoNamedPlatforms(model)) {
    issues.push("unsupported platform structure: expected exactly platforms A and B");
  }

  if (!hasCanonicalUtilities(model)) {
    issues.push(
      "unsupported utility system: expected two-sided Hotelling utilities with alpha_B, alpha_S, tau_i, s_i, x, and y"
    );
  }

  if (!hasCanonicalProfitFunctions(model)) {
    issues.push(
      "unsupported profit function: expected Pi_i = tau_i q n_i^S n_i^B - s_i n_i^B for platforms A and B"
    );
  }

  return [...new Set(issues)];
}

function hasTwoNamedPlatforms(model: HotellingModel) {
  const platforms = model.platforms.map((platform) =>
    platform.trim().toUpperCase()
  );

  return (
    platforms.length === 2 && platforms.includes("A") && platforms.includes("B")
  );
}

function hasCanonicalUtilities(model: HotellingModel) {
  const expressions = model.utilityFunctions.map((entry) =>
    normalizeExpression(entry.expression)
  );

  return (
    expressions.some(isCanonicalBuyerAUtility) &&
    expressions.some(isCanonicalBuyerBUtility) &&
    expressions.some(isCanonicalSellerAUtility) &&
    expressions.some(isCanonicalSellerBUtility)
  );
}

function isCanonicalBuyerAUtility(expression: string) {
  return (
    expression.includes("u_a^b=") &&
    expression.includes("alpha_bn_a^s") &&
    expression.includes("s_a") &&
    expression.includes("t_bx")
  );
}

function isCanonicalBuyerBUtility(expression: string) {
  return (
    expression.includes("u_b^b=") &&
    expression.includes("alpha_bn_b^s") &&
    expression.includes("s_b") &&
    expression.includes("t_b(1-x)")
  );
}

function isCanonicalSellerAUtility(expression: string) {
  return (
    expression.includes("u_a^s=") &&
    expression.includes("alpha_sn_a^b") &&
    expression.includes("tau_aq") &&
    expression.includes("t_sy")
  );
}

function isCanonicalSellerBUtility(expression: string) {
  return (
    expression.includes("u_b^s=") &&
    expression.includes("alpha_sn_b^b") &&
    expression.includes("tau_bq") &&
    expression.includes("t_s(1-y)")
  );
}

function hasCanonicalProfitFunctions(model: HotellingModel) {
  const expressions = model.profitFunctions.map((entry) =>
    normalizeExpression(entry.expression)
  );

  return (
    expressions.some(isCanonicalProfitA) && expressions.some(isCanonicalProfitB)
  );
}

function isCanonicalProfitA(expression: string) {
  return (
    expression.includes("pi_a=") &&
    expression.includes("tau_aqn_a^sn_a^b") &&
    expression.includes("-s_an_a^b")
  );
}

function isCanonicalProfitB(expression: string) {
  return (
    expression.includes("pi_b=") &&
    expression.includes("tau_bqn_b^sn_b^b") &&
    expression.includes("-s_bn_b^b")
  );
}

function normalizeExpression(expression: string) {
  return expression
    .replace(/\\Pi/g, "Pi")
    .replace(/Π/g, "Pi")
    .replace(/\\tau/g, "tau")
    .replace(/τ/g, "tau")
    .replace(/\\alpha/g, "alpha")
    .replace(/α/g, "alpha")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function createUnsupportedEquilibriumResult(reasons: string[]): EquilibriumResult {
  const reasonText = reasons.join("; ");

  return {
    status: "symbolic_failure",
    concept: "当前模型超出本地确定性 Hotelling 求解器覆盖范围",
    solvingSteps: [
      "检查模型是否为两个平台 A/B、买卖两侧 Hotelling、佣金 tau_i 与补贴 s_i 的 canonical 结构。",
      "检查利润函数是否为 Pi_i = tau_i q n_i^S n_i^B - s_i n_i^B。",
      "未通过覆盖范围检查，因此不套用默认闭式解。",
    ],
    focs: [],
    conditions: reasons,
    closedForm: "",
    derivation:
      `本地求解器只覆盖默认双边 Hotelling 佣金-补贴结构。当前失败原因：${reasonText}。` +
      "请先把机制函数具体化，或回到模型设定收窄为可识别的 canonical 结构后再求解。",
    code: "",
    warnings: [
      "未生成闭式均衡；为避免错误复用默认结果，当前模型被标记为 symbolic_failure。",
      ...reasons,
    ],
  };
}

function createCanonicalHotellingEquilibriumResult(): EquilibriumResult {
  return {
    status: "solved",
    concept: "对称内部纳什均衡（本地确定性符号求解器）",
    solvingSteps: [
      "由买家无差异条件 U_A^B=U_B^B 得到买家侧平台 A 份额 n_A^B。",
      "由卖家无差异条件 U_A^S=U_B^S 得到卖家侧平台 A 份额 n_A^S。",
      "令 D=t_Bt_S-\\alpha_B\\alpha_S，并把 n_i^B 与 n_i^S 代入平台利润函数 \\Pi_i=\\tau_i q n_i^S n_i^B-s_i n_i^B。",
      "在对称内部候选均衡 \\tau_A=\\tau_B=\\tau, s_A=s_B=s 下整理一阶条件。",
      "联立对称一阶条件得到闭式 \\tau^* 与 s^*，再列出内部解和局部二阶条件。",
    ],
    focs: [
      "D-q\\tau(t_B+\\alpha_B)+2\\alpha_B s=0",
      "q\\tau(t_S+\\alpha_S)-2D-2t_Ss=0",
      "D=t_Bt_S-\\alpha_B\\alpha_S",
    ],
    conditions: [
      "D=t_Bt_S-\\alpha_B\\alpha_S>0，保证两侧需求反馈可解。",
      "\\tau^*=(t_S-2\\alpha_B)/q；若论文要求卖家佣金非负，需要 t_S\\ge 2\\alpha_B。",
      "s^*=(t_S+\\alpha_S-2t_B-2\\alpha_B)/2；若论文要求买家补贴非负，需要 t_S+\\alpha_S\\ge 2(t_B+\\alpha_B)。",
      "对称候选给出 n_A^{B*}=n_A^{S*}=1/2；内部解还需满足局部二阶条件。",
      "局部二阶条件可用 Hessian 负定检查：\\Pi_{\\tau\\tau}<0 与 \\det(H)>0。",
    ],
    closedForm:
      "在对称内部均衡中，$\\tau_A^*=\\tau_B^*=\\frac{t_S-2\\alpha_B}{q}$，$s_A^*=s_B^*=\\frac{t_S+\\alpha_S-2t_B-2\\alpha_B}{2}$，且 $n_A^{B*}=n_B^{B*}=n_A^{S*}=n_B^{S*}=\\frac{1}{2}$。",
    derivation:
      "由买家无差异条件和卖家无差异条件可得 $n_A^B=\\frac{1}{2}+\\frac{t_S\\Delta s-\\alpha_B q\\Delta\\tau}{2D}$，$n_A^S=\\frac{1}{2}+\\frac{\\alpha_S\\Delta s-qt_B\\Delta\\tau}{2D}$，其中 $\\Delta s=s_A-s_B$，$\\Delta\\tau=\\tau_A-\\tau_B$，$D=t_Bt_S-\\alpha_B\\alpha_S$。代入 $\\Pi_A=\\tau_A q n_A^Sn_A^B-s_A n_A^B$ 后，在对称候选 $\\tau_A=\\tau_B=\\tau$、$s_A=s_B=s$ 处，一阶条件化为 $D-q\\tau(t_B+\\alpha_B)+2\\alpha_Bs=0$ 和 $q\\tau(t_S+\\alpha_S)-2D-2t_Ss=0$。联立解得 $\\tau^*=(t_S-2\\alpha_B)/q$，$s^*=(t_S+\\alpha_S-2t_B-2\\alpha_B)/2$。该结果只声明 canonical 双边 Hotelling 佣金-补贴结构的对称内部闭式解；若研究方向加入非对称平台、内生质量、机制函数或多期状态变量，求解器会返回 symbolic_failure，而不是复用这个闭式解。",
    code: `# deterministic local symbolic solver for the canonical Hotelling core
import sympy as sp

tau_A, tau_B, s_A, s_B, tau, s, q = sp.symbols(
    "tau_A tau_B s_A s_B tau s q", positive=True
)
t_B, t_S = sp.symbols("t_B t_S", positive=True)
alpha_B, alpha_S = sp.symbols("alpha_B alpha_S", real=True)
nA_B, nA_S = sp.symbols("nA_B nA_S", real=True)

nB_B = 1 - nA_B
nB_S = 1 - nA_S

buyer_indifference = sp.Eq(
    nA_B,
    (t_B + s_A - s_B + alpha_B * (nA_S - nB_S)) / (2 * t_B),
)
seller_indifference = sp.Eq(
    nA_S,
    (t_S - q * (tau_A - tau_B) + alpha_S * (nA_B - nB_B)) / (2 * t_S),
)

demand_solution = sp.solve(
    [buyer_indifference, seller_indifference],
    [nA_B, nA_S],
    dict=True,
    simplify=True,
)

nA_B_expr = sp.simplify(demand_solution[0][nA_B])
nA_S_expr = sp.simplify(demand_solution[0][nA_S])
Pi_A = tau_A * q * nA_S_expr * nA_B_expr - s_A * nA_B_expr

foc_tau_sym = sp.factor(
    sp.diff(Pi_A, tau_A).subs({tau_A: tau, tau_B: tau, s_A: s, s_B: s})
)
foc_s_sym = sp.factor(
    sp.diff(Pi_A, s_A).subs({tau_A: tau, tau_B: tau, s_A: s, s_B: s})
)
symmetric_solution = sp.solve(
    [foc_tau_sym, foc_s_sym],
    [tau, s],
    dict=True,
    simplify=True,
)

print("nA_B =", nA_B_expr)
print("nA_S =", nA_S_expr)
print("symmetric FOC_tau =", foc_tau_sym)
print("symmetric FOC_s =", foc_s_sym)
print("symmetric solution =", symmetric_solution)`,
    warnings: [
      "当前结果由受限的本地确定性符号求解器生成，只覆盖 canonical 双边 Hotelling 佣金-补贴结构，不是通用 CAS。",
      "均衡求解阶段不使用数值模拟；数值代入只应出现在后续仿真模块。",
      "如果继续加入非对称平台、质量验证努力、多归属或多期状态变量，需要先把机制方程具体化，再重新求解。",
    ],
  };
}
