import { redirect } from "next/navigation";
import { isAdminAuthedFromNextHeaders } from "@/lib/adminAuth";
import AdminDashboardShell from "@/app/admin/dashboard/AdminDashboardShell";
import type { AdminView } from "@/app/admin/dashboard/DashboardClient";

const ALLOWED_VIEWS: AdminView[] = [
  "overview",
  "content",
  "services-content",
  "testimonials",
  "about-tools",
  "media",
  "clients",
  "works",
  "team",
  "packages",
  "json",
];

export const metadata = {
  title: "Admin Dashboard | DIXEL",
  description: "Manage DIXEL site content",
};

export default async function AdminDashboardViewPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  if (!(await isAdminAuthedFromNextHeaders())) {
    redirect("/admin");
  }

  const resolvedParams = await params;
  const view = resolvedParams.view?.toLowerCase();
  if (!ALLOWED_VIEWS.includes(view as AdminView)) {
    redirect("/admin/dashboard/overview");
  }

  return <AdminDashboardShell view={view as AdminView} />;
}
