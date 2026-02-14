"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    const supabase = createClient();
    setIsSending(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setMessage(error.message);
      setIsSending(false);
    } else {
      setStep("otp");
      setMessage("Check your email for the 6-digit code.");
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      setMessage("Please enter the verification code.");
      return;
    }

    const supabase = createClient();
    setIsSending(true);
    setMessage(null);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: trimmedOtp,
      type: "email",
    });

    if (error) {
      setMessage(error.message);
      setIsSending(false);
    } else if (data.user) {
      // User is authenticated, check if user exists first
      const userEmail = data.user.email || "";
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();
      
      // Only insert if user doesn't exist (don't overwrite existing role)
      if (!existingUser) {
        await supabase.from("users").insert({
          id: data.user.id,
          email: userEmail,
          role: "voter",
        });
      }
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">🏆 UniAwards</CardTitle>
            <CardDescription className="text-base">
              University Yearbook Awards Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {step === "email" ? (
              <>
                <p className="text-center text-sm text-neutral-500">
                  Sign in with your email to nominate, vote, and celebrate.
                </p>
                <form onSubmit={handleSendOtp} className="flex w-full flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isSending}>
                    {isSending ? "Sending..." : "Send verification code"}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <p className="text-center text-sm text-neutral-500">
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
                <form onSubmit={handleVerifyOtp} className="flex w-full flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      autoComplete="one-time-code"
                      placeholder="123456"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isSending}>
                    {isSending ? "Verifying..." : "Verify and sign in"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setMessage(null);
                    }}
                  >
                    Use different email
                  </Button>
                </form>
              </>
            )}
            {message ? (
              <p className="text-center text-sm text-neutral-500">{message}</p>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
