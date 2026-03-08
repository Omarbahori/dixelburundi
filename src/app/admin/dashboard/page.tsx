import { redirect } from "next/navigation";
import { isAdminAuthedFromNextHeaders } from "@/lib/adminAuth";

export const metadata = {
  title: "Admin Dashboard | DIXEL",
  description: "Edit site content",
};

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthedFromNextHeaders())) {
    redirect("/admin");
  }
  redirect("/admin/dashboard/overview");
}
