import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { UNIVERSITY_DOMAIN } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const email = data.user.email || "";
      const domain = email.split("@")[1] || "";
      const role = domain === UNIVERSITY_DOMAIN ? "voter" : "viewer";

      // Upsert user in the users table
      await supabase.from("users").upsert(
        { id: data.user.id, email, role },
        { onConflict: "email" }
      );

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
