"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/toast";

const registerSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please insert a valid email address"),
    password: z.string().min(6, "Password must contain at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must match"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFields = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFields) => {
    setIsSubmitting(true);
    try {
      await authService.register(data.name, data.email, data.password);
      toast({
        title: "Registration successful!",
        description: "Account created. A verification code has been dispatched.",
        type: "success",
      });
      router.push("/");
    } catch (err: any) {
      toast({
        title: "Account Creation Failed",
        description: err?.message || "Something went wrong, please try again.",
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
          Create Account
        </CardTitle>
        <CardDescription className="text-center">
          Sign up for a new personal or enterprise workspace
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                {...register("name")}
                type="text"
                placeholder="Alex Rivera"
                className={`pl-10 ${errors.name ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
              />
            </div>
            {errors.name && (
              <span className="text-xs text-rose-500">{errors.name.message}</span>
            )}
          </div>

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
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
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

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                {...register("confirmPassword")}
                type={showPassword ? "text" : "password"}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
