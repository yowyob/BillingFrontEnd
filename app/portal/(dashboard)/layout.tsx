import PortalSidebar from "../PortalSidebar";
import PortalAuthGuard from "../PortalAuthGuard";

export default function PortalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalAuthGuard>
      <div className="flex h-screen overflow-hidden bg-secondary-background">
        <PortalSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">{children}</div>
        </main>
      </div>
    </PortalAuthGuard>
  );
}
