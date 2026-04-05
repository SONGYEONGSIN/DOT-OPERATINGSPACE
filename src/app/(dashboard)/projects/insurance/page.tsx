import { createClient } from "@/lib/supabase/server";
import ProjectPage from "../_components/ProjectPage";
import type { ProjectTask, ProjectLog } from "../_components/types";

export default async function InsurancePage() {
  const supabase = createClient();

  const [{ data: tasks }, { data: profileRows }, { data: logs }] = await Promise.all([
    supabase
      .from("project_tasks")
      .select("*")
      .eq("project", "insurance")
      .order("sort_order"),
    supabase
      .from("profiles")
      .select("name")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("project_logs")
      .select("*")
      .eq("project", "insurance")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <ProjectPage
      project="insurance"
      tasks={(tasks ?? []) as ProjectTask[]}
      logs={(logs ?? []) as ProjectLog[]}
      profiles={(profileRows ?? []) as { name: string }[]}
      currentYear={2026}
    />
  );
}
