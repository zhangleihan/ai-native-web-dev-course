import { airoDataset } from './airo';
import { gridDataset } from './grid';
import { telecomDataset } from './telecom';
import type { ProjectDataset } from './schema';

export * from './schema';

export const datasets: Record<string, ProjectDataset> = {
  [telecomDataset.project.id]: telecomDataset,
  [gridDataset.project.id]: gridDataset,
  [airoDataset.project.id]: airoDataset,
};

export const projectList = [telecomDataset.project, gridDataset.project, airoDataset.project];

export const DEFAULT_PROJECT_ID = telecomDataset.project.id;

export function getDataset(projectId?: string | null): ProjectDataset {
  if (projectId && datasets[projectId]) return datasets[projectId];
  return datasets[DEFAULT_PROJECT_ID];
}

export function projectIdFromCase(caseId: string): string | null {
  const hit = projectList.find((p) => p.caseId === caseId);
  return hit ? hit.id : null;
}
