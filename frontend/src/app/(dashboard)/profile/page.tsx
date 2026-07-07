"use client";

import React, { useState, useEffect } from "react";
import { Loader2, User, FileText, ImageIcon, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    bio: "",
    avatarUrl: "",
    emailVerified: false
  });

  // Load profile from user-service
  useEffect(() => {
    async function loadProfile() {
      try {
        const u = await userService.getProfile();
        if (u) {
          setProfile({
            name: u.name || "",
            email: u.email || "",
            role: u.role || "MEMBER",
            bio: (u as any).bio || "",
            avatarUrl: u.avatar || "",
            emailVerified: true
          });
        }
      } catch (err: any) {
        console.error("Failed to load profile", err);
        toast({
          title: "Error",
          description: "Could not fetch profile details from server.",
          type: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await userService.updateProfile({
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatarUrl
      });
      
      toast({
        title: "Profile Updated",
        description: "Your bio, name, and profile details have been saved.",
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err?.response?.data?.error || err?.message || "Something went wrong updating your profile.",
        type: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your display name, workspace avatar, and personal bio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Avatar Preview */}
        <Card className="bg-slate-900 border-slate-800 text-white md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 flex items-center justify-center">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-16 h-16 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{profile.name}</h3>
              <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase mt-1">
                {profile.role}
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              {profile.emailVerified ? "Verified Account" : "Unverified"}
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Edit Form */}
        <Card className="bg-slate-900 border-slate-800 text-white md:col-span-2">
          <form onSubmit={handleFormSubmit}>
            <CardHeader>
              <CardTitle>Edit Account Info</CardTitle>
              <CardDescription className="text-slate-400">
                This info will be visible to your team members in the directory.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Email (Read Only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address (Read-only)</label>
                <div className="relative">
                  <Input 
                    type="email" 
                    value={profile.email} 
                    disabled 
                    className="bg-slate-950 border-slate-800 text-slate-500 disabled:opacity-100" 
                  />
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <Input 
                  name="name" 
                  value={profile.name} 
                  onChange={handleInputChange} 
                  required
                  placeholder="Enter your name" 
                  className="bg-slate-950 border-slate-800 focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>

              {/* Avatar URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  Avatar Image URL
                </label>
                <Input 
                  name="avatarUrl" 
                  value={profile.avatarUrl} 
                  onChange={handleInputChange} 
                  placeholder="https://example.com/avatar.jpg" 
                  className="bg-slate-950 border-slate-800 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Biography
                </label>
                <textarea 
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about yourself..." 
                  className="w-full rounded-md bg-slate-950 border border-slate-800 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm text-white placeholder-slate-500 focus:outline-none" 
                />
              </div>
            </CardContent>

            <CardFooter className="border-t border-slate-800/50 pt-6 flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
