"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Loader2 } from "lucide-react";

interface IBusiness {
  id: string;
  name: string;
  plan: string;
}

export default function SettingsPage() {
  const [business, setBusiness] = useState<IBusiness | null>(null);
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/business")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.business) {
          setBusiness(data.business);
          setBusinessName(data.business.name);
        }
      })
      .finally(() => setLoading(false));

    import("@/lib/supabase-browser").then(({ getSupabaseBrowser }) => {
      const supabase = getSupabaseBrowser();
      supabase.auth.getUser().then(({ data }) => {
        setEmail(data.user?.email ?? "");
      });
    });
  }, []);

  async function handleSave() {
    if (!business || businessName.trim() === business.name) return;

    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/dashboard/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: businessName.trim() }),
    });

    const data = await res.json();

    if (data.success) {
      setBusiness({ ...business, name: businessName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    setSaving(false);
  }

  function planVariant(plan: string) {
    switch (plan) {
      case "pro":
        return "default" as const;
      case "enterprise":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and business settings
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-4" />
            Account
          </CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Plan</Label>
            <div>
              <Badge variant={planVariant(business?.plan ?? "free")}>
                {(business?.plan ?? "free").toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business */}
      <Card>
        <CardHeader>
          <CardTitle>Business</CardTitle>
          <CardDescription>
            Your business name appears in chatbot conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="business-name">Business name</Label>
            <Input
              id="business-name"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                setSaved(false);
              }}
              placeholder="My Business"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={
                saving || !businessName.trim() || businessName.trim() === business?.name
              }
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
            {saved && (
              <span className="text-sm text-green-600">Saved!</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
