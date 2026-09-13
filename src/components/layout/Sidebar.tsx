import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, Tags,
  Users, Truck, ClipboardList, RotateCcw, Receipt,
  Banknote, Store, BarChart3, Settings, ChevronLeft, ChevronRight,
  LogOut, User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'POS', path: '/pos', icon: ShoppingCart },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Inventory', path: '/inventory', icon: Warehouse },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Suppliers', path: '/suppliers', icon: Truck },
  { name: 'Purchase Orders', path: '/purchase-orders', icon: ClipboardList },
  { name: 'Returns', path: '/returns', icon: RotateCcw },
  { name: 'Refunds', path: '/refunds', icon: Receipt },
  { name: 'Till', path: '/till', icon: Banknote },
  { name: 'Stores', path: '/stores', icon: Store },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "bg-[#0F172A] text-slate-200 flex flex-col h-screen border-r border-[#1E293B] transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo / Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1E293B]">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0176D3] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OS</span>
            </div>
            <span className="font-semibold text-white text-lg">OneStoreSolution</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-[#0176D3] rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">OS</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-[#1E293B] text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm rounded-md mx-2 transition-all duration-200",
                    isActive
                      ? "bg-[#0176D3] text-white"
                      : "text-slate-300 hover:bg-[#1E293B] hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-[#1E293B] p-2">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-md hover:bg-[#1E293B] transition-colors">
            <User className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{user.full_name || user.username}</p>
              <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm rounded-md mx-2 text-slate-300 hover:bg-[#DC2626]/20 hover:text-[#FCA5A5] transition-all duration-200",
            collapsed && "justify-center mx-auto"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
