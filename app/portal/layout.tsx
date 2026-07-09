import { Toaster } from 'sonner';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={true}
      />
      {children}
    </>
  );
}
