import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Todo App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Organize your tasks with ease
          </p>
          <div className="space-y-4">
            <Link href="/login" className="block">
              <Button className="w-full" size="lg">
                Sign In
              </Button>
            </Link>
            <Link href="/register" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
