import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { WhySection } from "@/components/landing/why-section";
import { Footer } from "@/components/landing/footer";
import { HeroScene } from "@/components/three/hero-scene";

export default function LandingPage() {
  return (
    <main id="main-content" className="relative">
      <div className="aurora fixed inset-0 -z-20" aria-hidden="true" />
      <HeroScene />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <WhySection />
      <Footer />
    </main>
  );
}
