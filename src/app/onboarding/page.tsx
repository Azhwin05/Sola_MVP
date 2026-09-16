import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/auth/session";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export const metadata = { title: "Set up your organization" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ctx = await getSessionContext();
  if (ctx) {
    redirect("/control-tower");
  }

  return <OnboardingForm email={user.email ?? ""} />;
}
