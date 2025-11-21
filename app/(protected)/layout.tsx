// layout.tsx
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import AuthGuard from "@/components/AuthGuard";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <AdminPanelLayout>{children}</AdminPanelLayout>
    </AuthGuard>
  );
}
