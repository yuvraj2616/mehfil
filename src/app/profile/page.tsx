"use client";

import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, MapPin, Mail, Phone, Edit3, Save, X } from "lucide-react";
import { fetchAPIClient } from "@/lib/api-client";

export default function ProfilePage() {
  const { data: user, isLoading, refetch } = useUser();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    phone: "",
    city: "",
    state: "",
    country: "",
  });

  function startEditing() {
    if (!user) return;
    setForm({
      name: user.name || "",
      bio: user.bio || "",
      phone: user.phone || "",
      city: user.city || "",
      state: user.state || "",
      country: user.country || "",
    });
    setEditing(true);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    // Get the session token from Supabase auth to send to backend
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || null;

    const result = await fetchAPIClient("/profiles/me", token, {
      method: "PUT",
      body: JSON.stringify(form),
    });

    if (result?.error) {
      toast.error("Failed to update profile: " + result.error);
    } else {
      toast.success("Profile updated successfully!");
      setEditing(false);
      refetch();
    }
    setSaving(false);
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="bg-card/50 border-border/40 overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-[#7B2FFF]/20 via-[#00D4FF]/15 to-[#7B2FFF]/10" />

          <CardContent className="p-6 -mt-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-[#7B2FFF]/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#7B2FFF] to-[#00D4FF] text-white text-2xl font-bold">
                  {user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{user.name || "Unnamed User"}</h1>
                  <Badge className="bg-[#7B2FFF]/10 text-[#00D4FF] border-[#7B2FFF]/20 capitalize">
                    {user.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                {(user.city || user.state || user.country) && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {[user.city, user.state, user.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>

              {!editing && (
                <Button variant="outline" onClick={startEditing} className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {user.bio && !editing && (
              <>
                <Separator className="my-6 opacity-50" />
                <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        {editing && (
          <Card className="bg-card/50 border-border/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-[#00D4FF]" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="bg-background/50 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-[#7B2FFF] to-[#00D4FF] text-white hover:opacity-90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile details (read-only) */}
        {!editing && (
          <Card className="bg-card/50 border-border/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-[#00D4FF]" />
                Profile Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {user.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {user.phone || "Not set"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
                  <p className="text-sm flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {[user.city, user.state, user.country].filter(Boolean).join(", ") || "Not set"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Member Since</p>
                  <p className="text-sm">
                    {new Date(user.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
