import Script from 'next/script';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AuthGuard from '@/contexts/AuthGuard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthGuard>
        <Script
          src='https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js'
          strategy='beforeInteractive'
        />
        <SidebarProvider defaultOpen={true}>
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </AuthGuard>
    </>
  );
}
