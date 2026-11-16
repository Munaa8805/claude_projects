import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Save addresses, see order history and keep a wishlist."
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerHref="/sign-in"
    >
      <RegisterForm />
    </AuthCard>
  );
}
