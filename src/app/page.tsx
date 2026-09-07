import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingCta } from "@/components/landing/landing-cta";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingHeader />

      <LandingHero />

      <HowItWorks />

      <LandingCta />
    </main>
  );
}