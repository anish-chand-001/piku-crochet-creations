import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { API_URL } from '@/config/api';

interface Category {
    _id: string;
    name: string;
    createdAt: string;
}

const Categories = () => {
    const [newCategory, setNewCategory] = useState('');
    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: async () => {
            try {
                const res = await fetch(`${API_URL}/categories`);
                if (!res.ok) throw new Error('Failed to fetch categories');
                return res.json() as Promise<Category[]>;
            } catch (error) {
                console.error("Error fetching categories:", error);
                throw error;
            }
        }
    });

    const createMutation = useMutation({
        mutationFn: async (name: string) => {
            try {
                const res = await fetch(`${API_URL}/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name }),
                    credentials: 'include'
                });
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message || 'Failed to create category');
                }
                return res.json();
            } catch (error) {
                console.error("Error creating category:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success('Category created');
            setNewCategory('');
            queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            try {
                const res = await fetch(`${API_URL}/categories/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message || 'Failed to delete category');
                }
                return res.json();
            } catch (error) {
                console.error("Error deleting category:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success('Category deleted');
            queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            createMutation.mutate(newCategory.trim());
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Category</CardTitle>
                        <CardDescription>Create a new category for your crochet products.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="flex gap-4">
                            <Input
                                placeholder="Category Name (e.g., Amigurumi)"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                disabled={createMutation.isPending}
                            />
                            <Button type="submit" disabled={createMutation.isPending || !newCategory.trim()}>
                                {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                Add
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>All Categories</CardTitle>
                        <CardDescription>Manage existing categories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        ) : categories?.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No categories found.</p>
                        ) : (
                            <ul className="space-y-3">
                                {categories?.map((category) => (
                                    <li key={category._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
                                        <span className="font-medium text-gray-800">{category.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete ${category.name}?`)) {
                                                    deleteMutation.mutate(category._id);
                                                }
                                            }}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Categories;
