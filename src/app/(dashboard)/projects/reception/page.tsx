import { createClient } from "@/lib/supabase/server";
import ProjectPage from "../_components/ProjectPage";
import type { ProjectTask, ProjectLog } from "../_components/types";

export default async function ReceptionPage() {
  const supabase = createClient();

  const [{ data: tasks }, { data: profileRows }, { data: logs }] = await Promise.all([
    supabase
      .from("project_tasks")
      .select("*")
      .eq("project", "reception")
      .order("sort_order"),
    supabase
      .from("profiles")
      .select("name")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("project_logs")
      .select("*")
      .eq("project", "reception")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <ProjectPage
      project="reception"
      tasks={(tasks ?? []) as ProjectTask[]}
      logs={(logs ?? []) as ProjectLog[]}
      profiles={(profileRows ?? []) as { name: string }[]}
      currentYear={2026}
    />
  );
}
