import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';

  const {
    login,
    isAuthenticated,
    user,
  } = useAuth();

  const { setStore } = useStore();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError(null);
    setIsLoading(true);

    try {
      const result = await login(
        username.trim(),
        password,
        remember
      );

      if (result.success) {
        // Set store information if the logged-in user
        // has a store assigned.
        if (user?.store_id) {
          setStore({
            id: user.store_id,
            name: user.username || 'My Store',
            code: user.username || 'STORE_001',
            is_active: true,
          });
        }

        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] p-8">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl">
        {/* Logo / Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          OneStoreSolution
        </h2>

        <p className="text-center text-sm text-slate-500 mb-6">
          Retail Management System
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-[#FECACA] text-[#B91C1C] rounded-md border border-[#FCA5A5]">
            <span className="font-medium">
              {error}
            </span>
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          {/* Username */}
          <div>
            <Label
              htmlFor="username"
              className="block text-sm font-medium text-slate-600 mb-2"
            >
              Username
            </Label>

            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter your username"
              autoComplete="username"
              disabled={isLoading}
              required
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-slate-600 mb-2"
            >
              Password
            </Label>

            <div className="relative">
              <Input
                id="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
                required
                className="w-full rounded border border-slate-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                disabled={isLoading}
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0176D3]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={remember}
                onChange={(e) =>
                  setRemember(
                    e.target.checked
                  )
                }
                disabled={isLoading}
                className="rounded border border-slate-300 w-4 h-4 focus:outline-none focus:ring-2 focus:ring-[#0176D3] cursor-pointer"
              />

              <Label
                htmlFor="remember"
                className="text-sm text-slate-600 cursor-pointer"
              >
                Remember me
              </Label>
            </div>
          </div>

          {/* Sign In */}
          <Button
            type="submit"
            disabled={
              isLoading ||
              !username.trim() ||
              !password
            }
            className="w-full bg-[#0176D3] hover:bg-[#0176D3]/90 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
