import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Auto-collapse on mobile
  // In a real app, you'd use a hook like useMediaQuery
  // For now, we'll keep it simple

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb */}
          
         <div className="mb-4">
  <span className="text-sm text-slate-500">
    Dashboard
  </span>
</div>
          {/* Page Content */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
