import { requireRole } from "@/lib/auth/guards";
import { StaffHeader } from "@/components/staff-header";
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav";
import { AdminRealtime } from "@/components/admin/admin-realtime";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await requireRole(["ADMIN", "ATENCION"]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <StaffHeader
        title="Panel administrativo"
        name={staff.full_name}
        role={staff.role}
        actions={<AdminRealtime />}
      />
      <div className="flex-1 pb-20">{children}</div>
      <AdminBottomNav role={staff.role} />
    </div>
  );
}
