'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { updateUserProfile } from '@/app/lib/actions';
import { useSession } from 'next-auth/react';

export default function AccountSettings() {
    const { data: session, update } = useSession();
    const [errorMessage, formAction, isPending] = useActionState(
        updateUserProfile,
        undefined,
    );

    const [formData, setFormData] = useState({
        first_name: session?.user?.first_name || '',
        last_name: session?.user?.last_name || '',
        email: session?.user?.email || '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (formData: FormData) => {
        const result = await formAction(formData);
        if (result === 'Profile updated successfully.') {
            // Update the session with new user data
            await update({
                first_name: formData.get('first_name') as string,
                last_name: formData.get('last_name') as string,
                email: formData.get('email') as string,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                id="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                id="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {isPending ? 'Updating...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                    {errorMessage && (
                        <p className="mt-2 text-sm text-red-600">
                            {errorMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
