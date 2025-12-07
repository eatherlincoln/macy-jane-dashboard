import React from "react";
import AuthGate from "@/components/admin/AuthGate";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsForm from "@/components/admin/StatsForm";
import AudienceForm from "@/components/admin/AudienceForm";
import TopPostsForm from "@/components/admin/TopPostsForm";
import BrandAssetsForm from "@/components/admin/BrandAssetsForm";

export default function AdminPage() {
  return (
    <AuthGate>
      <AdminLayout title="Macy Jane (Instagram only)">
        <div className="space-y-8">
          <BrandAssetsForm />
          <StatsForm />
          <AudienceForm />
          <TopPostsForm />
        </div>
      </AdminLayout>
    </AuthGate>
  );
}
