import { RegisterForm } from '@/components/register-form';

export const metadata = {
  title: 'Register - shorly.uk',
  description: 'Create a shorly.uk account to manage your shortened URLs.',
};

export default function RegisterPage() {
  return (
    <div className="container flex h-[calc(100vh-10rem)] items-center justify-center py-8">
      <RegisterForm />
    </div>
  );
} 