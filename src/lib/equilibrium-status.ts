import type { EquilibriumResult } from "./types";

export function isAnalysisReadyEquilibriumStatus(
  status?: EquilibriumResult["status"]
) {
  return (
    status === "solved" ||
    status === "reaction_function" ||
    status === "implicit_system"
  );
}

export function isClosedFormEquilibriumStatus(
  status?: EquilibriumResult["status"]
) {
  return status === "solved";
}
