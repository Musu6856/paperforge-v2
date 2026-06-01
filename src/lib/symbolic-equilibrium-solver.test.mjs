import test from "node:test";
import assert from "node:assert/strict";

import { solveSymbolicHotellingEquilibrium } from "./symbolic-equilibrium-solver.ts";

const canonicalModel = {
  symbols: [],
  sides: {
    consumerSideName: "buyers",
    merchantSideName: "sellers",
  },
  platforms: ["A", "B"],
  timing: [
    {
      id: "stage-commission-subsidy",
      order: 1,
      name: "platform decisions",
      decisions: ["\\tau_A", "\\tau_B", "s_A", "s_B"],
    },
  ],
  utilityFunctions: [
    {
      id: "u-buyer-a",
      side: "consumer",
      platform: "A",
      expression: "U_{A}^{B} = v_B + \\alpha_B n_{A}^{S} + s_A - p - t_B x",
      notes: "Buyer utility on A.",
    },
    {
      id: "u-buyer-b",
      side: "consumer",
      platform: "B",
      expression:
        "U_{B}^{B} = v_B + \\alpha_B n_{B}^{S} + s_B - p - t_B (1 - x)",
      notes: "Buyer utility on B.",
    },
    {
      id: "u-seller-a",
      side: "merchant",
      platform: "A",
      expression: "U_{A}^{S} = v_S + \\alpha_S n_{A}^{B} - \\tau_A q - t_S y",
      notes: "Seller utility on A.",
    },
    {
      id: "u-seller-b",
      side: "merchant",
      platform: "B",
      expression:
        "U_{B}^{S} = v_S + \\alpha_S n_{B}^{B} - \\tau_B q - t_S (1 - y)",
      notes: "Seller utility on B.",
    },
  ],
  demandDerivation: "Demand shares come from buyer and seller indifference.",
  profitFunctions: [
    {
      id: "profit-a",
      platform: "A",
      expression: "\\Pi_A = \\tau_A q n_A^S n_A^B - s_A n_A^B",
      notes: "Commission revenue net of subsidy.",
    },
    {
      id: "profit-b",
      platform: "B",
      expression: "\\Pi_B = \\tau_B q n_B^S n_B^B - s_B n_B^B",
      notes: "Commission revenue net of subsidy.",
    },
  ],
  assumptions: ["Two platforms sit at the ends of a Hotelling line."],
  modelSetupDraft: "A two-sided Hotelling model.",
};

test("symbolic solver returns closed form for canonical Hotelling commission subsidy model", () => {
  const result = solveSymbolicHotellingEquilibrium(canonicalModel);

  assert.equal(result.status, "solved");
  assert.match(
    result.closedForm,
    /\\tau_A\^\*=\\tau_B\^\*=\\frac\{t_S-2\\alpha_B\}\{q\}/
  );
  assert.match(
    result.closedForm,
    /s_A\^\*=s_B\^\*=\\frac\{t_S\+\\alpha_S-2t_B-2\\alpha_B\}\{2\}/
  );
  assert.match(
    result.derivation,
    /n_A\^B=\\frac\{1\}\{2\}\+\\frac\{t_S\\Delta s-\\alpha_B q\\Delta\\tau\}\{2D\}/
  );
  assert.match(result.code, /sp\.solve/);
});

test("symbolic solver returns implicit system for unresolved mechanism functions", () => {
  const result = solveSymbolicHotellingEquilibrium({
    ...canonicalModel,
    utilityFunctions: canonicalModel.utilityFunctions.map((entry, index) =>
      index === 0
        ? {
            ...entry,
            expression: "U_A^B = v_B + \\psi_A(\\mu_d) - t_B x",
          }
        : entry
    ),
  });

  assert.equal(result.status, "implicit_system");
  assert.match(result.closedForm, /F\(z,\\theta\)=0/);
  assert.match(result.focs.join("\n"), /\\Pi_A.*\\tau_A/);
  assert.match(result.conditions.join("\n"), /unresolved mechanism function/i);
  assert.match(result.derivation, /narrow|concret/i);
});

test("symbolic solver returns reaction-function result for noncanonical profit equations", () => {
  const result = solveSymbolicHotellingEquilibrium({
    ...canonicalModel,
    profitFunctions: [
      {
        ...canonicalModel.profitFunctions[0],
        expression: "\\Pi_A = \\tau_A q n_A^B - C_A(a_A)",
      },
      canonicalModel.profitFunctions[1],
    ],
  });

  assert.equal(result.status, "reaction_function");
  assert.match(result.closedForm, /R_A/);
  assert.match(result.closedForm, /R_B/);
  assert.match(result.focs.join("\n"), /\\Pi_A.*\\tau_A/);
  assert.match(result.conditions.join("\n"), /unsupported profit function/i);
});

test("symbolic solver still fails for models without two supported platforms", () => {
  const result = solveSymbolicHotellingEquilibrium({
    ...canonicalModel,
    platforms: ["A", "B", "C"],
  });

  assert.equal(result.status, "symbolic_failure");
  assert.equal(result.closedForm, "");
  assert.match(result.warnings.join("\n"), /unsupported platform structure/i);
});
