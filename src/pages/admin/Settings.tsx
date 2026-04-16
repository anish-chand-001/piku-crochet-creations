import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { API_URL } from '@/config/api';

const AdminSettings = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegisterAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('New admin registered successfully!');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.message || 'Failed to register admin');
            }
        } catch (error) {
            toast.error('Network error. Could not register admin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
                <p className="text-muted-foreground">
                    Manage your store administrators here.
                </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
                <h3 className="text-lg font-medium border-b pb-4 mb-4">Add New Admin</h3>
                
                <form onSubmit={handleRegisterAdmin} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            placeholder="admin@piku-crochet.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password (Minimum 8 characters)</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={isLoading} className="bg-[#c2185b] hover:bg-[#9c1349]">
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="mr-2 h-4 w-4" />
                            )}
                            Register Admin
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;
