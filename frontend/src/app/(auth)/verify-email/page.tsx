"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/toast";

const verifySchema = z.object({
  code: z.string().length(6, "Verification code must be exactly 6 characters"),
});

type VerifyFields = z.infer<typeof verifySchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFields>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: VerifyFields) => {
    setIsSubmitting(true);
    try {
      await authService.verifyEmail("alex.rivera@workspace.ai", data.code);
      toast({
        title: "Account verified!",
        description: "Your email has been confirmed. Redirecting to login...",
        type: "success",
      });
      router.push("/login");
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err?.message || "Invalid code. Please try again.",
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
          Verify Email
        </CardTitle>
        <CardDescription className="text-center">
          We've sent a 6-digit confirmation code to your email
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
              Verification Code
              <span className="text-[10px] text-muted-foreground lowercase">e.g. 123456</span>
            </label>
            <div className="relative">
              <ShieldAlert className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                {...register("code")}
                type="text"
                maxLength={6}
                placeholder="123456"
                className={`pl-10 tracking-widest text-center text-lg font-bold ${errors.code ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
              />
            </div>
            {errors.code && (
              <span className="text-xs text-rose-500">{errors.code.message}</span>
            )}
          </div>

          <Button type="submit" variant="gradient" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Confirm Code"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => toast({ title: "Code Resent", description: "A new code has been sent to your email address.", type: "success" })}
          className="text-xs text-primary hover:underline font-semibold"
        >
          Resend verification email
        </button>
        <Link href="/login" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-semibold mt-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
