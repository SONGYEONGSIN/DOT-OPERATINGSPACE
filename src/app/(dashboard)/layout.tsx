import { Sidebar } from "@/components/layout";
import { Header } from "@/components/layout";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { name: string; email: string; role: string; position: string | null; team: string; avatar_url: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("name, email, role, position, team, avatar_url")
      .eq("email", user.email!)
      .single();
    profile = data;

    // 마지막 접속 시간 업데이트
    await supabase
      .from("profiles")
      .update({ last_sign_in: new Date().toISOString() })
      .eq("email", user.email!);
  }

  // 프로필 이미지: profiles.avatar_url → auth user_metadata (Google OAuth picture)
  const avatarUrl = profile?.avatar_url
    || user?.user_metadata?.avatar_url
    || user?.user_metadata?.picture
    || null;

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar profile={profile ? { name: profile.name, email: profile.email, role: profile.role, position: profile.position, team: profile.team, avatarUrl } : undefined} />
      <Header />
      <main className="ml-64 pt-16 min-h-[calc(100vh-4rem)]">
        <div className="p-6">{children}</div>
      </main>
      <footer className="ml-64 border-t border-outline-variant/10 py-4 px-6">
        <p className="text-[11px] text-on-surface-variant text-center">&copy; {new Date().getFullYear()} Orchestrator System. All rights reserved.</p>
      </footer>
    </div>
  );
}
