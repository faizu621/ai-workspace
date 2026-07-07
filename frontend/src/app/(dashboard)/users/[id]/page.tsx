"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Shield, User, Globe, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { userService } from "@/services/userService";
import { toast } from "@/components/ui/toast";

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadPublicProfile() {
      try {
        const u = await userService.getUserById(userId);
        setProfile(u);
      } catch (err: any) {
        console.error("Failed to load profile by ID", err);
        toast({
          title: "Profile Not Found",
          description: "Could not fetch user profile details.",
          type: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    if (userId) {
      loadPublicProfile();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-10 space-y-6 max-w-3xl text-center">
        <User className="mx-auto h-16 w-16 text-slate-500" />
        <h2 className="text-xl font-bold text-white mt-4">Profile not found</h2>
        <p className="text-slate-400">The requested user profile does not exist or has been deleted.</p>
        <div className="pt-4">
          <Link href="/users">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Back to Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6 max-w-3xl">
      {/* Back link */}
      <div>
        <Link href="/users">
          <Button variant="ghost" className="text-slate-400 hover:text-white flex items-center gap-1.5 pl-0">
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Button>
        </Link>
      </div>

      {/* Main Profile Info Card */}
      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
        {/* Banner area */}
        <div className="h-32 w-full bg-gradient-to-r from-indigo-950 to-slate-900 border-b border-slate-800" />
        
        <CardContent className="relative pt-0 px-6 pb-8 space-y-6">
          {/* Avatar Container */}
          <div className="absolute -top-16 left-6 w-28 h-28 rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800 shadow-xl flex items-center justify-center">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-slate-400" />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-4 gap-3">
            <Link href="/chat">
              <Button className="bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-xs h-9">
                <MessageSquare className="w-4 h-4" />
                Send Message
              </Button>
            </Link>
          </div>

          {/* Profile identity info */}
          <div className="pt-2 space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
              <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase bg-indigo-950/40 px-2 py-0.5 rounded">
                {profile.role || "MEMBER"}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {profile.email}
              </span>
              
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                {profile.emailVerified ? "Verified Email" : "Pending Verification"}
              </span>
            </div>
          </div>

          {/* Biography Details */}
          <div className="border-t border-slate-800/80 pt-6 space-y-3">
            <h4 className="text-sm font-semibold tracking-wide text-slate-200 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" />
              About Me
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {profile.bio || "This user hasn't written a biography yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
