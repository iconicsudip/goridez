import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Server-side safety net — proxy.ts is the primary guard
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-body selection:bg-green-600 selection:text-black">
      <AdminSidebar adminName={session.user?.name || 'Admin'} adminEmail={session.user?.email || ''} />
      <main className="flex-1 p-8 h-screen overflow-y-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
