'use client';

import { create } from 'zustand';
import { AuthState } from '@/types';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    login: async (email: string, password: string) => {
        // Mock login
        const mockUser = {
            id: '1',
            email,
            name: email.split('@')[0],
        };
        set({ user: mockUser, isAuthenticated: true });
    },
    register: async (email: string, password: string, name: string) => {
        // Mock registration
        const mockUser = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            name,
        };
        set({ user: mockUser, isAuthenticated: true });
    },
    logout: () => {
        set({ user: null, isAuthenticated: false });
    },
}));