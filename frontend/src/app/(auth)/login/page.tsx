"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/toast";

const loginSchema = z.object({
  email: z.string().email("Please insert a valid email address"),
  password: z.string().min(6, "Password must contain at least 6 characters"),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setIsSubmitting(true);
    try {
      // Login via authService (simulates api and updates store)
      await authService.login(data.email, data.password);
      toast({
        title: "Welcome back!",
        description: "Authenticated successfully. Redirecting...",
        type: "success",
      });
      router.push("/");
    } catch (err: any) {
      toast({
        title: "Authentication Failed",
        description: err?.message || "Invalid credentials, please try again.",
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
          Sign In
        </CardTitle>
        <CardDescription className="text-center">
          Log in with your enterprise account credentials
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                {...register("email")}
                type="email"
                placeholder="name@company.com"
                className={`pl-10 ${errors.email ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-rose-500">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`pl-10 pr-10 ${errors.password ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-rose-500">{errors.password.message}</span>
            )}
          </div>

          <Button type="submit" variant="gradient" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground text-center">
          New to AI Workspace?{" "}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Create an Account
          </Link>
        </p>
        <div className="w-full flex items-center justify-between gap-2 my-2 text-[10px] text-muted-foreground">
          <div className="flex-1 h-[1px] bg-border" />
          <span>OR QUICK ACCESS</span>
          <div className="flex-1 h-[1px] bg-border" />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={async () => {
            setIsSubmitting(true);
            try {
              await authService.login("alex.rivera@workspace.ai", "Alex Rivera");
              toast({ title: "Quick Sign In Successful", type: "success" });
              router.push("/");
            } catch {
              toast({ title: "Quick Sign In Failed", type: "destructive" });
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          Demo Administrator Log In
        </Button>
      </CardFooter>
    </Card>
  );
}
