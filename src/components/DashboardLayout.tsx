'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    FileText,
    Shield,
    Activity,
    LogOut,
    Menu,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'LAB' | 'PHARMACIST' | 'RESEARCHER' | 'INSURER';
}

interface SidebarContentProps {
    role: string;
    pathname: string;
    currentUser: User | null;
    handleLogout: () => void;
}

const SidebarContent = ({ role, pathname, currentUser, handleLogout }: SidebarContentProps) => {
    const links = {
        ADMIN: [
            { href: '/admin', label: 'Overview', icon: LayoutDashboard },
            { href: '/dlt', label: 'DLT Explorer', icon: Activity },
        ],
        DOCTOR: [
            { href: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/dlt', label: 'DLT Explorer', icon: Activity },
        ],
        PATIENT: [
            { href: '/patient', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/dlt', label: 'DLT Explorer', icon: Activity },
        ],
        LAB: [
            { href: '/lab', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/dlt', label: 'DLT Explorer', icon: Activity },
        ],
        PHARMACIST: [
            { href: '/pharmacist', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/dlt', label: 'DLT Explorer', icon: Activity },
        ],
        RESEARCHER: [
            { href: '/researcher', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/dlt', label: 'DLT Explorer', icon: Activity },
        ],
        INSURER: [
            { href: '/insurer', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/dlt', label: 'DLT Explorer', icon: Activity },
        ],
    };

    const currentLinks = links[role as keyof typeof links] || [];

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold text-foreground">
                        <span className="text-gradient">MedChain</span>
                    </span>
                </Link>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2">
                {currentLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link key={link.href} href={link.href}>
                            <Button
                                variant={isActive ? 'secondary' : 'ghost'}
                                className={`w-full justify-start gap-3 transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                {link.label}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <Avatar>
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                            {currentUser?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate text-foreground">{currentUser?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentUser?.role}</p>
                    </div>
                </div>
                <Button 
                    variant="destructive" 
                    className="w-full justify-start gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" 
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
};

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { currentUser, logout } = useUserStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 border-r border-white/10 glass fixed h-full z-30">
                <SidebarContent role={role} pathname={pathname} currentUser={currentUser} handleLogout={handleLogout} />
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full z-40 border-b border-white/10 glass p-4 flex items-center justify-between">
                <span className="font-bold text-lg text-foreground">
                    <span className="text-gradient">MedChain</span>
                </span>
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-white/5">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-r border-white/10 glass">
                        <SidebarContent role={role} pathname={pathname} currentUser={currentUser} handleLogout={handleLogout} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-6 pt-20 md:pt-6 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
