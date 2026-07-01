"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/toast";

const forgotSchema = z.object({
  email: z.string().email("Please insert a valid email address"),
});

type ForgotFields = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFields>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotFields) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      toast({
        title: "Link dispatched",
        description: "Password reset link sent successfully.",
        type: "success",
      });
      setIsSent(true);
    } catch (err: any) {
      toast({
        title: "Dispatched Failed",
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
          Forgot Password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isSent ? (
          <div className="text-center space-y-4 py-4 animate-slide-up">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Send className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Reset Link Dispatched</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a recovery email. Please check your inbox and click the link to reset your password.
              </p>
            </div>
          </div>
        ) : (
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

            <Button type="submit" variant="gradient" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter>
        <Link href="/login" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-semibold mx-auto transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
