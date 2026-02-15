import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { allowed: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get allowlist settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["email_allowlist_enabled", "email_allowlist_regex", "email_allowlist_message"]);

    if (settingsError) {
      console.error("Settings error:", settingsError);
      // If we can't fetch settings, allow by default (fail open)
      return NextResponse.json({ allowed: true });
    }

    const settingsMap = new Map(settings?.map((s) => [s.key, s.value]) || []);
    const enabled = settingsMap.get("email_allowlist_enabled") === "true";

    // If allowlist is disabled, allow all emails
    if (!enabled) {
      return NextResponse.json({ allowed: true });
    }

    const regexPattern = settingsMap.get("email_allowlist_regex") || ".*";
    const message = settingsMap.get("email_allowlist_message") || 
      "Access is currently limited. Please contact an administrator.";

    // Test email against regex
    try {
      const regex = new RegExp(regexPattern, "i");
      const isAllowed = regex.test(email);

      if (isAllowed) {
        return NextResponse.json({ allowed: true });
      } else {
        return NextResponse.json({ 
          allowed: false, 
          message 
        });
      }
    } catch (regexError) {
      console.error("Invalid regex pattern:", regexError);
      // If regex is invalid, allow by default (fail open)
      return NextResponse.json({ allowed: true });
    }
  } catch (error) {
    console.error("Email validation error:", error);
    // On error, allow by default (fail open)
    return NextResponse.json({ allowed: true });
  }
}
