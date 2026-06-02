import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

import { isDevelopmentGuestMode } from "./auth.ts";
import { getConfiguredDatabaseUrl } from "./database-url.ts";
import type { ResearchProject } from "./types.ts";

const projectsByOwner = new Map<string, ResearchProject[]>();
let loadedStorePath: string | null = null;
let loadedStoreSignature: string | null = null;

export function isDevelopmentProjectStoreEnabled() {
  return isDevelopmentGuestMode() && !getConfiguredDatabaseUrl();
}

export function listDevelopmentProjects(ownerId: string): ResearchProject[] {
  ensureProjectStoreLoaded();

  return getOwnerProjects(ownerId)
    .map(cloneProject)
    .sort((left, right) => right.createdAt - left.createdAt);
}

export function getDevelopmentProject(
  ownerId: string,
  projectId: string
): ResearchProject | null {
  ensureProjectStoreLoaded();

  const project = getOwnerProjects(ownerId).find((item) => item.id === projectId);
  return project ? cloneProject(project) : null;
}

export function createDevelopmentProject(
  ownerId: string,
  project: ResearchProject
): ResearchProject {
  ensureProjectStoreLoaded();

  const ownerProjects = getOwnerProjects(ownerId);
  const nextProject = cloneProject(project);
  const existingIndex = ownerProjects.findIndex((item) => item.id === project.id);

  if (existingIndex >= 0) {
    ownerProjects[existingIndex] = nextProject;
  } else {
    ownerProjects.push(nextProject);
  }

  persistProjectStore();
  return cloneProject(nextProject);
}

export function updateDevelopmentProject(
  ownerId: string,
  project: ResearchProject
): ResearchProject | null {
  ensureProjectStoreLoaded();

  const ownerProjects = getOwnerProjects(ownerId);
  const index = ownerProjects.findIndex((item) => item.id === project.id);
  if (index < 0) return null;

  const nextProject = cloneProject(project);
  ownerProjects[index] = nextProject;
  persistProjectStore();
  return cloneProject(nextProject);
}

export function deleteDevelopmentProject(ownerId: string, projectId: string) {
  ensureProjectStoreLoaded();

  const ownerProjects = getOwnerProjects(ownerId);
  const index = ownerProjects.findIndex((item) => item.id === projectId);
  if (index < 0) return false;

  ownerProjects.splice(index, 1);
  persistProjectStore();
  return true;
}

export function clearDevelopmentProjectStoreForTests() {
  projectsByOwner.clear();
  loadedStorePath = null;
  loadedStoreSignature = null;
}

function ensureProjectStoreLoaded() {
  const storePath = getDevelopmentProjectStorePath();
  const storeSignature = getStoreSignature(storePath);
  if (
    loadedStorePath === storePath &&
    loadedStoreSignature === storeSignature
  ) {
    return;
  }

  projectsByOwner.clear();
  loadedStorePath = storePath;
  loadedStoreSignature = storeSignature;

  if (!existsSync(storePath)) return;

  try {
    const raw = readFileSync(storePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, ResearchProject[]>;

    for (const [ownerId, projects] of Object.entries(parsed)) {
      if (!Array.isArray(projects)) continue;
      projectsByOwner.set(ownerId, projects.map(cloneProject));
    }
  } catch (error) {
    console.error("Failed to load development project store:", error);
  }
}

function persistProjectStore() {
  const storePath = getDevelopmentProjectStorePath();
  const payload = Object.fromEntries(
    [...projectsByOwner.entries()].map(([ownerId, projects]) => [
      ownerId,
      projects.map(cloneProject),
    ])
  );

  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  loadedStorePath = storePath;
  loadedStoreSignature = getStoreSignature(storePath);
}

function getDevelopmentProjectStorePath() {
  return (
    process.env.PAPERFORGE_DEV_PROJECT_STORE_PATH ??
    join(process.cwd(), ".paperforge-dev", "projects.json")
  );
}

function getOwnerProjects(ownerId: string) {
  const existing = projectsByOwner.get(ownerId);
  if (existing) return existing;

  const next: ResearchProject[] = [];
  projectsByOwner.set(ownerId, next);
  return next;
}

function getStoreSignature(storePath: string) {
  try {
    const stats = statSync(storePath);
    return `${stats.mtimeMs}:${stats.size}`;
  } catch {
    return null;
  }
}

function cloneProject(project: ResearchProject): ResearchProject {
  return structuredClone(project);
}
