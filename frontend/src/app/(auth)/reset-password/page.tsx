"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Lock, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/toast";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must contain at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must match"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFields = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFields>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetFields) => {
    if (!token) {
      toast({
        title: "Reset Failed",
        description: "Reset token is missing or invalid. Please request a new link.",
        type: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, data.password);
      toast({
        title: "Password Updated",
        description: "Your new password is now active. Redirecting to login...",
        type: "success",
      });
      router.push("/login");
    } catch (err: any) {
      toast({
        title: "Reset Failed",
        description: err?.message || "Something went wrong.",
        type: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glassmorphism w-full border-border/60">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center">
          Type your new password below to secure your account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className={`pl-10 ${errors.password ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
              />
            </div>
            {errors.password && (
              <span className="text-xs text-rose-500">{errors.password.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm New Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className={`pl-10 ${errors.confirmPassword ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
              />
            </div>
            {errors.confirmPassword && (
              <span className="text-xs text-rose-500">{errors.confirmPassword.message}</span>
            )}
          </div>

          <Button type="submit" variant="gradient" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <Link href="/login" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-semibold mx-auto transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
