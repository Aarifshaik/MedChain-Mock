'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { BlockExplorer } from '@/components/DLT/BlockExplorer';
import { useUserStore } from '@/stores/userStore';

export default function DLTPage() {
    const { currentUser } = useUserStore();

    // If no user is logged in, show a generic layout or redirect. 
    // For the demo, we'll assume a "Guest" view or just use the layout with a default role if null.
    // Actually, let's just use 'PATIENT' layout as a fallback for the public explorer view if not logged in,
    // or maybe a separate PublicLayout. But DashboardLayout requires a role.
    // Let's handle the case where currentUser is null.

    const role = currentUser?.role || 'PATIENT'; // Fallback for public view

    return (
        <DashboardLayout role={role}>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gradient">Hyperledger Fabric Explorer</h1>
                    <p className="text-muted-foreground">
                        Real-time visualization of the mock Distributed Ledger.
                    </p>
                </div>
                <BlockExplorer />
            </div>
        </DashboardLayout>
    );
}
