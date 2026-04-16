import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Users as UsersIcon } from 'lucide-react';
import { API_URL } from '@/config/api';

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
}

interface AdminUsersResponse {
    totalUsers: number;
    currentPage: number;
    totalPages: number;
    users: AdminUser[];
}

const USERS_PER_PAGE = 20;

const AdminUsers = () => {
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, error, isFetching } = useQuery({
        queryKey: ['adminUsers', page],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/admin/users?page=${page}&limit=${USERS_PER_PAGE}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to fetch users');
            }

            return res.json() as Promise<AdminUsersResponse>;
        }
    });

    const users = data?.users || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-sm text-gray-500">Browse registered customer accounts.</p>
                </div>
                {data && (
                    <span className="text-sm text-gray-500 font-medium">
                        {data.totalUsers} total user{data.totalUsers !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : isError ? (
                    <div className="p-12 text-center text-red-600">
                        {(error as Error)?.message || 'Unable to load users.'}
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center text-gray-500">
                        <UsersIcon className="w-10 h-10 text-gray-300" />
                        <p>No users found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Name</th>
                                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Email</th>
                                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="px-5 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Page {data.currentPage} of {data.totalPages}
                        {isFetching && !isLoading ? ' - Updating...' : ''}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                            disabled={page === 1 || isFetching}
                            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage((currentPage) => Math.min(data.totalPages, currentPage + 1))}
                            disabled={page === data.totalPages || isFetching}
                            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
