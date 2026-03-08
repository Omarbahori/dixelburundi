import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import AdminLoginClient from "@/app/admin/AdminLoginClient";
import { isAdminAuthedFromNextHeaders } from "@/lib/adminAuth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin | DIXEL",
  description: "Admin login",
};

export default async function AdminPage() {
  if (await isAdminAuthedFromNextHeaders()) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="relative py-12 sm:py-16 surface-dark">
      <Container>
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                ADMIN
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tighter2 sm:text-6xl">
                Sign in.
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/75">
                This admin edits your site content stored on the server. Changes
                apply immediately.
              </p>
            </div>

            <Reveal className="lg:col-span-7" delay={0.05}>
              <div className="rounded-3xl border border-white/10 bg-white/4 p-8 shadow-panel">
                <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                  LOGIN
                </div>
                <div className="mt-6">
                  <AdminLoginClient />
                </div>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
