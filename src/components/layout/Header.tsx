import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Store, Search, ChevronDown, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Search as SearchInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface StoreOption {
  id: string;
  name: string;
  code: string;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentStore, setStore } = useStore();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mock stores for demo - in real app this would come from API
  const stores: StoreOption[] = [
    { id: '1', name: 'Main Store', code: 'STORE_001' },
    { id: '2', name: 'Downtown Branch', code: 'STORE_002' },
    { id: '3', name: 'Westside Location', code: 'STORE_003' },
  ];

  const handleStoreChange = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setStore(store);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would navigate to search results
    console.log('Search submitted');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section - Brand and Search */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded hover:bg-[#F1F5F9] text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Store Selector */}
          <div className="relative">
            <div className="flex items-center space-x-2 p-2 bg-[#F8FAFC] rounded border border-[#E2E8F0] cursor-pointer hover:bg-white transition-colors">
              <Store className="h-4 w-4 text-[#0176D3]" />
              <span className="text-sm font-medium text-slate-700 truncate max-w-xs">
                {currentStore?.name || 'Select Store'}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </div>
            {/* Dropdown would go here in a full implementation */}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, customers, orders..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                value=""
                onChange={(e) => {}}
                className={cn(
                  "pl-10 pr-3 py-2 w-full rounded border border-slate-300 bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent transition-colors",
                  isSearchFocused && "bg-white"
                )}
              />
            </div>
          </form>
        </div>

        {/* Right Section - Notifications, User */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 rounded hover:bg-[#F1F5F9] text-slate-500 hover:text-slate-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-xs text-white">
                3
              </Badge>
            </button>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-2 rounded hover:bg-[#F1F5F9] text-slate-500 hover:text-slate-700 transition-colors"
              aria-label="User menu"
            >
              <User className="h-4 w-4" />
              <span className="hidden md:block text-sm font-medium text-slate-700">
                {user?.full_name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
            {/* User dropdown would go here */}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded hover:bg-[#F1F5F9] text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}