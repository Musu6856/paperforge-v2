import { isDevelopmentGuestMode } from "./auth.ts";
import type { ResearchProject } from "./types.ts";

const projectsByOwner = new Map<string, ResearchProject[]>();

export function isDevelopmentProjectStoreEnabled() {
  return isDevelopmentGuestMode() && !process.env.DATABASE_URL;
}

export function listDevelopmentProjects(ownerId: string): ResearchProject[] {
  return getOwnerProjects(ownerId)
    .map(cloneProject)
    .sort((left, right) => right.createdAt - left.createdAt);
}

export function getDevelopmentProject(
  ownerId: string,
  projectId: string
): ResearchProject | null {
  const project = getOwnerProjects(ownerId).find((item) => item.id === projectId);
  return project ? cloneProject(project) : null;
}

export function createDevelopmentProject(
  ownerId: string,
  project: ResearchProject
): ResearchProject {
  const ownerProjects = getOwnerProjects(ownerId);
  const nextProject = cloneProject(project);
  const existingIndex = ownerProjects.findIndex((item) => item.id === project.id);

  if (existingIndex >= 0) {
    ownerProjects[existingIndex] = nextProject;
  } else {
    ownerProjects.push(nextProject);
  }

  return cloneProject(nextProject);
}

export function updateDevelopmentProject(
  ownerId: string,
  project: ResearchProject
): ResearchProject | null {
  const ownerProjects = getOwnerProjects(ownerId);
  const index = ownerProjects.findIndex((item) => item.id === project.id);
  if (index < 0) return null;

  const nextProject = cloneProject(project);
  ownerProjects[index] = nextProject;
  return cloneProject(nextProject);
}

export function deleteDevelopmentProject(ownerId: string, projectId: string) {
  const ownerProjects = getOwnerProjects(ownerId);
  const index = ownerProjects.findIndex((item) => item.id === projectId);
  if (index < 0) return false;

  ownerProjects.splice(index, 1);
  return true;
}

export function clearDevelopmentProjectStoreForTests() {
  projectsByOwner.clear();
}

function getOwnerProjects(ownerId: string) {
  const existing = projectsByOwner.get(ownerId);
  if (existing) return existing;

  const next: ResearchProject[] = [];
  projectsByOwner.set(ownerId, next);
  return next;
}

function cloneProject(project: ResearchProject): ResearchProject {
  return structuredClone(project);
}
