import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to track orders and check out faster."
      footerText="New to Modun?"
      footerLinkLabel="Create an account"
      footerHref="/sign-up"
    >
      <LoginForm />
    </AuthCard>
  );
}
