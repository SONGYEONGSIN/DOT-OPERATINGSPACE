import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 도메인 검증: @jinhakapply.com만 허용
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const email = user?.email ?? "";
      const domain = email.split("@")[1];

      if (domain !== "jinhakapply.com") {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=unauthorized_domain`,
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
