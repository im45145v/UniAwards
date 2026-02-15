"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export function SettingsManager() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email_allowlist_enabled: "false",
    email_allowlist_regex: ".*@university\\.edu$",
    email_allowlist_message: "Access is currently limited to university students. Please use your university email address to sign in.",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .in("key", ["email_allowlist_enabled", "email_allowlist_regex", "email_allowlist_message"])
        .order("key");

      if (error) throw error;

      setSettings(data || []);
      
      // Populate form data
      const newFormData: any = {};
      data?.forEach((setting) => {
        newFormData[setting.key] = setting.value;
      });
      setFormData((prev) => ({ ...prev, ...newFormData }));
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const supabase = createClient();
      
      // Update each setting
      const updates = Object.entries(formData).map(([key, value]) =>
        supabase
          .from("settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key)
      );

      const results = await Promise.all(updates);
      const hasError = results.some((result) => result.error);

      if (hasError) {
        throw new Error("Failed to update some settings");
      }

      setMessage("✓ Settings saved successfully");
      fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("✗ Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const testRegex = () => {
    const testEmail = prompt("Enter an email address to test:");
    if (!testEmail) return;

    try {
      const regex = new RegExp(formData.email_allowlist_regex, "i");
      const isMatch = regex.test(testEmail);
      
      if (isMatch) {
        alert(`✓ Email "${testEmail}" matches the pattern and would be ALLOWED.`);
      } else {
        alert(`✗ Email "${testEmail}" does NOT match the pattern and would be REJECTED.`);
      }
    } catch (error) {
      alert("Invalid regex pattern. Please fix the pattern before testing.");
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  const isEnabled = formData.email_allowlist_enabled === "true";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-neutral-600">
          Configure email allowlist and access restrictions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Access Control</CardTitle>
          <CardDescription>
            Restrict who can register and login based on their email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <Label htmlFor="enabled" className="text-base font-semibold">
                Enable Email Allowlist
              </Label>
              <p className="mt-1 text-sm text-neutral-600">
                When enabled, only emails matching the regex pattern can register or login
              </p>
            </div>
            <Button
              id="enabled"
              variant={isEnabled ? "default" : "outline"}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  email_allowlist_enabled: isEnabled ? "false" : "true",
                }))
              }
            >
              {isEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {/* Regex Pattern */}
          <div className="space-y-2">
            <Label htmlFor="regex">Email Pattern (Regex)</Label>
            <div className="flex gap-2">
              <Input
                id="regex"
                value={formData.email_allowlist_regex}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email_allowlist_regex: e.target.value,
                  }))
                }
                placeholder=".*@university\.edu$"
                className="font-mono text-sm"
              />
              <Button variant="outline" onClick={testRegex}>
                Test
              </Button>
            </div>
            <p className="text-xs text-neutral-500">
              Examples:
              <br />• <code>.*@university\.edu$</code> - Only @university.edu emails
              <br />• <code>.*@(university|college)\.edu$</code> - Multiple domains
              <br />• <code>^student.*@university\.edu$</code> - Emails starting with "student"
            </p>
          </div>

          {/* Rejection Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Rejection Message</Label>
            <Textarea
              id="message"
              value={formData.email_allowlist_message}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  email_allowlist_message: e.target.value,
                }))
              }
              placeholder="Message shown to users with non-allowed emails"
              rows={3}
            />
            <p className="text-xs text-neutral-500">
              This friendly message will be shown to users whose email doesn't match the pattern
            </p>
          </div>

          {/* Message Preview */}
          {isEnabled && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Preview:</p>
              <p className="mt-2 text-sm text-amber-800">
                {formData.email_allowlist_message}
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4">
            {message && (
              <p
                className={`text-sm ${
                  message.startsWith("✓") ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="ml-auto"
              size="lg"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
