import React from "react";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import InstagramKpiRow from "@/components/InstagramKpiRow";
import AudienceDemographics from "@/components/AudienceDemographics";
import InstagramTopPosts from "@/components/InstagramTopPosts";
import PartnershipOpportunities from "@/components/PartnershipOpportunities";

export default function IndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />

      <main className="mx-auto max-w-content px-6 pb-20 sm:px-8">
        <section className="pt-10 sm:pt-14">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
            <AboutSection />
          </div>
        </section>

        <section className="mt-6">
          <InstagramKpiRow />
        </section>

        <section className="mt-8">
          <AudienceDemographics />
        </section>

        <section className="mt-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-pink-500/80" />
              <h3 className="text-sm font-semibold text-neutral-800">
                Top Performing Instagram Posts
              </h3>
            </div>
            <InstagramTopPosts />
          </div>
        </section>

        <section className="mt-8">
          <PartnershipOpportunities />
        </section>
      </main>
    </div>
  );
}
