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
  const [messageType, setMessageType] = useState<"info" | "success" | "error">("info");

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase(); // Normalize to lowercase

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    setIsSending(true);
    setMessage(null);
    setMessageType("info");

    try {
      // Check if email is allowed
      const checkResponse = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const checkResult = await checkResponse.json();

      if (!checkResult.allowed) {
        setMessage(checkResult.message || "This email address is not authorized.");
        setMessageType("error");
        setIsSending(false);
        return;
      }

      // Email is allowed, proceed with OTP
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error("OTP Error:", error);
        setMessage(error.message);
        setMessageType("error");
      } else {
        setEmail(trimmedEmail); // Store normalized email for verification
        setStep("otp");
        setMessage("Check your email for the 6-digit code.");
        setMessageType("success");
      }
    } catch (err) {
      console.error("Send OTP failed:", err);
      setMessage("Failed to send verification code. Please try again.");
      setMessageType("error");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedOtp = otp.trim();
    const trimmedEmail = email.trim().toLowerCase(); // Normalize to lowercase

    if (!trimmedOtp) {
      setMessage("Please enter the verification code.");
      setMessageType("error");
      return;
    }

    if (!trimmedEmail) {
      setMessage("Email is missing. Please start over.");
      setMessageType("error");
      setStep("email");
      return;
    }

    setIsSending(true);
    setMessage(null);
    setMessageType("info");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: trimmedOtp,
        type: "email",
      });

      if (error) {
        console.error("Verify OTP Error:", error);
        setMessage(error.message || "Invalid or expired code. Please try again.");
        setMessageType("error");
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
    } catch (err) {
      console.error("Verify OTP failed:", err);
      setMessage("Verification failed. Please try again.");
      setMessageType("error");
    } finally {
      setIsSending(false);
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
                  <div className="flex w-full gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={async () => {
                        setIsSending(true);
                        setMessage(null);
                        try {
                          const supabase = createClient();
                          const normalizedEmail = email.trim().toLowerCase();
                          const { error } = await supabase.auth.signInWithOtp({
                            email: normalizedEmail,
                            options: {
                              shouldCreateUser: true,
                            },
                          });
                          if (error) {
                            setMessage(error.message);
                            setMessageType("error");
                          } else {
                            setMessage("New code sent! Check your email.");
                            setMessageType("success");
                          }
                        } catch (err) {
                          setMessage("Failed to resend code. Please try again.");
                          setMessageType("error");
                        } finally {
                          setIsSending(false);
                        }
                      }}
                      disabled={isSending}
                    >
                      Resend code
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setStep("email");
                        setOtp("");
                        setMessage(null);
                      }}
                    >
                      Change email
                    </Button>
                  </div>
                </form>
              </>
            )}
            {message ? (
              <div
                className={`rounded-lg border p-4 text-center text-sm ${
                  messageType === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : messageType === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-blue-200 bg-blue-50 text-blue-800"
                }`}
              >
                {message}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
