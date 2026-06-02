import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import {
  createDevelopmentProject,
  isDevelopmentProjectStoreEnabled,
  listDevelopmentProjects,
} from "@/lib/development-project-store";
import {
  projectFromRow,
  projectToInsertRow,
  sanitizeProjectPayload,
} from "@/lib/project-records";
import { getRequestUserId } from "@/lib/server-auth";

function jsonError(error: string, status: number, code: string) {
  return Response.json({ error, code }, { status });
}

export async function GET() {
  try {
    const userId = await getRequestUserId();
    if (!userId) return jsonError("Unauthorized", 401, "unauthorized");

    if (isDevelopmentProjectStoreEnabled()) {
      return Response.json({ projects: listDevelopmentProjects(userId) });
    }

    const rows = await getDb()
      .select()
      .from(projects)
      .where(eq(projects.ownerId, userId))
      .orderBy(desc(projects.createdAt));

    return Response.json({ projects: rows.map(projectFromRow) });
  } catch (error) {
    console.error("Projects API error:", error);
    return jsonError("Internal server error", 500, "internal_error");
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequestUserId();
    if (!userId) return jsonError("Unauthorized", 401, "unauthorized");

    const body = await request.json();
    const project = sanitizeProjectPayload(body.project);
    if (!project) return jsonError("Invalid project data", 400, "invalid_project");

    if (isDevelopmentProjectStoreEnabled()) {
      return Response.json(
        { project: createDevelopmentProject(userId, project) },
        { status: 201 }
      );
    }

    const [row] = await getDb()
      .insert(projects)
      .values(projectToInsertRow(project, userId))
      .returning();

    return Response.json({ project: projectFromRow(row) }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return jsonError("Internal server error", 500, "internal_error");
  }
}
