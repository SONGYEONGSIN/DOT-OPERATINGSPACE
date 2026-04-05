import { createClient } from "@/lib/supabase/server";
import ProjectPage from "../_components/ProjectPage";
import type { ProjectTask, ProjectLog } from "../_components/types";

export default async function K12Page() {
  const supabase = createClient();

  const [{ data: tasks }, { data: profileRows }, { data: logs }] = await Promise.all([
    supabase
      .from("project_tasks")
      .select("*")
      .eq("project", "k12")
      .order("sort_order"),
    supabase
      .from("profiles")
      .select("name")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("project_logs")
      .select("*")
      .eq("project", "k12")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <ProjectPage
      project="k12"
      tasks={(tasks ?? []) as ProjectTask[]}
      logs={(logs ?? []) as ProjectLog[]}
      profiles={(profileRows ?? []) as { name: string }[]}
      currentYear={2026}
    />
  );
}
