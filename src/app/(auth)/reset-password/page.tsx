import { Suspense } from "react";

import AuthLayout from "../auth-layout";
import ResetPasswordContent from "./components/reset-password-content";
export default function ResetPassword() {
  return (
    <AuthLayout>
      <Suspense fallback={<p>Loading...</p>}>
        <ResetPasswordContent></ResetPasswordContent>
      </Suspense>
    </AuthLayout>
  );
}
