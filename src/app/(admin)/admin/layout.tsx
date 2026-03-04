import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[#3533cd]/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-black/40 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <AdminSidebar />

        <main className="flex-1 p-6 md:p-10">
          <div className="mx-auto max-w-6xl">
            <AdminTopbar />

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-7">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}