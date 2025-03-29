"use client";

import { ResetForm } from "./reset-password-form";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid or missing reset token.");
        setIsValidating(false);
        return;
      }

      try {
        setTokenValid(token.length > 0);

        if (token.length === 0) {
          setError("Your password reset link is invalid or has expired.");
        }
      } catch (err) {
        setError("An error occurred while validating your reset link.");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col space-y-2 text-left">
        <h1 className="text-xl font-semibold tracking-tight">Reset Password</h1>

        {isValidating ? (
          <p className="text-sm text-muted-foreground">
            Verifying your reset link...
          </p>
        ) : tokenValid ? (
          <>
            <p className="text-sm text-muted-foreground">
              Create a new password for your account
            </p>
            {token && <ResetForm token={token} />}
          </>
        ) : (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-center text-muted-foreground">
                Need a new password reset link?
              </p>
              <Link href="/forgot-password">
                <Button variant="outline">Request New Link</Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/sign-in"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
