'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold text-foreground">
                        <span className="text-gradient">MedChain</span>
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link 
                        href="/dlt" 
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 hover:scale-105 active:scale-95"
                    >
                        DLT Explorer
                    </Link>
                    <Link href="/login">
                        <Button 
                            variant="outline" 
                            className="border-primary/50 hover:bg-primary/10 text-primary hover:border-primary/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            Login
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
