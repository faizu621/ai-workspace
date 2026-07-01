"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Settings, User, Paintbrush, Bell, Shield, Wallet, Link as LinkIcon,
  Globe, Loader2, Check, RefreshCw, KeyRound, Smartphone, Plus, Trash2
} from "lucide-react";
import { useAuthStore, UserProfile } from "@/store/authStore";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { useTheme } from "next-themes";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  github: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
});

type ProfileFields = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, generateApiKey, revokeApiKey, updateProfile } = useAuthStore();
  const { theme, setTheme } = useTheme();

  // Settings view states
  const [activeGroup, setActiveGroup] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiKeyName, setApiKeyName] = useState("");
  const [billingTier, setBillingTier] = useState("Pro");

  // Change Password state variables
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Validation Error", description: "All fields are required.", type: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Validation Error", description: "New password must be at least 6 characters.", type: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Validation Error", description: "Passwords do not match.", type: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast({ title: "Password Changed", description: "Your password has been updated successfully.", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: "Change Failed",
        description: err?.response?.data?.error || err?.message || "Failed to change password.",
        type: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Notifications state variables
  const [notifPreferences, setNotifPreferences] = useState({
    emailAlerts: true,
    desktopAlerts: true,
    slackAlerts: false,
    aiDigest: true
  });

  // Integrations state variables
  const [integrations, setIntegrations] = useState({
    github: true,
    slack: true,
    notion: false,
    jira: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      github: user?.socialLinks?.github || "",
      twitter: user?.socialLinks?.twitter || "",
      linkedin: user?.socialLinks?.linkedin || "",
    },
  });

  if (!user) return null;

  const handleProfileSubmit = async (data: ProfileFields) => {
    setIsSubmitting(true);
    try {
      await userService.updateProfile({
        name: data.name,
        email: data.email,
        socialLinks: {
          github: data.github,
          twitter: data.twitter,
          linkedin: data.linkedin,
        }
      });
      toast({ title: "Profile Saved", description: "Your details have been updated successfully.", type: "success" });
    } catch {
      toast({ title: "Failed to update profile", type: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyName.trim()) return;
    try {
      await userService.generateApiKey(apiKeyName);
      setApiKeyName("");
      toast({ title: "API Key Generated", description: "Successfully created API credential key.", type: "success" });
    } catch {
      toast({ title: "Generation failed", type: "destructive" });
    }
  };

  const handleRevokeKey = async (id: string, name: string) => {
    if (confirm(`Revoke key '${name}'?`)) {
      await userService.revokeApiKey(id);
      toast({ title: "API Key Revoked", type: "destructive" });
    }
  };

  const settingsTabs = [
    { id: "profile", label: "General Info", icon: User },
    { id: "appearance", label: "Appearance", icon: Paintbrush },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Keys", icon: Shield },
    { id: "billing", label: "Billing & Plans", icon: Wallet },
    { id: "integrations", label: "Integrations", icon: LinkIcon },
    { id: "language", label: "Language", icon: Globe }
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground">Manage profile layouts, api credentials, integrations, and preferences</p>
      </div>

      {/* SEGMENTED LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT TABBED NAVIGATION CONTROLS */}
        <div className="lg:col-span-1">
          <Card className="border-border/80 p-2 space-y-1">
            {settingsTabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveGroup(tab.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold hover:bg-muted text-left transition-colors ${
                    activeGroup === tab.id ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TabIcon className="h-4.5 w-4.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </Card>
        </div>

        {/* RIGHT DETAILS CONTAINER CARDS */}
        <div className="lg:col-span-3">
          
          {/* 1. PROFILE DETAILS */}
          {activeGroup === "profile" && (
            <Card className="border-border/80 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-sm font-bold">General Profile Information</CardTitle>
                <CardDescription className="text-xs">Setup avatar, contact data, and links profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                      <Input
                        {...register("name")}
                        className={errors.name ? "border-rose-500" : ""}
                      />
                      {errors.name && <span className="text-xs text-rose-500">{errors.name.message}</span>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                      <Input
                        {...register("email")}
                        className={errors.email ? "border-rose-500" : ""}
                      />
                      {errors.email && <span className="text-xs text-rose-500">{errors.email.message}</span>}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t">
                    <h4 className="font-bold text-foreground">Social Link Coordinates</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-muted-foreground">GitHub Profile</label>
                        <Input {...register("github")} placeholder="github.com/username" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-muted-foreground">Twitter handle</label>
                        <Input {...register("twitter")} placeholder="twitter.com/username" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-muted-foreground">LinkedIn</label>
                        <Input {...register("linkedin")} placeholder="linkedin.com/in/username" />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" variant="gradient" className="h-9 font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Profile Details"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* 2. APPEARANCE CONFIGURATION */}
          {activeGroup === "appearance" && (
            <Card className="border-border/80 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Theme and Layout Styling</CardTitle>
                <CardDescription className="text-xs">Configure how dark mode and animations present in workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <span className="font-semibold text-foreground block">Workspace Palette Theme</span>
                    <span className="text-[10px] text-muted-foreground">Toggle dark or light styles across tables and dashboards</span>
                  </div>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="h-9 border border-input rounded-xl bg-background text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-ring font-semibold text-muted-foreground w-36"
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-foreground block">Framer Motion Effects</span>
                    <span className="text-[10px] text-muted-foreground">Reduce screen animations or page transitions</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 font-bold">
                    Enabled
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. NOTIFICATIONS TOGGLES */}
          {activeGroup === "notifications" && (
            <Card className="border-border/80 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Alert and Toast Preferences</CardTitle>
                <CardDescription className="text-xs">Select what platform changes emit email warnings or dashboard alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                    <div>
                      <span className="font-semibold text-foreground block">Email Notifications</span>
                      <span className="text-[10px] text-muted-foreground">Receive daily digests on project milestones</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPreferences.emailAlerts}
                      onChange={(e) => setNotifPreferences({ ...notifPreferences, emailAlerts: e.target.checked })}
                      className="h-4.5 w-4.5 accent-primary rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                    <div>
                      <span className="font-semibold text-foreground block">Desktop Push Alerts</span>
                      <span className="text-[10px] text-muted-foreground">Show native system popups on task allocations</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPreferences.desktopAlerts}
                      onChange={(e) => setNotifPreferences({ ...notifPreferences, desktopAlerts: e.target.checked })}
                      className="h-4.5 w-4.5 accent-primary rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                    <div>
                      <span className="font-semibold text-foreground block">Slack Channel Integration</span>
                      <span className="text-[10px] text-muted-foreground">Post activity timelines directly to #engineering-logs</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPreferences.slackAlerts}
                      onChange={(e) => setNotifPreferences({ ...notifPreferences, slackAlerts: e.target.checked })}
                      className="h-4.5 w-4.5 accent-primary rounded cursor-pointer"
                    />
                  </div>
                </div>

                <Button onClick={() => toast({ title: "Preferences Updated", type: "success" })} variant="gradient" className="h-9 font-semibold">
                  Update Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 4. SECURITY & API KEYS */}
          {activeGroup === "security" && (
            <div className="space-y-6">
              {/* Change Password Panel */}
              <Card className="border-border/80 animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <KeyRound className="h-4.5 w-4.5 text-primary" /> Change Password
                  </CardTitle>
                  <CardDescription className="text-xs">Update your credentials to maintain account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-semibold">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Current Password</label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">New Password</label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="gradient" className="h-9 font-semibold" disabled={isChangingPassword}>
                      {isChangingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* API Keys Panel */}
              <Card className="border-border/80 animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <KeyRound className="h-4.5 w-4.5 text-primary" /> API keys Credentials
                  </CardTitle>
                  <CardDescription className="text-xs">Generate SDK development tokens to query workspace systems externally</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {/* Generated list */}
                  <div className="border rounded-lg bg-background divide-y">
                    {user.apiKeys.length === 0 ? (
                      <p className="p-4 text-center text-muted-foreground italic">No SDK keys active.</p>
                    ) : (
                      user.apiKeys.map((key) => (
                        <div key={key.id} className="flex justify-between items-center p-3 gap-3">
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground block">{key.name}</span>
                            <span className="font-mono text-[10px] text-muted-foreground block">{key.key}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[9px] text-muted-foreground">Created {key.createdAt}</span>
                            <button
                              onClick={() => handleRevokeKey(key.id, key.name)}
                              className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"
                              title="Revoke Key"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {/* Form to generate */}
                  <form onSubmit={handleCreateApiKey} className="flex gap-2 items-center">
                    <Input
                      value={apiKeyName}
                      onChange={(e) => setApiKeyName(e.target.value)}
                      placeholder="e.g. Analytics Webhook SDK"
                      className="h-9 text-xs flex-1"
                    />
                    <Button type="submit" size="sm" className="h-9 font-semibold gap-1">
                      <Plus className="h-4 w-4" /> Generate Key
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Sessions list */}
              <Card className="border-border/80 animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Smartphone className="h-4.5 w-4.5 text-blue-500" /> Active Session Registry
                  </CardTitle>
                  <CardDescription className="text-xs">Logged-in hardware browsers querying user configurations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3.5 text-xs">
                  {user.sessions.map((sess) => (
                    <div key={sess.id} className="flex justify-between items-start pb-3 border-b last:border-0 last:pb-0 gap-3">
                      <div>
                        <span className="font-semibold text-foreground block">{sess.device}</span>
                        <span className="text-[10px] text-muted-foreground block">
                          IP: {sess.ip} • Location: {sess.location}
                        </span>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        {sess.active ? (
                          <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 font-bold uppercase">
                            Active
                          </Badge>
                        ) : (
                          <span className="text-[9px] text-muted-foreground">Last active {sess.lastActive}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* 5. BILLING & PLANS */}
          {activeGroup === "billing" && (
            <Card className="border-border/80 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Billing Subscription Status</CardTitle>
                <CardDescription className="text-xs">Manage enterprise levels, billing scopes, and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pro Plan Card */}
                  <Card className={`p-4 border transition-all ${billingTier === "Pro" ? "border-primary bg-primary/5 ring-1 ring-primary" : ""}`}>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm block">Professional Tier</span>
                      <span className="text-lg font-extrabold text-foreground">$12<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                      For growing teams requiring enhanced AI caps (50k daily prompt tokens) and detailed widgets logs history.
                    </p>
                    <Button onClick={() => setBillingTier("Pro")} variant="outline" className="mt-4 w-full h-8 text-xs font-semibold">
                      {billingTier === "Pro" ? "Active Subscription" : "Activate Tier"}
                    </Button>
                  </Card>

                  {/* Enterprise Plan Card */}
                  <Card className={`p-4 border transition-all ${billingTier === "Enterprise" ? "border-primary bg-primary/5 ring-1 ring-primary" : ""}`}>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm block">Enterprise Team</span>
                      <span className="text-lg font-extrabold text-foreground">Custom</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                      Custom model fine-tuning, isolated DB instances, unlimited tokens, and standard SSO / SAML configurations.
                    </p>
                    <Button onClick={() => setBillingTier("Enterprise")} variant="outline" className="mt-4 w-full h-8 text-xs font-semibold">
                      {billingTier === "Enterprise" ? "Active Subscription" : "Upgrade to Enterprise"}
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 6. INTEGRATIONS */}
          {activeGroup === "integrations" && (
            <Card className="border-border/80 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Third-Party Platform Links</CardTitle>
                <CardDescription className="text-xs">Connect workspace systems to automate repository imports and notifications syncing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                    <div>
                      <span className="font-semibold text-foreground block">GitHub Repository Sync</span>
                      <span className="text-[10px] text-muted-foreground">Authorize pull request webhooks and file logs importing</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={integrations.github}
                      onChange={(e) => setIntegrations({ ...integrations, github: e.target.checked })}
                      className="h-4.5 w-4.5 accent-primary rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                    <div>
                      <span className="font-semibold text-foreground block">Slack Channels</span>
                      <span className="text-[10px] text-muted-foreground">Deliver automated alerts directly into Slack threads</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={integrations.slack}
                      onChange={(e) => setIntegrations({ ...integrations, slack: e.target.checked })}
                      className="h-4.5 w-4.5 accent-primary rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                    <div>
                      <span className="font-semibold text-foreground block">Notion Wiki Pages</span>
                      <span className="text-[10px] text-muted-foreground">Sync docs features with Notion databases</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={integrations.notion}
                      onChange={(e) => setIntegrations({ ...integrations, notion: e.target.checked })}
                      className="h-4.5 w-4.5 accent-primary rounded cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 7. LANGUAGE */}
          {activeGroup === "language" && (
            <Card className="border-border/80 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Locale and Language Settings</CardTitle>
                <CardDescription className="text-xs">Choose the language configuration for tool descriptions and widgets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-foreground block">Language Locale</span>
                    <span className="text-[10px] text-muted-foreground">Modify active dictionary parameters</span>
                  </div>
                  <select
                    className="h-9 border border-input rounded-xl bg-background text-xs px-2.5 focus:outline-none w-36 text-muted-foreground font-semibold"
                    defaultValue="en"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español (ES)</option>
                    <option value="fr">Français (FR)</option>
                    <option value="de">Deutsch (DE)</option>
                  </select>
                </div>
                <Button onClick={() => toast({ title: "Locale configuration updated", type: "success" })} variant="gradient" className="h-9 font-semibold">
                  Save Language Settings
                </Button>
              </CardContent>
            </Card>
          )}

        </div>

      </div>

    </div>
  );
}
