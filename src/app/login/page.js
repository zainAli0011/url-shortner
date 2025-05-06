import { LoginForm } from '@/components/login-form';

export const metadata = {
  title: 'Login - shorly.uk',
  description: 'Sign in to your shorly.uk account to manage your shortened URLs.',
};

export default function LoginPage() {
  return (
    <div className="container flex h-[calc(100vh-10rem)] items-center justify-center py-8">
      <LoginForm />
    </div>
  );
} 