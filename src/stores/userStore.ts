import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface UserState {
    currentUser: User | null;
    users: User[]; // Mock database of all users

    login: (email: string, role: Role) => boolean;
    logout: () => void;
    register: (name: string, email: string, role: Role) => void;
    approveUser: (userId: string) => void;
    rejectUser: (userId: string) => void;
    getUsersByRole: (role: Role) => User[];
}

const HARDCODED_ADMIN: User = {
    id: 'admin-001',
    name: 'System Admin',
    email: 'admin@medchain.com',
    role: 'ADMIN',
    status: 'ACTIVE',
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            users: [HARDCODED_ADMIN], // Initialize with Admin

            login: (email, role) => {
                const user = get().users.find((u) => u.email === email && u.role === role);
                if (user && user.status === 'ACTIVE') {
                    set({ currentUser: user });
                    return true;
                }
                return false;
            },

            logout: () => set({ currentUser: null }),

            register: (name, email, role) => {
                const newUser: User = {
                    id: uuidv4(),
                    name,
                    email,
                    role,
                    status: 'PENDING',
                };
                set((state) => ({ users: [...state.users, newUser] }));
            },

            approveUser: (userId) => {
                set((state) => ({
                    users: state.users.map((u) =>
                        u.id === userId ? { ...u, status: 'ACTIVE' } : u
                    ),
                }));
            },

            rejectUser: (userId) => {
                set((state) => ({
                    users: state.users.map((u) =>
                        u.id === userId ? { ...u, status: 'REJECTED' } : u
                    ),
                }));
            },

            getUsersByRole: (role) => {
                return get().users.filter((u) => u.role === role);
            },
        }),
        {
            name: 'medchain-user-storage',
        }
    )
);
