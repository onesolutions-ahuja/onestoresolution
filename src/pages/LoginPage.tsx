import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Card, Input, Button, FormControl, Label } from '@/components/ui';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();
  const { setStore } = useStore();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';

  // Auto-logout if user already logged in
  useEffect(() => {
    if (login.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [login.isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(username, password, remember.checked);

    if (result.success) {
      // After login, set the store from context if available, otherwise redirect
      if (login.user?.store_id) {
        setStore({
          id: login.user.store_id,
          name: login.user.username || 'My Store',
          code: login.user.username || 'STORE_001',
          is_active: true,
        });
      }
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] p-8">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          OneStoreSolution
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-[#FECACA] text-[#B91C1C] rounded border border-[#FCA5A5] rounded-md mb-4">
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-slate-600 mb-2">
              Username
            </Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-600 mb-2">
              Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded border border-slate-300 px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0176D3]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={false}
                className="rounded border border-slate-300 w-4 h-4 focus:outline-none focus:ring-2 focus:ring-[#0176D3] cursor-pointer"
              />
              <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                Remember me
              </Label>
            </div>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4" />
              ) : (
                'Sign In'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}