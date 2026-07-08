"use client";

import { motion } from "framer-motion";
import { SectionContainer, SectionHeader } from "@/components/ui/section";
import { FeatureCard } from "@/components/ui/cards";
import { FEATURES } from "@/lib/constants";
import { ICON_MAP } from "@/components/ui/icons";
import { staggerItem } from "@/lib/animations/variants";

export function FeaturesSection() {
  return (
    <SectionContainer id="features" withGradient>
      <SectionHeader
        label="Features"
        title="Everything You Need to Succeed"
        description="A complete suite of AI-powered tools designed to give you an unfair advantage in every interview."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => {
          const IconComponent = ICON_MAP[feature.icon];
          return (
            <motion.div key={feature.id} variants={staggerItem}>
              <FeatureCard
                icon={IconComponent ? <IconComponent size={24} /> : null}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
              />
            </motion.div>
          );
        })}
      </div>
    </SectionContainer>
  );
}
