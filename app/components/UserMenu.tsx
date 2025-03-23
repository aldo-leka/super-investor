import React from 'react';
import { UserCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface UserMenuProps {
    onAuthClick: () => void;
}

export function UserMenu({ onAuthClick }: UserMenuProps) {
    const { user, isAuthenticated, logout } = useAuthStore();

    if (!isAuthenticated) {
        return (
            <button
                onClick={onAuthClick}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600
                 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-colors
                 shadow-md hover:shadow-lg whitespace-nowrap"
            >
                <UserCircle className="h-5 w-5" />
                <span>Sign In</span>
            </button>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
                 hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
            </button>
        </div>
    );
}