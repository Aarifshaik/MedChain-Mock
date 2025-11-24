import { LoginForm } from '@/components/Auth/LoginForm';
import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

            <div className="mb-8 flex flex-col items-center">
                <Link href="/" className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Activity className="w-8 h-8 text-primary" />
                    </div>
                </Link>
                <h1 className="text-3xl font-bold text-gradient">MedChain</h1>
            </div>

            <LoginForm />

            <p className="mt-6 text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary hover:underline">
                    Register here
                </Link>
            </p>
        </div>
    );
}
